/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ProportionalElectionList, ProportionalElectionListUnion } from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';

@Component({
  selector: 'app-proportional-election-list-union-entries-edit-dialog',
  templateUrl: './proportional-election-list-union-entries-edit-dialog.component.html',
  styleUrls: ['./proportional-election-list-union-entries-edit-dialog.component.scss'],
})
export class ProportionalElectionListUnionEntriesEditDialogComponent implements AfterViewInit {
  public readonly columns = ['select', 'orderNumber', 'shortDescription'];
  public readonly columnsSelected = ['orderNumber', 'shortDescription', 'actions'];

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public data: ProportionalElectionListUnion;
  public saving: boolean = false;
  public listUnionTitleType: string = '';

  public dataSource: MatTableDataSource<ProportionalElectionList> = new MatTableDataSource<ProportionalElectionList>();
  public selection = new SelectionModel<ProportionalElectionList>(true, []);
  public isAllSelected: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionListUnionEntriesEditDialogData>,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionListUnionEntriesEditDialogData,
  ) {
    this.data = dialogData.listUnion;
    this.dataSource.data = dialogData.lists;
    this.listUnionTitleType = this.data.proportionalElectionRootListUnionId ? 'SUB_LIST_UNION' : 'LIST_UNION';
    const selectedListIds = this.data.proportionalElectionListIds;
    this.selection = new SelectionModel<ProportionalElectionList>(
      true,
      this.dataSource.data.filter(l => selectedListIds.some(listId => listId === l.id)),
    );
    this.updateIsAllSelected();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async save(): Promise<void> {
    const newListIds = this.selection.selected.map(list => list.id);

    try {
      this.saving = true;

      await this.proportionalElectionService.updateListUnionEntries(this.data.id, newListIds);

      this.data.proportionalElectionListIds = newListIds;

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: ProportionalElectionListUnionEntriesEditDialogResult = {
        listUnion: this.data,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public toggleAllRows(value: boolean) {
    if (value === this.isAllSelected) {
      return;
    }

    value ? this.selection.select(...this.dataSource.data) : this.selection.clear();
    this.updateIsAllSelected();
  }

  public updateIsAllSelected(): void {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    this.isAllSelected = numSelected === numRows;
  }

  public toggleRow(row: ProportionalElectionList): void {
    this.selection.toggle(row);
    this.updateIsAllSelected();
  }

  public toggleRowWithValue(row: ProportionalElectionList, value: boolean): void {
    if (value === this.selection.isSelected(row)) {
      return;
    }

    this.toggleRow(row);
  }
}

export interface ProportionalElectionListUnionEntriesEditDialogData {
  listUnion: ProportionalElectionListUnion;
  lists: ProportionalElectionList[];
}

export interface ProportionalElectionListUnionEntriesEditDialogResult {
  listUnion: ProportionalElectionListUnion;
}
