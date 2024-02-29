/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ExportService } from '../../core/export.service';
import { ExportGenerator, ExportTemplate } from '../../core/models/export.model';

@Component({
  selector: 'app-export-configuration-assign-dialog',
  templateUrl: './export-configuration-assign-dialog.component.html',
  styleUrls: ['./export-configuration-assign-dialog.component.scss'],
})
export class ExportConfigurationAssignDialogComponent implements OnInit, AfterViewInit {
  public readonly columns = ['select', 'description', 'format'];
  public readonly columnsSelected = ['description', 'actions'];
  public loading: boolean = true;

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public dataSource: MatTableDataSource<ExportTemplate> = new MatTableDataSource<ExportTemplate>();
  public selection = new SelectionModel<ExportTemplate>(true, []);
  public isAllSelected: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<ExportConfigurationAssignDialogData>,
    private readonly cd: ChangeDetectorRef,
    private readonly exportService: ExportService,
    @Inject(MAT_DIALOG_DATA) private readonly dialogData: ExportConfigurationAssignDialogData,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      this.dataSource.data = await this.exportService.getTemplates(ExportGenerator.EXPORT_GENERATOR_VOTING_AUSMITTLUNG);

      const selected = this.dataSource.data.filter(x => this.dialogData.assignedKeys.includes(x.key));
      this.selection.select(...selected);
    } finally {
      this.loading = false;
    }
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public close(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.selection.selected.map(x => x.key));
  }

  public toggleAllRows(value: boolean) {
    if (value === this.isAllSelected) {
      return;
    }

    value ? this.selection.select(...this.dataSource.data) : this.selection.clear();
    this.updateIsAllSelected();
  }

  public toggleRow(row: ExportTemplate, value: boolean): void {
    if (value === this.selection.isSelected(row)) {
      return;
    }

    this.selection.toggle(row);
    this.updateIsAllSelected();
  }

  public updateIsAllSelected(): void {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    this.isAllSelected = numSelected === numRows;
  }
}

export interface ExportConfigurationAssignDialogData {
  assignedKeys: string[];
}
