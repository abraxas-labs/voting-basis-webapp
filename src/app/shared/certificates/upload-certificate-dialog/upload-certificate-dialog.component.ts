/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, HostListener, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-certificate-dialog',
  templateUrl: './upload-certificate-dialog.component.html',
  styleUrl: './upload-certificate-dialog.component.scss',
  standalone: false,
})
export class UploadCertificateDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<UploadCertificateDialogData>>(MatDialogRef);
  private readonly saveAction: (rawPem: string) => Promise<void>;

  constructor() {
    const dialogData = inject<UploadCertificateDialogData>(MAT_DIALOG_DATA);
    this.saveAction = dialogData.saveAction;
  }

  public file?: File;
  public fileName?: string;
  public draggingFiles: boolean = false;
  public saving = false;

  @HostListener('window:drop', ['$event'])
  public async onDrop(event: any): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.draggingFiles = false;
    this.file = event.dataTransfer.files[0];
  }

  @HostListener('window:dragover', ['$event'])
  public onDragOver(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggingFiles = true;
  }

  @HostListener('window:dragleave', ['$event'])
  public onDragLeave(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggingFiles = false;
  }

  public async addFilesFromEvent(event: any): Promise<void> {
    this.file = event.target.files[0];
  }

  public removeFile(): void {
    this.file = undefined;
  }

  public async save(): Promise<void> {
    if (!this.file) {
      await this.close();
      return;
    }

    this.saving = true;

    try {
      const rawPem = await this.file.text();
      await this.saveAction(rawPem);
      this.close();
    } finally {
      this.saving = false;
    }
  }

  public async close(): Promise<void> {
    this.dialogRef.close();
  }
}

export interface UploadCertificateDialogData {
  saveAction: (rawPen: string) => Promise<void>;
}
