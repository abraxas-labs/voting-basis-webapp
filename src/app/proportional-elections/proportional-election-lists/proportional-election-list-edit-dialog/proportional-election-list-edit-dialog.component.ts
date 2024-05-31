/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, HostListener, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/language.service';
import { ProportionalElectionList, updateProportionalElectionListCandidateCountOk } from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';

@Component({
  selector: 'app-proportional-election-list-edit-dialog',
  templateUrl: './proportional-election-list-edit-dialog.component.html',
  styleUrls: ['./proportional-election-list-edit-dialog.component.scss'],
})
export class ProportionalElectionListEditDialogComponent implements OnDestroy {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  public list: ProportionalElectionList;
  public numberOfMandates: number;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public saving: boolean = false;

  public hasChanges: boolean = false;
  public originalList: ProportionalElectionList;
  public readonly backdropClickSubscription: Subscription;

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionListEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly languageService: LanguageService,
    private readonly dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionListEditDialogData,
  ) {
    this.list = dialogData.list;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.list.id;
    this.numberOfMandates = dialogData.numberOfMandates;
    this.originalList = cloneDeep(this.list);

    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
  }

  public get canSave(): boolean {
    return (
      !!this.list &&
      !!this.list.orderNumber &&
      LanguageService.allLanguagesPresent(this.list.description) &&
      LanguageService.allLanguagesPresent(this.list.shortDescription) &&
      this.list.blankRowCount >= 0 &&
      this.list.blankRowCount <= this.numberOfMandates
    );
  }

  public async save(): Promise<void> {
    if (!this.list || !this.canSave) {
      return;
    }

    try {
      this.saving = true;

      if (this.isNew) {
        this.list = {
          ...this.list,
          id: await this.proportionalElectionService.createList(this.list),
        };
      } else {
        await this.proportionalElectionService.updateList(this.list);
      }

      this.list.orderNumberAndDescription = `${this.list.orderNumber} ${this.languageService.getTranslationForCurrentLang(
        this.list.description,
      )}`;
      updateProportionalElectionListCandidateCountOk(this.list, this.numberOfMandates);

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.hasChanges = false;
      const result: ProportionalElectionListEditDialogResult = {
        list: this.list,
      };
      this.dialogRef.close(result);
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
    this.hasChanges = !isEqual(this.list, this.originalList);
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }
}

export interface ProportionalElectionListEditDialogData {
  list: ProportionalElectionList;
  numberOfMandates: number;
  testingPhaseEnded: boolean;
}

export interface ProportionalElectionListEditDialogResult {
  list: ProportionalElectionList;
}
