/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Inject, OnInit } from '@angular/core';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { EnumUtil } from '@abraxas/voting-lib';

@Component({
  selector: 'app-counting-circle-electorate-assign-dialog',
  templateUrl: './counting-circle-electorate-assign-dialog.component.html',
  styleUrls: ['./counting-circle-electorate-assign-dialog.component.scss'],
})
export class CountingCircleElectorateAssignDialogComponent {
  public readonly columns = ['select', 'domainOfInfluenceType'];
  public readonly columnsSelected = ['domainOfInfluenceType'];

  public dataSource: MatTableDataSource<DomainOfInfluenceType> = new MatTableDataSource<DomainOfInfluenceType>();
  public selection = new SelectionModel<DomainOfInfluenceType>(true, []);
  public isAllSelected: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<CountingCircleElectorateAssignDialogData>,
    @Inject(MAT_DIALOG_DATA) dialogData: CountingCircleElectorateAssignDialogData,
  ) {
    this.dataSource.data = EnumUtil.getArray<DomainOfInfluenceType>(DomainOfInfluenceType)
      .map(i => i.value)
      .filter(t => !dialogData.disabledDomainOfInfluenceTypes.includes(t));

    const selected = this.dataSource.data.filter(x => dialogData.assignedDomainOfInfluenceTypes.includes(x));
    this.selection.select(...selected);
  }

  public close(): void {
    this.dialogRef.close();
  }

  public save(): void {
    const selected = this.selection.selected;
    selected.sort((a, b) => a - b); // ascending sort by domain of influence type.

    const result: CountingCircleElectorateAssignDialogResult = {
      assignedDomainOfInfluenceTypes: this.selection.selected,
    };
    this.dialogRef.close(result);
  }

  public toggleAllRows(value: boolean) {
    if (value === this.isAllSelected) {
      return;
    }

    value ? this.selection.select(...this.dataSource.data) : this.selection.clear();
    this.updateIsAllSelected();
  }

  public toggleRow(row: DomainOfInfluenceType, value: boolean): void {
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

export interface CountingCircleElectorateAssignDialogData {
  assignedDomainOfInfluenceTypes: DomainOfInfluenceType[];
  disabledDomainOfInfluenceTypes: DomainOfInfluenceType[];
}

export interface CountingCircleElectorateAssignDialogResult {
  assignedDomainOfInfluenceTypes: DomainOfInfluenceType[];
}
