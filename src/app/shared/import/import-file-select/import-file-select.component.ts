/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { ImportService } from '../../../core/import.service';
import { ImportFileContent, ImportType } from '../../../core/models/import.model';
import { TableDataSource } from '@abraxas/base-components';

@Component({
  selector: 'app-import-file-select',
  templateUrl: './import-file-select.component.html',
  styleUrls: ['./import-file-select.component.scss'],
})
export class ImportFileSelectComponent {
  public readonly columns = ['filename', 'type', 'actions'];
  public dataSource: TableDataSource<ImportFileContent> = new TableDataSource<ImportFileContent>();
  public importTypeItemDescriptions: EnumItemDescription<ImportType>[] = [];
  public draggingFiles: boolean = false;
  public selectedEchType?: ImportType;
  public loading: boolean = false;

  @Output()
  public importsChange: EventEmitter<ImportFileContent[]> = new EventEmitter<ImportFileContent[]>();

  private importTypesValue: ImportType[] = [];

  @ViewChild('fileInput', { static: false })
  private fileInput!: ElementRef;

  constructor(
    private readonly enumUtil: EnumUtil,
    private readonly importService: ImportService,
  ) {
    this.importTypes = [ImportType.IMPORT_TYPE_ECH_159, ImportType.IMPORT_TYPE_ECH_157];
  }

  public get importTypes(): ImportType[] {
    return this.importTypesValue;
  }

  @Input()
  public set importTypes(v: ImportType[]) {
    if (this.importTypesValue === v) {
      return;
    }

    if (!v || v.length === 0) {
      this.importTypeItemDescriptions = [];
      this.selectedEchType = undefined;
      return;
    }

    this.importTypeItemDescriptions = this.enumUtil
      .getArrayWithDescriptions<ImportType>(ImportType, 'IMPORT.TYPES.')
      .filter(i => v.includes(i.value));

    this.selectedEchType = v[0];
  }

  @HostListener('window:drop', ['$event'])
  public async onDrop(e: any): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    this.draggingFiles = false;
    await this.processFiles(e.dataTransfer.files);
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
    await this.processFiles(event.target.files);
    // clear file input, otherwise the same file cannot be uploaded again
    this.fileInput.nativeElement.value = null;
  }

  public async processFiles(files: FileList): Promise<void> {
    if (this.selectedEchType === undefined) {
      return;
    }

    this.loading = true;
    try {
      const importFiles = await this.importService.resolveImportFiles(this.selectedEchType, files);
      this.dataSource.data = [...this.dataSource.data, ...importFiles];
      this.emitImportsChange();
    } finally {
      this.loading = false;
    }
  }

  public removeFile(file: ImportFileContent): void {
    const index = this.dataSource.data.indexOf(file);
    if (index >= 0) {
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.emitImportsChange();
    }
  }

  private emitImportsChange(): void {
    this.importsChange.emit(this.dataSource.data);
  }
}
