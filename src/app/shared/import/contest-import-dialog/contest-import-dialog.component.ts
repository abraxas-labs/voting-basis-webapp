/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfterContentChecked, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ImportService } from '../../../core/import.service';
import { ContestImport, ImportFileContent } from '../../../core/models/import.model';
import { ImportPoliticalBusinessesComponent } from '../import-political-businesses/import-political-businesses.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './contest-import-dialog.component.html',
})
export class ContestImportDialogComponent implements AfterContentChecked {
  public importFiles: ImportFileContent[] = [];
  public contestImport?: ContestImport;
  public contestDomainOfInfluenceId?: string;
  public firstStep: boolean = true;
  public lastStep: boolean = false;
  public saving: boolean = false;

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  // Workaround, since #step3 is used in conjunction with ngIf
  @ViewChild('step3Content', { static: false })
  public step3Content?: ImportPoliticalBusinessesComponent;

  constructor(
    private readonly dialogRef: MatDialogRef<ContestImportDialogComponent>,
    private readonly importService: ImportService,
    private readonly cd: ChangeDetectorRef,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
  ) {}

  public ngAfterContentChecked(): void {
    // prevent mat-stepper from showing other icon types, which it does by default
    this.stepper._getIndicatorType = () => 'number';
    this.cd.detectChanges();
  }

  public stepChange(event: StepperSelectionEvent): void {
    this.firstStep = event.selectedIndex === 0;
    this.lastStep = event.selectedIndex === this.stepper.steps.length - 1;
  }

  public async save(): Promise<void> {
    if (!this.contestImport) {
      return;
    }

    this.saving = true;
    try {
      await this.importService.importContest(this.contestImport);
      const message = this.i18n.instant('IMPORT.IMPORT_SUCCESSFUL');
      this.snackbarService.success(message);
      this.dialogRef.close();
    } finally {
      this.saving = false;
    }
  }

  public setContestImport(contestImport?: ContestImport): void {
    this.contestImport = contestImport;
    this.contestDomainOfInfluenceId = contestImport?.getContest()?.getDomainOfInfluenceId();
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}
