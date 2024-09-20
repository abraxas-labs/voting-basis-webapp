/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { DatePipe } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { LanguageService } from '../../core/language.service';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { newPoliticalAssembly, PoliticalAssembly } from '../../core/models/political-assembly.model';
import { PoliticalAssemblyService } from '../../core/political-assembly.service';
import { cloneDeep, isEqual } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-political-assembly-edit-dialog',
  templateUrl: './political-assembly-edit-dialog.component.html',
  styleUrls: ['./political-assembly-edit-dialog.component.scss'],
  providers: [DatePipe],
})
export class PoliticalAssemblyEditDialogComponent implements OnInit, OnDestroy {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  public readonly now: Date = new Date();

  public data: PoliticalAssembly = newPoliticalAssembly();
  public isNew: boolean = true;

  public saving: boolean = false;
  public customDateSelected: boolean = false;
  public domainOfInfluences: DomainOfInfluence[] = [];
  public preconfiguredDates: DisplayPreconfiguredDate[] = [];
  public loading: boolean = false;
  public selectedPreconfiguredDate?: DisplayPreconfiguredDate;

  public hasChanges: boolean = false;
  public originalPoliticalAssembly?: PoliticalAssembly;
  public readonly backdropClickSubscription: Subscription;

  private dialogData: PoliticalAssemblyEditDialogData;
  private dateStringValue: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<PoliticalAssemblyEditDialogData>,
    private readonly contestService: ContestService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly politicalAssemblyService: PoliticalAssemblyService,
    private readonly dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) dialogData: PoliticalAssemblyEditDialogData,
  ) {
    this.dialogData = dialogData;

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

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.date &&
      this.data.date > this.now &&
      LanguageService.allLanguagesPresent(this.data.description) &&
      !!this.data.domainOfInfluenceId
    );
  }

  public async ngOnInit(): Promise<void> {
    this.isNew = !this.dialogData.politicalAssemblyId;
    this.loading = true;

    try {
      const [preconfiguredDates, politicalAssembly, domainOfInfluences] = await Promise.all([
        this.contestService.listFuturePreconfiguredDates(),
        this.isNew ? Promise.resolve(this.data) : this.politicalAssemblyService.get(this.dialogData.politicalAssemblyId!),
        this.domainOfInfluenceService.listForCurrentTenant(),
      ]);

      this.data = politicalAssembly;
      this.domainOfInfluences = domainOfInfluences;

      this.preconfiguredDates = preconfiguredDates.map(pcd => {
        return {
          date: pcd.date,
          displayValue: moment(pcd.date).format('L'),
        };
      });

      await this.setDomainOfInfluences();
    } finally {
      this.loading = false;
    }

    this.originalPoliticalAssembly = cloneDeep(this.data);
    this.contentChanged();
  }

  public async updateDomainOfInfluenceId(doiId: string): Promise<void> {
    if (this.data.domainOfInfluenceId === doiId) {
      return;
    }

    this.data.domainOfInfluenceId = doiId;
  }

  public async updateSelectedPreconfiguredDate(preconfiguredDate: DisplayPreconfiguredDate): Promise<void> {
    if (this.selectedPreconfiguredDate === preconfiguredDate) {
      return;
    }

    this.selectedPreconfiguredDate = preconfiguredDate;
    this.data.date = !!preconfiguredDate ? preconfiguredDate.date : undefined;
  }

  public async updateDate(date: string): Promise<void> {
    if (!date || this.dateStringValue === date) {
      return;
    }

    this.dateString = date;
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    try {
      this.saving = true;

      if (this.isNew) {
        this.data.id = await this.politicalAssemblyService.create(this.data);
      } else {
        await this.politicalAssemblyService.update(this.data);
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
    this.hasChanges = !isEqual(this.data, this.originalPoliticalAssembly);
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }

  private closeWithSuccessToast(): void {
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
    const result: PoliticalAssemblyEditDialogResult = {
      politicalAssembly: this.data,
    };
    this.dialogRef.close(result);
  }

  private async setDomainOfInfluences(): Promise<void> {
    if (this.domainOfInfluences.length === 0) {
      return;
    }

    // take first domain of influence since all domain of influences of a tenant should be in the same canton
    const cantonDefaults = await this.domainOfInfluenceService.getCantonDefaults(this.domainOfInfluences[0].id);
    const rootDomainOfInfluences = this.domainOfInfluences.filter(x => !x.parentId);

    // if the user has one or more root DomainOfInfluence and the canton setting to create contest on
    // highest hierarchical level is enabled, only these can be chosen
    if (rootDomainOfInfluences.length > 0 && cantonDefaults.createContestOnHighestHierarchicalLevelEnabled) {
      this.domainOfInfluences = rootDomainOfInfluences;
    }

    // if the user has only one DomainOfInfluence, he doesn't need to choose it
    if (this.domainOfInfluences.length === 1) {
      this.data.domainOfInfluenceId = this.domainOfInfluences[0].id;
    }
  }
}

export interface PoliticalAssemblyEditDialogData {
  politicalAssemblyId?: string;
}

export interface PoliticalAssemblyEditDialogResult {
  politicalAssembly: PoliticalAssembly;
}

export interface DisplayPreconfiguredDate {
  date: Date;
  displayValue: string;
}
