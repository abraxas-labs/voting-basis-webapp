/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImportService } from '../../../core/import.service';
import { ImportFileContent, ImportType } from '../../../core/models/import.model';
import { MajorityElection, MajorityElectionCandidate, MajorityElectionCandidateProto } from '../../../core/models/majority-election.model';
import { flatMap } from '../../../core/utils/array.utils';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { SimpleStepperComponent } from '@abraxas/base-components';
import { MajorityElectionService } from '../../../core/majority-election.service';

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
  public lastStep: boolean = false;
  public candidates?: MajorityElectionCandidate[];

  private importCandidates?: MajorityElectionCandidateProto[];

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

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
    return !!this.importCandidates && this.importCandidates.length > 0;
  }

  public async stepChange(event: StepperSelectionEvent): Promise<void> {
    this.lastStep = event.selectedIndex === this.stepper.steps.length - 1;
  }

  public importFilesChanged(files: ImportFileContent[]): void {
    if (files.length === 0) {
      delete this.importCandidates;
      delete this.candidates;
      return;
    }

    const majorityElections = flatMap(files.map(c => c.contest.getMajorityElectionsList()));
    this.importCandidates = flatMap(majorityElections.map(m => m.getCandidatesList()));
    this.candidates = this.importCandidates.map(MajorityElectionService.mapToMajorityElectionCandidate);

    // trigger an initial reorder which sets the position to a non-zero distinct integer.
    this.reorderCandidates(this.candidates);
  }

  public reorderCandidates(candidates: MajorityElectionCandidate[]) {
    if (!this.candidates || !this.importCandidates) {
      return;
    }

    for (let i = 1; i <= this.candidates.length; i++) {
      candidates[i - 1].position = i;
      candidates[i - 1].number = '' + i;
    }

    for (const importCandidate of this.importCandidates) {
      const dataCandidate = this.candidates.find(c => c.id === importCandidate.getId())!;
      importCandidate.setPosition(dataCandidate.position);
      importCandidate.setNumber(dataCandidate.number);
    }

    this.importCandidates.sort((a, b) => a.getPosition() - b.getPosition());
  }

  public async save(): Promise<void> {
    if (!this.canSave) {
      return;
    }

    this.saving = true;
    try {
      await this.importService.importMajorityElectionCandidates(this.majorityElectionId, this.importCandidates!);
      const message = this.i18n.instant('IMPORT.IMPORT_SUCCESSFUL');
      this.snackbarService.success(message);

      const result: MajorityElectionCandidatesImportDialogResult = { success: true };
      this.dialogRef.close(result);
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

export interface MajorityElectionCandidatesImportDialogResult {
  success: boolean;
}
