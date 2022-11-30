/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterContentChecked, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ImportService } from '../../../core/import.service';
import { Contest } from '../../../core/models/contest.model';
import { ContestImport, ImportFileContent } from '../../../core/models/import.model';
import { flatMap } from '../../../core/utils/array.utils';
import { ImportPoliticalBusinessesComponent } from '../import-political-businesses/import-political-businesses.component';

@Component({
  templateUrl: './political-business-import-dialog.component.html',
})
export class PoliticalBusinessImportDialogComponent implements AfterContentChecked {
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

  constructor(
    private readonly dialogRef: MatDialogRef<PoliticalBusinessImportDialogComponent>,
    private readonly importService: ImportService,
    private readonly cd: ChangeDetectorRef,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    @Inject(MAT_DIALOG_DATA) dialogData: PoliticalBusinessImportDialogData,
  ) {
    this.contestId = dialogData.contest.id;
    this.contestDomainOfInfluenceId = dialogData.contest.domainOfInfluenceId;
  }

  public ngAfterContentChecked(): void {
    // prevent mat-stepper from showing other icon types, which it does by default
    this.stepper._getIndicatorType = () => 'number';
    this.cd.detectChanges();
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
    const proportionalElections = flatMap(files.map(c => c.contest.getProportionalElectionsList()));
    const votes = flatMap(files.map(c => c.contest.getVotesList()));

    this.contestImport = new ContestImport();
    this.contestImport.setMajorityElectionsList(majorityElections);
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
