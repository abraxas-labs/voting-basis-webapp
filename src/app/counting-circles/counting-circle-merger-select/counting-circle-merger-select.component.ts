/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PaginatorComponent, TableDataSource } from '@abraxas/base-components';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { CountingCircle } from '../../core/models/counting-circle.model';

@Component({
  selector: 'app-counting-circle-merger-select',
  templateUrl: './counting-circle-merger-select.component.html',
  styleUrls: ['./counting-circle-merger-select.component.scss'],
  standalone: false,
})
export class CountingCircleMergerSelectComponent implements OnDestroy, AfterViewInit {
  public readonly columns = ['select', 'name', 'bfs', 'authority'];
  public readonly columnsSelected = ['name', 'actions'];
  public readonly dataSource = new TableDataSource<CountingCircle>();
  public selection = new SelectionModel<CountingCircle>(true, []);
  public selected = new TableDataSource<CountingCircle>(this.selection.selected);
  public isAllSelected: boolean = false;

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  @Input()
  public selectedCountingCircles: CountingCircle[] = [];

  @Output()
  public selectedCountingCirclesChange: EventEmitter<CountingCircle[]> = new EventEmitter<CountingCircle[]>();

  private selectionChangedSubscription: Subscription = Subscription.EMPTY;

  @Input()
  public set selectableCountingCircles(circles: CountingCircle[]) {
    this.dataSource.data = circles;
    const selectedIds = new Set(this.selectedCountingCircles.map(c => c.id));
    circles.filter(c => selectedIds.has(c.id)).forEach(c => this.toggleRow(c));
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    this.selectionChangedSubscription.unsubscribe();
  }

  public toggleAllRows(value: boolean) {
    if (value === this.isAllSelected) {
      return;
    }

    value ? this.selection.select(...this.dataSource.data) : this.selection.clear();
    this.updateIsAllSelected();
    this.emitSelectedCountingCirclesChange();
  }

  public updateIsAllSelected(): void {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    this.isAllSelected = numSelected === numRows;
  }

  public emitSelectedCountingCirclesChange(): void {
    this.selectedCountingCirclesChange.emit(this.selection.selected);
  }

  public toggleRow(row: CountingCircle): void {
    this.selection.toggle(row);
    this.updateIsAllSelected();
    this.emitSelectedCountingCirclesChange();
  }

  public toggleRowWithValue(row: CountingCircle, value: boolean): void {
    if (value === this.selection.isSelected(row)) {
      return;
    }

    this.toggleRow(row);
  }
}
