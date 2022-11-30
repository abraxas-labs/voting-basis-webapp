/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ContestService } from '../../core/contest.service';
import { CountingCircleService } from '../../core/counting-circle.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { LanguageService } from '../../core/language.service';
import { Contest, ContestCountingCircleOption, ContestDateAvailability, newContest } from '../../core/models/contest.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-contest-edit-dialog',
  templateUrl: './contest-edit-dialog.component.html',
  styleUrls: ['./contest-edit-dialog.component.scss'],
  providers: [DatePipe],
})
export class ContestEditDialogComponent implements OnInit {
  public readonly now: Date = new Date();

  public data: Contest = newContest();
  public isNew: boolean = true;
  public testingPhaseEnded: boolean;

  public saving: boolean = false;
  public customDateSelected: boolean = false;
  public domainOfInfluences: DomainOfInfluence[] = [];
  public preconfiguredDates: DisplayPreconfiguredDate[] = [];
  public loading: boolean = false;
  public selectedPreconfiguredDate?: DisplayPreconfiguredDate;

  public countingCircleOptionsLoading: boolean = true;
  public countingCircleOptions?: ContestCountingCircleOption[];

  public pastContestsLoading: boolean = false;
  public pastContests: ContestPastDropdownItem[] = [];

  private dialogData: ContestEditDialogData;
  private oldContestDate?: Date;
  private dateStringValue: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ContestEditDialogData>,
    private readonly contestService: ContestService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly countingCircleService: CountingCircleService,
    private readonly i18n: TranslateService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) dialogData: ContestEditDialogData,
  ) {
    this.dialogData = dialogData;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
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
      this.data.endOfTestingPhase < this.data.date &&
      (this.data.endOfTestingPhase > this.now || this.testingPhaseEnded) &&
      !!this.data.domainOfInfluenceId &&
      (!this.data.eVoting ||
        (!!this.data.eVotingFrom && !!this.data.eVotingTo && this.data.eVotingFrom.getTime() < this.data.eVotingTo.getTime()))
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
      }

      // if the user has only one DomainOfInfluence, he doesn't need to choose it
      if (this.domainOfInfluences.length === 1) {
        this.data.domainOfInfluenceId = this.domainOfInfluences[0].id;
      }

      await Promise.all([this.loadCountingCircleOptionsIfNeeded(), this.loadPastContestsIfNeeded()]);
    } finally {
      this.loading = false;
    }
  }

  public async updateDomainOfInfluenceId(doiId: string): Promise<void> {
    if (this.data.domainOfInfluenceId === doiId) {
      return;
    }

    this.data.domainOfInfluenceId = doiId;
    await Promise.all([this.updateCountingCircleOptions(), this.loadPastContestsIfNeeded()]);
  }

  public async updateSelectedPreconfiguredDate(preconfiguredDate: DisplayPreconfiguredDate): Promise<void> {
    if (this.selectedPreconfiguredDate === preconfiguredDate) {
      return;
    }

    this.selectedPreconfiguredDate = preconfiguredDate;
    this.data.date = !!preconfiguredDate ? preconfiguredDate.date : undefined;
    await this.loadPastContestsIfNeeded();
  }

  public async updateDate(date: string): Promise<void> {
    if (!date || this.dateStringValue === date) {
      return;
    }

    this.dateString = date;
    await this.loadPastContestsIfNeeded();
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    if (this.testingPhaseEnded) {
      await this.saveContestAfterTestingPhase();
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

      if (this.data.eVoting) {
        await this.contestService.updateCountingCircleOptions(this.data.id, this.countingCircleOptions ?? []);
      }

      this.closeWithSuccessToast();
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public async loadCountingCircleOptionsIfNeeded(): Promise<void> {
    if (!this.data.eVoting || this.countingCircleOptions !== undefined) {
      return;
    }

    if (this.isNew) {
      this.countingCircleOptions = [];
      await this.updateCountingCircleOptions();
      return;
    }

    try {
      this.countingCircleOptionsLoading = true;
      this.countingCircleOptions = await this.contestService.listCountingCircleOptions(this.data.id);
    } finally {
      this.countingCircleOptionsLoading = false;
    }
  }

  public async updateCountingCircleOptions(): Promise<void> {
    if (!this.data.eVoting || !this.data.domainOfInfluenceId) {
      return;
    }

    try {
      this.countingCircleOptionsLoading = true;
      const countingCircles = await this.countingCircleService.listAssignedForDomainOfInfluence(this.data.domainOfInfluenceId);
      this.countingCircleOptions = countingCircles.map(countingCircle => ({
        countingCircle,
        eVoting: false,
        contestId: this.data.id,
      }));
    } finally {
      this.countingCircleOptionsLoading = false;
    }
  }

  private async saveContestAfterTestingPhase(): Promise<void> {
    if (!this.data.eVoting) {
      return;
    }

    try {
      this.saving = true;
      await this.contestService.updateCountingCircleOptions(this.data.id, this.countingCircleOptions ?? []);
      this.closeWithSuccessToast();
    } finally {
      this.saving = false;
    }
  }

  private async loadPastContestsIfNeeded(): Promise<void> {
    if (!this.data.date || !this.data.domainOfInfluenceId) {
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
