/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ViewChild, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImportService } from '../../../core/import.service';
import { Contest } from '../../../core/models/contest.model';
import { ContestImport, ImportFileContent } from '../../../core/models/import.model';
import { flatMap } from '../../../core/utils/array.utils';
import { ImportPoliticalBusinessesComponent } from '../import-political-businesses/import-political-businesses.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './political-business-import-dialog.component.html',
  styleUrls: ['./political-business-import-dialog.component.scss'],
  standalone: false,
})
export class PoliticalBusinessImportDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<PoliticalBusinessImportDialogComponent>>(MatDialogRef);
  private readonly importService = inject(ImportService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly i18n = inject(TranslateService);

  public contestImport?: ContestImport;
  public firstStep: boolean = true;
  public lastStep: boolean = false;
  public saving: boolean = false;

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  // Workaround, since #step3 is used in conjunction with ngIf
  @ViewChild('step2Content', { static: false })
  public step2Content?: ImportPoliticalBusinessesComponent;

  public readonly contestDomainOfInfluenceId: string;
  private readonly contestId: string;

  constructor() {
    const dialogData = inject<PoliticalBusinessImportDialogData>(MAT_DIALOG_DATA);

    this.contestId = dialogData.contest.id;
    this.contestDomainOfInfluenceId = dialogData.contest.domainOfInfluenceId;
  }

  public stepChange(event: StepperSelectionEvent): void {
    this.firstStep = event.selectedIndex === 0;
    this.lastStep = event.selectedIndex === this.stepper.steps.length - 1;
  }

  public importFilesChanged(files: ImportFileContent[]): void {
    if (files.length === 0) {
      delete this.contestImport;
      return;
    }

    const majorityElections = flatMap(files.map(c => c.contest.getMajorityElectionsList()));
    const secondaryMajorityElections = flatMap(files.map(c => c.contest.getSecondaryMajorityElectionsList()));
    const proportionalElections = flatMap(files.map(c => c.contest.getProportionalElectionsList()));
    const votes = flatMap(files.map(c => c.contest.getVotesList()));

    this.contestImport = new ContestImport();
    this.contestImport.setMajorityElectionsList(majorityElections);
    this.contestImport.setSecondaryMajorityElectionsList(secondaryMajorityElections);
    this.contestImport.setProportionalElectionsList(proportionalElections);
    this.contestImport.setVotesList(votes);
  }

  public async save(): Promise<void> {
    if (!this.contestImport) {
      return;
    }

    this.saving = true;
    try {
      await this.importService.importPoliticalBusinesses(this.contestId, this.contestImport);
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

export interface PoliticalBusinessImportDialogData {
  contest: Contest;
}
