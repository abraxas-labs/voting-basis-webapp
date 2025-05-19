/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ContestService } from '../../core/contest.service';
import { ContestListType } from '../../core/models/contest-list.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContestState } from '../../core/models/contest.model';
import { PoliticalAssemblyService } from '../../core/political-assembly.service';

@Component({
  selector: 'app-contest-archive-dialog',
  templateUrl: './contest-archive-dialog.component.html',
  styleUrls: ['./contest-archive-dialog.component.scss'],
  standalone: false,
})
export class ContestArchiveDialogComponent {
  public archivePer?: Date;
  public saving: boolean = false;
  public readonly now: Date = new Date();
  public readonly listEntry: ContestListType;

  constructor(
    private readonly dialogRef: MatDialogRef<ContestArchiveDialogData>,
    private readonly contestService: ContestService,
    private readonly politicalAssemblyService: PoliticalAssemblyService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: ContestArchiveDialogData,
  ) {
    this.listEntry = dialogData.listEntry;
    this.archivePer = this.listEntry.archivePer;
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
      const immediatelyArchived = !this.archivePer;

      await (this.listEntry.politicalAssembly
        ? this.politicalAssemblyService.archive(this.listEntry.id, this.archivePer)
        : this.contestService.archive(this.listEntry.id, this.archivePer));

      this.listEntry.archivePer = this.archivePer;

      if (immediatelyArchived) {
        this.listEntry.state = ContestState.CONTEST_STATE_ARCHIVED;
        this.listEntry.archivePer = new Date();
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
  listEntry: ContestListType;
}

export interface ContestArchiveDialogResult {
  immediatelyArchived: boolean;
}
