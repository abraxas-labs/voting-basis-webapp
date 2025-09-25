/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService, LanguageService } from '@abraxas/voting-lib';
import { DatePipe } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { Contest, ContestDateAvailability, newContest } from '../../core/models/contest.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { getDefaultTimeDate } from '../../core/utils/time.utils';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';

@Component({
  selector: 'app-contest-edit-dialog',
  templateUrl: './contest-edit-dialog.component.html',
  styleUrls: ['./contest-edit-dialog.component.scss'],
  providers: [DatePipe],
  standalone: false,
})
export class ContestEditDialogComponent implements OnInit, OnDestroy {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  public readonly now: Date = new Date();
  public readonly defaultEndOfTestingPhaseOffsetDate: number = 2;
  public readonly defaultEndOfTestingPhaseTime: Date = new Date('1970-01-01T16:00:00');

  public data: Contest = newContest();
  public isNew: boolean = true;
  public testingPhaseEnded: boolean;

  public saving: boolean = false;
  public customDateSelected: boolean = false;
  public domainOfInfluences: DomainOfInfluence[] = [];
  public preconfiguredDates: DisplayPreconfiguredDate[] = [];
  public loading: boolean = false;
  public selectedPreconfiguredDate?: DisplayPreconfiguredDate;
  public cantonDefaults?: DomainOfInfluenceCantonDefaults;

  public pastContestsLoading: boolean = false;
  public pastContests: ContestPastDropdownItem[] = [];
  public endOfTestingPhaseTimeValue?: Date;
  public eVotingFromTimeValue?: Date;
  public eVotingToTimeValue?: Date;
  private dialogData: ContestEditDialogData;
  private oldContestDate?: Date;
  private dateStringValue: string = '';

  public hasChanges: boolean = false;
  public originalContest?: Contest;
  public readonly backdropClickSubscription: Subscription;

  constructor(
    private readonly dialogRef: MatDialogRef<ContestEditDialogData>,
    private readonly contestService: ContestService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly i18n: TranslateService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) dialogData: ContestEditDialogData,
  ) {
    this.dialogData = dialogData;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;

    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
  }

  public set dateString(value: string) {
    this.data.date = new Date(value);
    this.dateStringValue = value;
  }

  public set endOfTestingPhaseString(value: string) {
    if (!value) {
      return;
    }

    this.data.endOfTestingPhase = new Date(value);
  }

  public set eVotingFromString(value: string) {
    if (!value) {
      return;
    }

    this.data.eVotingFrom = new Date(value);
  }

  public set eVotingToString(value: string) {
    if (!value) {
      return;
    }

    this.data.eVotingTo = new Date(value);
  }

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.date &&
      (this.data.date > this.now || this.testingPhaseEnded) &&
      LanguageService.allLanguagesPresent(this.data.description) &&
      !!this.data.endOfTestingPhase &&
      !!this.endOfTestingPhaseTimeValue &&
      this.data.endOfTestingPhase < this.data.date &&
      (this.data.endOfTestingPhase > this.now || this.testingPhaseEnded) &&
      !!this.data.domainOfInfluenceId &&
      (!this.data.eVoting ||
        (!!this.data.eVotingFrom &&
          !!this.eVotingFromTimeValue &&
          !!this.data.eVotingTo &&
          !!this.eVotingToTimeValue &&
          this.data.eVotingFrom.getTime() < this.data.eVotingTo.getTime()))
    );
  }

  public async ngOnInit(): Promise<void> {
    this.isNew = !this.dialogData.contestId;
    this.loading = true;

    try {
      const [preconfiguredDates, contest, domainOfInfluences] = await Promise.all([
        this.contestService.listFuturePreconfiguredDates(),
        this.isNew ? Promise.resolve(this.data) : this.contestService.get(this.dialogData.contestId!),
        this.domainOfInfluenceService.listForCurrentTenant(),
      ]);

      this.data = contest;
      this.domainOfInfluences = domainOfInfluences;
      this.oldContestDate = this.data.date;

      if (this.data.endOfTestingPhase) {
        // default date 1970-01-01 is necessary, because of the max value (1970-01-02) in the bc-time implementation
        const date = getDefaultTimeDate();
        this.setTime(this.data.endOfTestingPhase, date);
        this.endOfTestingPhaseTimeValue = date;
      }

      if (this.data.eVotingFrom) {
        // default date 1970-01-01 is necessary, because of the max value (1970-01-02) in the bc-time implementation
        const date = getDefaultTimeDate();
        this.setTime(this.data.eVotingFrom, date);
        this.eVotingFromTimeValue = date;
      }

      if (this.data.eVotingTo) {
        // default date 1970-01-01 is necessary, because of the max value (1970-01-02) in the bc-time implementation
        const date = getDefaultTimeDate();
        this.setTime(this.data.eVotingTo, date);
        this.eVotingToTimeValue = date;
      }

      this.preconfiguredDates = preconfiguredDates.map(pcd => {
        return {
          date: pcd.date,
          displayValue: moment(pcd.date).format('L'),
        };
      });
      if (this.dialogData.preconfiguredDate) {
        this.selectedPreconfiguredDate = this.preconfiguredDates.find(
          pcd => pcd.date.getTime() === this.dialogData.preconfiguredDate!.getTime(),
        );
        this.data.date = this.selectedPreconfiguredDate?.date;
        this.updateEndOfTestingPhaseDateAndTime();
      }

      await this.loadCantonDefaults();
      await this.setDomainOfInfluences();
      await this.loadPastContestsIfNeeded();
    } finally {
      this.loading = false;
    }

    this.originalContest = cloneDeep(this.data);
    this.contentChanged();
  }

  public async updateDomainOfInfluenceId(doiId: string): Promise<void> {
    if (this.data.domainOfInfluenceId === doiId) {
      return;
    }

    this.data.domainOfInfluenceId = doiId;
    this.data.domainOfInfluence = this.domainOfInfluences.find(x => x.id === doiId)!;
    await this.loadPastContestsIfNeeded();
  }

  public async updateSelectedPreconfiguredDate(preconfiguredDate: DisplayPreconfiguredDate): Promise<void> {
    if (this.selectedPreconfiguredDate === preconfiguredDate) {
      return;
    }

    this.selectedPreconfiguredDate = preconfiguredDate;
    this.data.date = !!preconfiguredDate ? preconfiguredDate.date : undefined;
    this.updateEndOfTestingPhaseDateAndTime();
    await this.loadPastContestsIfNeeded();
  }

  public async updateDate(date: string): Promise<void> {
    if (!date || this.dateStringValue === date) {
      return;
    }

    this.dateString = date;

    // update end of testing phase only when creating a contest with custom date selection
    if (this.customDateSelected) {
      this.updateEndOfTestingPhaseDateAndTime();
    }

    await this.loadPastContestsIfNeeded();
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    if (!(await this.ensureContestAvailable())) {
      return;
    }

    try {
      this.saving = true;

      if (this.isNew) {
        this.data.id = await this.contestService.create(this.data);
      } else {
        await this.contestService.update(this.data);
      }

      this.hasChanges = false;
      this.closeWithSuccessToast();
    } finally {
      this.saving = false;
    }
  }

  public async closeWithUnsavedChangesCheck(): Promise<void> {
    if (await this.leaveDialogOpen()) {
      return;
    }

    this.dialogRef.close();
  }

  public contentChanged(): void {
    this.hasChanges = !isEqual(this.data, this.originalContest);
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }

  public setTime(time?: Date, date?: Date): void {
    if (!date || !time) {
      return;
    }

    date.setHours(time.getHours());
    date.setMinutes(time.getMinutes());
  }

  public async updateEVotingApprovalDueDate(date: string): Promise<void> {
    this.data.eVotingApprovalDueDate = !date ? undefined : new Date(date);
  }

  private async loadPastContestsIfNeeded(): Promise<void> {
    if (!this.data.date || !this.data.domainOfInfluenceId || this.cantonDefaults?.internalPlausibilisationDisabled) {
      return;
    }

    try {
      this.pastContestsLoading = true;
      this.pastContests = (await this.contestService.listPast(this.data)).map(c => ({
        id: c.id,
        dateString: this.datePipe.transform(c.date, 'dd.MM.yyyy')!,
      }));

      if (!this.pastContests.find(c => c.id === this.data.previousContestId)) {
        this.data.previousContestId = undefined;
      }
    } finally {
      this.pastContestsLoading = false;
    }
  }

  private async ensureContestAvailable(): Promise<boolean> {
    if (!this.isNew && this.oldContestDate?.getTime() === this.data.date?.getTime()) {
      return true;
    }

    let availability: ContestDateAvailability;
    try {
      this.saving = true;
      availability = await this.contestService.checkAvailability(this.data);
    } finally {
      this.saving = false;
    }

    let confirmText;

    switch (availability) {
      case ContestDateAvailability.CONTEST_DATE_AVAILABILITY_AVAILABLE:
        return true;
      case ContestDateAvailability.CONTEST_DATE_AVAILABILITY_ALREADY_EXISTS:
        await this.dialogService.alert('CONTEST.AVAILABILITY', 'CONTEST.ALREADY_EXISTS');
        return false;
      case ContestDateAvailability.CONTEST_DATE_AVAILABILITY_CLOSE_TO_OTHER_CONTEST_DATE:
        confirmText = 'CONTEST.CLOSE_TO_OTHER_CONTEST_DATE';
        break;
      case ContestDateAvailability.CONTEST_DATE_AVAILABILITY_SAME_AS_PRE_CONFIGURED_DATE:
        if (!this.customDateSelected) {
          return true;
        }
        confirmText = 'CONTEST.SAME_AS_PRE_CONFIGURED_DATE';
        break;
      case ContestDateAvailability.CONTEST_DATE_AVAILABILITY_EXISTS_ON_CHILD_TENANT:
        confirmText = 'CONTEST.EXISTS_ON_CHILD_TENANT';
        break;
    }

    return await this.dialogService.confirm('CONTEST.AVAILABILITY', `${confirmText}_QUESTION`, `${confirmText}_CONFIRMATION`);
  }

  private closeWithSuccessToast(): void {
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
    const result: ContestEditDialogResult = {
      contest: this.data,
    };
    this.dialogRef.close(result);
  }

  private updateEndOfTestingPhaseDateAndTime(): void {
    if (!this.data.date) {
      return;
    }

    this.data.endOfTestingPhase = new Date(this.data.date);
    this.data.endOfTestingPhase.setDate(this.data.endOfTestingPhase.getDate() - this.defaultEndOfTestingPhaseOffsetDate);
    this.setTime(this.defaultEndOfTestingPhaseTime, this.data.endOfTestingPhase);
    this.endOfTestingPhaseTimeValue = this.defaultEndOfTestingPhaseTime;
  }

  private async loadCantonDefaults(): Promise<void> {
    if (this.domainOfInfluences.length === 0) {
      return;
    }

    // take first domain of influence since all domain of influences of a tenant should be in the same canton
    this.cantonDefaults = await this.domainOfInfluenceService.getCantonDefaults(this.domainOfInfluences[0].id);
  }

  private async setDomainOfInfluences(): Promise<void> {
    if (!this.cantonDefaults) {
      return;
    }

    const rootDomainOfInfluences = this.domainOfInfluences.filter(x => !x.parentId);

    // if the user has one or more root DomainOfInfluence and the canton setting to create contest on
    // highest hierarchical level is enabled, only these can be chosen
    if (rootDomainOfInfluences.length > 0 && this.cantonDefaults.createContestOnHighestHierarchicalLevelEnabled) {
      this.domainOfInfluences = rootDomainOfInfluences;
    }

    // if the user has only one DomainOfInfluence, he doesn't need to choose it
    if (this.domainOfInfluences.length === 1) {
      this.data.domainOfInfluenceId = this.domainOfInfluences[0].id;
      this.data.domainOfInfluence = this.domainOfInfluences[0];
    }
  }
}

export interface ContestEditDialogData {
  contestId?: string;
  preconfiguredDate?: Date;
  testingPhaseEnded: boolean;
}

export interface ContestEditDialogResult {
  contest: Contest;
}

export interface DisplayPreconfiguredDate {
  date: Date;
  displayValue: string;
}

export type ContestPastDropdownItem = {
  id: string;
  dateString: string;
};
