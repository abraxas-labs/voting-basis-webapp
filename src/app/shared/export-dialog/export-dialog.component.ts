/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportTemplate } from '../../core/models/export.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
})
export class ExportDialogComponent {
  public loading: boolean = true;
  public exportTemplates: ExportTemplate[] = [];

  private readonly downloadFn: (template: ExportTemplate) => Promise<void>;

  constructor(
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly dialogRef: MatDialogRef<ExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: ExportDialogData,
  ) {
    this.downloadFn = dialogData.download;
    this.exportTemplates = dialogData.templates;
  }

  public async downloadExport(exportTemplate: ExportTemplate): Promise<void> {
    this.loading = true;
    try {
      await this.downloadFn(exportTemplate);
      this.dialogRef.close();
      this.snackbarService.success(this.i18n.instant('EXPORTS.SUCCESS'));
    } finally {
      this.loading = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface ExportDialogData {
  templates: ExportTemplate[];
  download(template: ExportTemplate): Promise<void>;
}
