/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ContestService } from '../../core/contest.service';
import { ContestState, ContestSummary } from '../../core/models/contest.model';

@Component({
  selector: 'app-contest-archive-dialog',
  templateUrl: './contest-archive-dialog.component.html',
  styleUrls: ['./contest-archive-dialog.component.scss'],
})
export class ContestArchiveDialogComponent {
  public archivePer?: Date;
  public saving: boolean = false;
  public readonly now: Date = new Date();
  public readonly contest: ContestSummary;

  constructor(
    private readonly dialogRef: MatDialogRef<ContestArchiveDialogData>,
    private readonly contestService: ContestService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: ContestArchiveDialogData,
  ) {
    this.contest = dialogData.contest;
    this.archivePer = this.contest.archivePer;
  }

  public set archivePerString(value: string) {
    if (!value) {
      return;
    }

    this.archivePer = new Date(value);
  }

  public async save(): Promise<void> {
    try {
      this.saving = true;

      await this.contestService.archive(this.contest.id, this.archivePer);

      const immediatelyArchived = !this.archivePer;
      this.contest.archivePer = this.archivePer;

      if (immediatelyArchived) {
        this.contest.state = ContestState.CONTEST_STATE_ARCHIVED;
        this.contest.archivePer = new Date();
        this.snackbarService.success(this.i18n.instant('CONTEST.ARCHIVE.DONE'));
      } else {
        this.snackbarService.success(this.i18n.instant('CONTEST.ARCHIVE.DONE_PER'));
      }

      this.dialogRef.close({ immediatelyArchived } as ContestArchiveDialogResult);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface ContestArchiveDialogData {
  contest: ContestSummary;
}

export interface ContestArchiveDialogResult {
  immediatelyArchived: boolean;
}
