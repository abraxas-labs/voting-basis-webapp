/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImportService } from '../../../core/import.service';
import { ImportFileContent, ImportType } from '../../../core/models/import.model';
import { MajorityElection, MajorityElectionCandidateProto } from '../../../core/models/majority-election.model';
import { flatMap } from '../../../core/utils/array.utils';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-majority-election-candidates-import-dialog',
  templateUrl: './majority-election-candidates-import-dialog.component.html',
  styleUrls: ['./majority-election-candidates-import-dialog.component.scss'],
  standalone: false,
})
export class MajorityElectionCandidatesImportDialogComponent {
  public saving: boolean = false;
  public readonly importTypes: ImportType[] = [ImportType.IMPORT_TYPE_ECH_157];
  private readonly majorityElectionId: string;

  private majorityElectionCandidates?: MajorityElectionCandidateProto[];

  constructor(
    private readonly dialogRef: MatDialogRef<MajorityElectionCandidatesImportDialogComponent>,
    private readonly importService: ImportService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    @Inject(MAT_DIALOG_DATA) dialogData: MajorityElectionCandidatesImportDialogData,
  ) {
    this.majorityElectionId = dialogData.majorityElection.id;
  }

  public get canSave(): boolean {
    return !!this.majorityElectionCandidates && this.majorityElectionCandidates.length > 0;
  }

  public importFilesChanged(files: ImportFileContent[]): void {
    if (files.length === 0) {
      delete this.majorityElectionCandidates;
      return;
    }

    const majorityElections = flatMap(files.map(c => c.contest.getMajorityElectionsList()));
    this.majorityElectionCandidates = flatMap(majorityElections.map(m => m.getCandidatesList()));
  }

  public async save(): Promise<void> {
    if (!this.canSave) {
      return;
    }

    this.saving = true;
    try {
      await this.importService.importMajorityElectionCandidates(this.majorityElectionId, this.majorityElectionCandidates!);
      const message = this.i18n.instant('IMPORT.IMPORT_SUCCESSFUL');
      this.snackbarService.success(message);
      this.dialogRef.close();
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface MajorityElectionCandidatesImportDialogData {
  majorityElection: MajorityElection;
}
