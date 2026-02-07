/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ExportTemplate } from '../../core/models/export.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-export-dialog',
  templateUrl: './export-dialog.component.html',
  styleUrls: ['./export-dialog.component.scss'],
  standalone: false,
})
export class ExportDialogComponent {
  private readonly snackbarService = inject(SnackbarService);
  private readonly i18n = inject(TranslateService);
  private readonly dialogRef = inject<MatDialogRef<ExportDialogComponent>>(MatDialogRef);

  public loading: boolean = false;
  public exportTemplates: ExportTemplate[] = [];

  private readonly downloadFn: (template: ExportTemplate) => Promise<void>;

  constructor() {
    const dialogData = inject<ExportDialogData>(MAT_DIALOG_DATA);

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
