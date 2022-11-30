/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluenceCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { RolesService } from '../../core/roles.service';

@Component({
  selector: 'app-domain-of-influence-counting-circle-assign-dialog',
  templateUrl: './domain-of-influence-counting-circle-assign-dialog.component.html',
  styleUrls: ['./domain-of-influence-counting-circle-assign-dialog.component.scss'],
})
export class DomainOfInfluenceCountingCircleAssignDialogComponent implements AfterViewInit, OnInit {
  public readonly columns = ['select', 'name', 'bfs', 'authority'];
  public readonly columnsSelected = ['name', 'actions'];
  public readonly columnsInherited = ['name'];

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public data: DomainOfInfluence;
  public saving: boolean = false;
  public isAdmin: boolean = false;

  public dataSource: MatTableDataSource<DomainOfInfluenceCountingCircle> = new MatTableDataSource<DomainOfInfluenceCountingCircle>();
  public inheritedCountingCircles: DomainOfInfluenceCountingCircle[] = [];
  public selection: SelectionModel<DomainOfInfluenceCountingCircle>;
  public isAllSelected: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<DomainOfInfluenceCountingCircleAssignDialogData>,
    private readonly rolesService: RolesService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: DomainOfInfluenceCountingCircleAssignDialogData,
  ) {
    this.data = dialogData.domainOfInfluence;
    this.inheritedCountingCircles = this.data.countingCircles?.filter(cc => cc.inherited) ?? [];
    this.dataSource.data = dialogData.countingCircles;

    const selectedCountingCircles = this.data.countingCircles ?? [];
    this.selection = new SelectionModel<DomainOfInfluenceCountingCircle>(
      true,
      dialogData.countingCircles.filter(cc => selectedCountingCircles.some(dicc => dicc.id === cc.id)),
    );
    this.updateIsAllSelected();
  }

  public async ngOnInit(): Promise<void> {
    this.isAdmin = await this.rolesService.isAdmin();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async save(): Promise<void> {
    if (!this.isAdmin || !this.data.countingCircles) {
      return;
    }

    const newDomainOfInfluenceCountingCircles = this.selection.selected;

    try {
      this.saving = true;

      await this.domainOfInfluenceService.updateCountingCircleEntries(
        this.data.id,
        newDomainOfInfluenceCountingCircles.map(x => x.id),
      );

      this.data.countingCircles = [...newDomainOfInfluenceCountingCircles, ...this.inheritedCountingCircles];

      this.data.countingCircles.sort((a, b) => (a.name < b.name ? -1 : 1));

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));

      this.dialogRef.close({
        domainOfInfluence: this.data,
      } as DomainOfInfluenceCountingCircleAssignDialogResult);
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

  public toggleRow(row: DomainOfInfluenceCountingCircle, value: boolean): void {
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

export interface DomainOfInfluenceCountingCircleAssignDialogData {
  domainOfInfluence: DomainOfInfluence;
  countingCircles: DomainOfInfluenceCountingCircle[];
}

export interface DomainOfInfluenceCountingCircleAssignDialogResult {
  domainOfInfluence: DomainOfInfluence;
}
