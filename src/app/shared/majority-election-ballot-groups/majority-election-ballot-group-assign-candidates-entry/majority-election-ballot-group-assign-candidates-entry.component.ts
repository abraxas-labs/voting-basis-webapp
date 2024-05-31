/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PaginatorComponent, TableDataSource } from '@abraxas/base-components';
import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MajorityElectionCandidate } from '../../../core/models/majority-election.model';
import { BallotGroupUiEntry } from '../majority-election-ballot-group-assign-candidates-dialog/majority-election-ballot-group-assign-candidates-dialog.component';

@Component({
  selector: 'app-majority-election-ballot-group-assign-candidates-entry',
  templateUrl: './majority-election-ballot-group-assign-candidates-entry.component.html',
  styleUrls: ['./majority-election-ballot-group-assign-candidates-entry.component.scss'],
})
export class MajorityElectionBallotGroupAssignCandidatesEntryComponent implements AfterViewInit {
  public readonly columns = ['select', 'number', 'lastName', 'firstName', 'dateOfBirth', 'sex', 'party'];
  public readonly columnsSelected = ['number', 'lastName', 'firstName', 'actions'];

  @Input()
  public entry?: BallotGroupUiEntry;

  @Input()
  public set candidates(candidates: MajorityElectionCandidate[]) {
    this.dataSource.data = candidates;
    const selectedCandidates = candidates.filter(x => this.entry?.selectedCandidateIds.includes(x.id));
    this.selection = new SelectionModel<MajorityElectionCandidate>(true, selectedCandidates);
  }

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  public dataSource = new TableDataSource<MajorityElectionCandidate>();
  public selection = new SelectionModel<MajorityElectionCandidate>(true, []);
  public isAllSelected: boolean = false;

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public toggleAllRows(value: boolean) {
    if (value === this.isAllSelected) {
      return;
    }

    value ? this.selection.select(...this.dataSource.data) : this.selection.clear();
    this.updateIsAllSelected();
    this.selectedCandidatesChanged();
  }

  public updateIsAllSelected(): void {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    this.isAllSelected = numSelected === numRows;
  }

  public toggleRow(row: MajorityElectionCandidate): void {
    this.selection.toggle(row);
    this.updateIsAllSelected();
    this.selectedCandidatesChanged();
  }

  public toggleRowWithValue(row: MajorityElectionCandidate, value: boolean): void {
    if (value === this.selection.isSelected(row)) {
      return;
    }

    this.toggleRow(row);
  }

  private selectedCandidatesChanged(): void {
    if (!this.entry) {
      return;
    }

    this.entry.selectedCandidateIds = this.selection.selected.map(({ id }) => id).sort();
    this.entry.entry.countOfCandidates = this.entry.selectedCandidateIds.length;
  }
}
