/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ProportionalElectionList, ProportionalElectionListUnion } from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-proportional-election-list-union-main-list-edit-dialog',
  templateUrl: './proportional-election-list-union-main-list-edit-dialog.component.html',
  styleUrls: ['./proportional-election-list-union-main-list-edit-dialog.component.scss'],
  standalone: false,
})
export class ProportionalElectionListUnionMainListEditDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ProportionalElectionListUnionMainListEditDialogData>>(MatDialogRef);
  private readonly i18n = inject(TranslateService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly proportionalElectionService = inject(ProportionalElectionService);

  public data: ProportionalElectionListUnion;
  public lists: ProportionalElectionList[] = [];
  public saving: boolean = false;
  public noMainList: boolean = true;

  constructor() {
    const dialogData = inject<ProportionalElectionListUnionMainListEditDialogData>(MAT_DIALOG_DATA);

    this.data = dialogData.listUnion;
    this.lists = dialogData.lists;
  }

  public async save(): Promise<void> {
    try {
      this.saving = true;
      await this.proportionalElectionService.updateListUnionMainList(this.data.id, this.data.proportionalElectionMainListId);

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: ProportionalElectionListUnionMainListEditDialogResult = {
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

  public setMainListId(value: string): void {
    this.data.proportionalElectionMainListId = value;

    if (!!value) {
      this.noMainList = false;
    }
  }

  public setNoMainList(value: boolean): void {
    this.noMainList = value;

    if (this.noMainList) {
      this.data.proportionalElectionMainListId = '';
    }
  }
}

export interface ProportionalElectionListUnionMainListEditDialogData {
  listUnion: ProportionalElectionListUnion;
  lists: ProportionalElectionList[];
}

export interface ProportionalElectionListUnionMainListEditDialogResult {
  listUnion: ProportionalElectionListUnion;
}
