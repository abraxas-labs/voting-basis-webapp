/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import {
  newProportionalElection,
  newProportionalElectionListUnion,
  ProportionalElection,
  ProportionalElectionList,
  ProportionalElectionListUnion,
} from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';
import {
  ProportionalElectionListUnionEditDialogComponent,
  ProportionalElectionListUnionEditDialogData,
  ProportionalElectionListUnionEditDialogResult,
} from '../proportional-election-list-union-edit-dialog/proportional-election-list-union-edit-dialog.component';
import {
  ProportionalElectionListUnionEntriesEditDialogComponent,
  ProportionalElectionListUnionEntriesEditDialogData,
  ProportionalElectionListUnionEntriesEditDialogResult,
} from '../proportional-election-list-union-entries-edit-dialog/proportional-election-list-union-entries-edit-dialog.component';
import {
  ProportionalElectionListUnionMainListEditDialogComponent,
  ProportionalElectionListUnionMainListEditDialogData,
  ProportionalElectionListUnionMainListEditDialogResult,
} from '../proportional-election-list-union-main-list-edit-dialog/proportional-election-list-union-main-list-edit-dialog.component';
import { ProportionalElectionListUnionUtil } from './proportional-election-list-union-util';

@Component({
  selector: 'app-proportional-election-list-unions-dialog',
  templateUrl: './proportional-election-list-unions-dialog.component.html',
  styleUrls: ['./proportional-election-list-unions-dialog.component.scss'],
})
export class ProportionalElectionListUnionsDialogComponent implements OnInit, AfterViewInit {
  public readonly columns = ['number', 'description', 'listEnumeration', 'subListUnionEnumeration', 'mainListNumber', 'actions'];

  public readonly columnsSubList = ['number', 'description', 'listEnumeration', 'mainListNumber', 'actions'];

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public proportionalElection: ProportionalElection = newProportionalElection();
  public lists: ProportionalElectionList[] = [];

  public dataSource: MatTableDataSource<ProportionalElectionListUnion> = new MatTableDataSource<ProportionalElectionListUnion>();
  public dataSourceSubLists: MatTableDataSource<ProportionalElectionListUnion> = new MatTableDataSource<ProportionalElectionListUnion>();
  public selectedListUnion?: ProportionalElectionListUnion;
  public selectedSubListUnion?: ProportionalElectionListUnion;

  public loading: boolean = false;

  constructor(
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly dialogRef: MatDialogRef<ProportionalElectionListUnionsDialogData>,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionListUnionsDialogData,
  ) {
    this.lists = dialogData.lists;
    this.proportionalElection = dialogData.proportionalElection;
  }

  public async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      this.dataSource.data = await this.proportionalElectionService.listListUnions(this.proportionalElection.id);
    } finally {
      this.loading = false;
    }

    this.reorderAndRefreshListUnions();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async createListUnion(rootListUnion?: ProportionalElectionListUnion): Promise<void> {
    const listUnionsWithSameRoot = this.getListUnionsByRoot(rootListUnion);
    const newListUnion = newProportionalElectionListUnion(listUnionsWithSameRoot.length + 1, this.proportionalElection.id, rootListUnion);

    const dialogData: ProportionalElectionListUnionEditDialogData = {
      listUnion: { ...newListUnion },
    };
    const result = await this.dialogService.openForResult<
      ProportionalElectionListUnionEditDialogComponent,
      ProportionalElectionListUnionEditDialogResult
    >(ProportionalElectionListUnionEditDialogComponent, dialogData);
    this.handleCreateListUnion(result?.listUnion);
  }

  public async editListUnion(listUnion: ProportionalElectionListUnion): Promise<void> {
    const dialogData: ProportionalElectionListUnionEditDialogData = {
      listUnion: { ...listUnion },
    };
    const result = await this.dialogService.openForResult<
      ProportionalElectionListUnionEditDialogComponent,
      ProportionalElectionListUnionEditDialogResult
    >(ProportionalElectionListUnionEditDialogComponent, dialogData);
    this.handleEditListUnion(result?.listUnion);
  }

  public async moveListUnion(previousIndex: number, newIndex: number, rootListUnion?: ProportionalElectionListUnion): Promise<void> {
    if (previousIndex === newIndex) {
      return;
    }

    // Can either reorder the list unions or the sub list unions, which are handled the same way
    const listUnions = rootListUnion?.proportionalElectionSubListUnions ?? this.dataSource.data;

    const removedListUnion = listUnions.splice(previousIndex, 1)[0];
    listUnions.splice(newIndex, 0, removedListUnion);

    this.reorderAndRefreshListUnions();
    await this.proportionalElectionService.reorderListUnions(this.proportionalElection.id, listUnions, rootListUnion?.id);
    this.triggerChangeDetectionForListUnions();
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
  }

  public async updateAssignedLists(listUnion: ProportionalElectionListUnion): Promise<void> {
    const availableLists = !listUnion.proportionalElectionRootListUnionId
      ? this.lists
      : this.lists.filter(l => this.selectedListUnion!.proportionalElectionListIds.includes(l.id));

    const dialogData: ProportionalElectionListUnionEntriesEditDialogData = {
      listUnion: { ...listUnion },
      lists: availableLists,
    };

    const result = await this.dialogService.openForResult<
      ProportionalElectionListUnionEntriesEditDialogComponent,
      ProportionalElectionListUnionEntriesEditDialogResult
    >(ProportionalElectionListUnionEntriesEditDialogComponent, dialogData);

    const updatedListUnion = result?.listUnion;
    if (!!updatedListUnion && updatedListUnion.proportionalElectionListIds.length > 0 && (await this.updateMainList(updatedListUnion))) {
      return;
    }
    this.handleEditListUnion(updatedListUnion);
  }

  public async updateMainList(listUnion: ProportionalElectionListUnion): Promise<boolean> {
    const availableLists = this.lists.filter(l => listUnion.proportionalElectionListIds.includes(l.id));

    const dialogData: ProportionalElectionListUnionMainListEditDialogData = {
      listUnion: { ...listUnion },
      lists: availableLists,
    };

    const result = await this.dialogService.openForResult<
      ProportionalElectionListUnionMainListEditDialogComponent,
      ProportionalElectionListUnionMainListEditDialogResult
    >(ProportionalElectionListUnionMainListEditDialogComponent, dialogData);

    this.handleEditListUnion(result?.listUnion);
    return !!result?.listUnion;
  }

  public async deleteListUnion(listUnion: ProportionalElectionListUnion): Promise<void> {
    const shouldDelete = await this.dialogService.confirm(
      'APP.DELETE',
      `PROPORTIONAL_ELECTION.${!listUnion.proportionalElectionRootListUnionId ? 'LIST_UNION' : 'SUB_LIST_UNION'}.CONFIRM_DELETE`,
      'APP.DELETE',
    );
    if (!shouldDelete) {
      return;
    }

    await this.proportionalElectionService.deleteListUnion(listUnion.id);

    const listUnionsWithSameRoot = this.getListUnionsWithSameRoot(listUnion);
    const listUnionIndex = listUnionsWithSameRoot.findIndex(lu => lu.id === listUnion.id);
    if (listUnionIndex < 0) {
      return;
    }
    listUnionsWithSameRoot.splice(listUnionIndex, 1);

    if (!listUnion.proportionalElectionRootListUnionId) {
      this.selectedListUnion = undefined;
    }
    this.selectedSubListUnion = undefined;

    this.reorderAndRefreshListUnions();
    this.triggerChangeDetectionForListUnions();
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public selectListUnion(row: ProportionalElectionListUnion): void {
    this.selectedListUnion = row;
    this.selectedSubListUnion = undefined;
    this.dataSourceSubLists.data = [...this.selectedListUnion.proportionalElectionSubListUnions];
  }

  public selectSubListUnion(row: ProportionalElectionListUnion): void {
    this.selectedSubListUnion = row;
  }

  public close(): void {
    this.dialogRef.close();
  }

  private handleCreateListUnion(listUnion?: ProportionalElectionListUnion): void {
    if (!listUnion) {
      return;
    }

    const listUnionsWithSameRoot = this.getListUnionsWithSameRoot(listUnion);
    listUnionsWithSameRoot.push(listUnion);
    this.reorderAndRefreshListUnions();
    this.triggerChangeDetectionForListUnions();
    this.updateAssignedLists(listUnion);
  }

  private handleEditListUnion(listUnion?: ProportionalElectionListUnion): void {
    if (!listUnion) {
      return;
    }

    if (!listUnion.proportionalElectionRootListUnionId) {
      this.selectedListUnion = listUnion;
    } else {
      this.selectedSubListUnion = listUnion;
    }

    const listUnionsWithSameRoot = this.getListUnionsWithSameRoot(listUnion);
    const existingListUnionIndex = listUnionsWithSameRoot.findIndex(lu => lu.id === listUnion.id);
    if (existingListUnionIndex < 0) {
      return;
    }

    listUnionsWithSameRoot[existingListUnionIndex] = listUnion;

    this.triggerChangeDetectionForListUnions();
    this.reorderAndRefreshListUnions();
  }

  private getListUnionsWithSameRoot(listUnion: ProportionalElectionListUnion): ProportionalElectionListUnion[] {
    if (!listUnion.proportionalElectionRootListUnionId) {
      return this.dataSource.data;
    }

    const root = this.dataSource.data.find(lu => lu.id === listUnion.proportionalElectionRootListUnionId);
    return root?.proportionalElectionSubListUnions ?? [];
  }

  private getListUnionsByRoot(rootListUnion: ProportionalElectionListUnion | undefined): ProportionalElectionListUnion[] {
    if (!rootListUnion) {
      return this.dataSource.data;
    }

    const root = this.dataSource.data.find(lu => lu.id === rootListUnion.id);
    return root?.proportionalElectionSubListUnions ?? [];
  }

  private reorderAndRefreshListUnions(): void {
    ProportionalElectionListUnionUtil.reorderAndRefreshListUnions(this.dataSource.data, this.lists);
  }

  private triggerChangeDetectionForListUnions(): void {
    this.dataSource.data = [...this.dataSource.data];

    if (!!this.selectedListUnion) {
      this.dataSourceSubLists.data = [...this.selectedListUnion.proportionalElectionSubListUnions];
    }
  }
}

export interface ProportionalElectionListUnionsDialogData {
  proportionalElection: ProportionalElection;
  lists: ProportionalElectionList[];
}
