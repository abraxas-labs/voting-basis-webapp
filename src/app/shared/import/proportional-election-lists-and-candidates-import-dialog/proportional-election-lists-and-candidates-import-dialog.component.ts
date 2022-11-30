/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ImportService } from '../../../core/import.service';
import { ImportFileContent, ImportType, ProportionalElectionListImport } from '../../../core/models/import.model';
import { ProportionalElection, ProportionalElectionListUnionProto } from '../../../core/models/proportional-election.model';
import { flatMap } from '../../../core/utils/array.utils';

@Component({
  selector: 'app-proportional-election-lists-and-candidates-import-dialog',
  templateUrl: './proportional-election-lists-and-candidates-import-dialog.component.html',
})
export class ProportionalElectionListsAndCandidatesImportDialogComponent {
  public saving: boolean = false;
  public readonly importTypes: ImportType[] = [ImportType.IMPORT_TYPE_ECH_157];
  private readonly proportionalElectionId: string;

  private proportionalElectionLists?: ProportionalElectionListImport[];
  private proportionalElectionListUnions?: ProportionalElectionListUnionProto[];

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionListsAndCandidatesImportDialogComponent>,
    private readonly importService: ImportService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionListsAndCandidatesImportDialogData,
  ) {
    this.proportionalElectionId = dialogData.proportionalElection.id;
  }

  public get canSave(): boolean {
    return (
      (!!this.proportionalElectionLists && this.proportionalElectionLists.length > 0) ||
      (!!this.proportionalElectionListUnions && this.proportionalElectionListUnions.length > 0)
    );
  }

  public importFilesChanged(files: ImportFileContent[]): void {
    if (files.length === 0) {
      delete this.proportionalElectionLists;
      delete this.proportionalElectionListUnions;
      return;
    }

    const proportionalElections = flatMap(files.map(c => c.contest.getProportionalElectionsList()));
    this.proportionalElectionLists = flatMap(proportionalElections.map(m => m.getListsList()));
    this.proportionalElectionListUnions = flatMap(proportionalElections.map(m => m.getListUnionsList()));
  }

  public async save(): Promise<void> {
    if (!this.canSave) {
      return;
    }

    this.saving = true;
    try {
      await this.importService.importProportionalElectionListsAndCandidates(
        this.proportionalElectionId,
        this.proportionalElectionLists ?? [],
        this.proportionalElectionListUnions ?? [],
      );

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

export interface ProportionalElectionListsAndCandidatesImportDialogData {
  proportionalElection: ProportionalElection;
}
