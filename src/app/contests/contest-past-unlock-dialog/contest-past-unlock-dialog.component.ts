/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContestService } from '../../core/contest.service';
import { ContestState, ContestSummary } from '../../core/models/contest.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contest-past-unlock-dialog',
  templateUrl: './contest-past-unlock-dialog.component.html',
  standalone: false,
})
export class ContestPastUnlockDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ContestPastUnlockDialogData>>(MatDialogRef);
  private readonly contestService = inject(ContestService);
  private readonly i18n = inject(TranslateService);
  private readonly snackbarService = inject(SnackbarService);

  public saving: boolean = false;
  public readonly contest: ContestSummary;

  constructor() {
    const dialogData = inject<ContestPastUnlockDialogData>(MAT_DIALOG_DATA);

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
