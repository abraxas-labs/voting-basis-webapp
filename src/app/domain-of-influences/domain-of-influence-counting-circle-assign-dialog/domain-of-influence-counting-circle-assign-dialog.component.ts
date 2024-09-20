/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { PaginatorComponent, TableDataSource } from '@abraxas/base-components';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluenceCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';

@Component({
  selector: 'app-domain-of-influence-counting-circle-assign-dialog',
  templateUrl: './domain-of-influence-counting-circle-assign-dialog.component.html',
  styleUrls: ['./domain-of-influence-counting-circle-assign-dialog.component.scss'],
})
export class DomainOfInfluenceCountingCircleAssignDialogComponent implements AfterViewInit, OnInit, OnDestroy {
  public readonly columns = ['select', 'name', 'bfs', 'authority'];
  public readonly columnsSelected = ['name', 'actions'];
  public readonly columnsInherited = ['name'];

  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  public data: DomainOfInfluence;
  public saving: boolean = false;
  public canEdit: boolean = false;

  public dataSource = new TableDataSource<DomainOfInfluenceCountingCircle>();
  public inheritedCountingCircles: DomainOfInfluenceCountingCircle[] = [];
  public selection: SelectionModel<DomainOfInfluenceCountingCircle>;
  public isAllSelected: boolean = false;

  public hasChanges: boolean = false;
  public originalSelectedCountingCircles: DomainOfInfluenceCountingCircle[];
  public readonly backdropClickSubscription: Subscription;

  constructor(
    private readonly dialogRef: MatDialogRef<DomainOfInfluenceCountingCircleAssignDialogData>,
    private readonly permissionService: PermissionService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) dialogData: DomainOfInfluenceCountingCircleAssignDialogData,
  ) {
    this.data = dialogData.domainOfInfluence;
    this.inheritedCountingCircles = this.data.countingCircles?.filter(cc => cc.inherited) ?? [];
    this.dataSource.data = dialogData.countingCircles;

    const selectedCountingCircles = dialogData.countingCircles.filter(cc =>
      (this.data.countingCircles ?? []).some(dicc => dicc.id === cc.id),
    );
    this.selection = new SelectionModel<DomainOfInfluenceCountingCircle>(true, selectedCountingCircles);
    this.updateIsAllSelected();
    this.originalSelectedCountingCircles = cloneDeep(selectedCountingCircles);

    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
  }

  public async ngOnInit(): Promise<void> {
    this.canEdit = await this.permissionService.hasAnyPermission(
      Permissions.DomainOfInfluenceHierarchy.UpdateSameCanton,
      Permissions.DomainOfInfluenceHierarchy.UpdateAll,
    );
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async save(): Promise<void> {
    if (!this.canEdit || !this.data.countingCircles) {
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
      this.hasChanges = false;

      this.dialogRef.close({
        domainOfInfluence: this.data,
      } as DomainOfInfluenceCountingCircleAssignDialogResult);
    } finally {
      this.saving = false;
    }
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

  public async closeWithUnsavedChangesCheck(): Promise<void> {
    if (await this.leaveDialogOpen()) {
      return;
    }

    this.dialogRef.close();
  }

  public contentChanged(): void {
    const sortedSelectedCountingCircles = this.selection.selected.sort((a, b) => (a.name < b.name ? -1 : 1));
    this.hasChanges = !isEqual(sortedSelectedCountingCircles, this.originalSelectedCountingCircles);
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }
}

export interface DomainOfInfluenceCountingCircleAssignDialogData {
  domainOfInfluence: DomainOfInfluence;
  countingCircles: DomainOfInfluenceCountingCircle[];
}

export interface DomainOfInfluenceCountingCircleAssignDialogResult {
  domainOfInfluence: DomainOfInfluence;
}
