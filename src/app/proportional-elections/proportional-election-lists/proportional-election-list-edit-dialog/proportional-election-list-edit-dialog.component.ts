/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/language.service';
import { ProportionalElectionList, updateProportionalElectionListCandidateCountOk } from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';

@Component({
  selector: 'app-proportional-election-list-edit-dialog',
  templateUrl: './proportional-election-list-edit-dialog.component.html',
  styleUrls: ['./proportional-election-list-edit-dialog.component.scss'],
})
export class ProportionalElectionListEditDialogComponent {
  public list: ProportionalElectionList;
  public numberOfMandates: number;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public saving: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionListEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionListEditDialogData,
  ) {
    this.list = dialogData.list;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.list.id;
    this.numberOfMandates = dialogData.numberOfMandates;
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
      const result: ProportionalElectionListEditDialogResult = {
        list: this.list,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
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
