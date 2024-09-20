/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContestService } from '../../core/contest.service';
import { ContestState, ContestSummary } from '../../core/models/contest.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contest-past-unlock-dialog',
  templateUrl: './contest-past-unlock-dialog.component.html',
})
export class ContestPastUnlockDialogComponent {
  public saving: boolean = false;
  public readonly contest: ContestSummary;

  constructor(
    private readonly dialogRef: MatDialogRef<ContestPastUnlockDialogData>,
    private readonly contestService: ContestService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: ContestPastUnlockDialogData,
  ) {
    this.contest = dialogData.contest;
  }

  public async save(): Promise<void> {
    try {
      this.saving = true;

      await this.contestService.pastUnlock(this.contest.id);
      this.contest.state = ContestState.CONTEST_STATE_PAST_UNLOCKED;
      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.dialogRef.close();
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface ContestPastUnlockDialogData {
  contest: ContestSummary;
}
