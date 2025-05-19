/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService, LanguageService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProportionalElectionListUnion } from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-proportional-election-list-union-edit-dialog',
  templateUrl: './proportional-election-list-union-edit-dialog.component.html',
  standalone: false,
})
export class ProportionalElectionListUnionEditDialogComponent {
  public data: ProportionalElectionListUnion;
  public isNew: boolean = false;
  public saving: boolean = false;
  public listUnionTitleType: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionListUnionEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly proportionalElectionService: ProportionalElectionService,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionListUnionEditDialogData,
  ) {
    this.data = dialogData.listUnion;
    this.isNew = !this.data.id;
    this.listUnionTitleType = this.data.proportionalElectionRootListUnionId ? 'SUB_LIST_UNION' : 'LIST_UNION';
  }

  public get canSave(): boolean {
    return !!this.data && LanguageService.allLanguagesPresent(this.data.description);
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    try {
      this.saving = true;

      if (this.isNew) {
        this.data.id = await this.proportionalElectionService.createListUnion(this.data);
      } else {
        await this.proportionalElectionService.updateListUnion(this.data);
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: ProportionalElectionListUnionEditDialogResult = {
        listUnion: this.data,
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

export interface ProportionalElectionListUnionEditDialogData {
  listUnion: ProportionalElectionListUnion;
}

export interface ProportionalElectionListUnionEditDialogResult {
  listUnion: ProportionalElectionListUnion;
}
