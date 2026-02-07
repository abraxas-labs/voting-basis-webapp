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
import { ContestImport, ImportFileContent } from '../../../core/models/import.model';
import { ImportPoliticalBusinessesComponent } from '../import-political-businesses/import-political-businesses.component';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './contest-import-dialog.component.html',
  styleUrls: ['./contest-import-dialog.component.scss'],
  standalone: false,
})
export class ContestImportDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ContestImportDialogComponent>>(MatDialogRef);
  private readonly importService = inject(ImportService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly i18n = inject(TranslateService);

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
