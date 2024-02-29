/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionUnionService } from '../../core/majority-election-union.service';
import { PoliticalBusinessUnion, PoliticalBusinessUnionType } from '../../core/models/political-business-union.model';
import { PoliticalBusiness } from '../../core/models/political-business.model';
import { ProportionalElectionUnionService } from '../../core/proportional-election-union.service';

@Component({
  selector: 'app-political-business-union-entries-edit-dialog',
  templateUrl: './political-business-union-entries-edit-dialog.component.html',
  styleUrls: ['./political-business-union-entries-edit-dialog.component.scss'],
})
export class PoliticalBusinessUnionEntriesEditDialogComponent implements AfterViewInit {
  public readonly columns = ['select', 'politicalBusinessNumber', 'shortDescription'];
  public readonly columnsSelected = ['politicalBusinessNumber', 'actions'];
  public readonly dataSource: MatTableDataSource<PoliticalBusiness> = new MatTableDataSource<PoliticalBusiness>();
  public selection = new SelectionModel<PoliticalBusiness>(true, []);
  public isAllSelected: boolean = false;

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public data: PoliticalBusinessUnion;
  public saving: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<PoliticalBusinessUnionEntriesEditDialogData>,
    private readonly proportionalElectionUnionService: ProportionalElectionUnionService,
    private readonly majorityElectionUnionService: MajorityElectionUnionService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: PoliticalBusinessUnionEntriesEditDialogData,
  ) {
    this.data = dialogData.politicalBusinessUnion;
    this.dataSource.data = dialogData.selectablePoliticalBusinesses;
    const selectedPoliticalBusinessIds = this.data.politicalBusinesses?.map(pb => pb.id) ?? [];
    this.selection = new SelectionModel<PoliticalBusiness>(
      true,
      this.dataSource.data.filter(l => selectedPoliticalBusinessIds.some(id => id === l.id)),
    );
    this.updateIsAllSelected();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async save(): Promise<void> {
    const newPbIds = this.selection.selected.map(list => list.id);

    try {
      this.saving = true;

      if (this.data.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION) {
        await this.proportionalElectionUnionService.updateEntries(this.data.id, newPbIds);
      } else {
        await this.majorityElectionUnionService.updateEntries(this.data.id, newPbIds);
      }

      this.data.politicalBusinesses = this.dataSource.data.filter(pb => newPbIds.includes(pb.id));
      const result: PoliticalBusinessUnionEntriesEditDialogResult = {
        politicalBusinessUnion: this.data,
      };
      this.dialogRef.close(result);
      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
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

  public toggleRowWithValue(row: PoliticalBusiness, value: boolean): void {
    if (value === this.selection.isSelected(row)) {
      return;
    }

    this.toggleRow(row);
  }

  public toggleRow(row: PoliticalBusiness): void {
    this.selection.toggle(row);
    this.updateIsAllSelected();
  }
}

export interface PoliticalBusinessUnionEntriesEditDialogData {
  politicalBusinessUnion: PoliticalBusinessUnion;
  selectablePoliticalBusinesses: PoliticalBusiness[];
}

export interface PoliticalBusinessUnionEntriesEditDialogResult {
  politicalBusinessUnion: PoliticalBusinessUnion;
}
