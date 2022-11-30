/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { ContestState, ContestSummary } from '../../core/models/contest.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-contest-list',
  templateUrl: './contest-list.component.html',
  styleUrls: ['./contest-list.component.scss'],
})
export class ContestListComponent implements OnInit, OnChanges, AfterViewInit {
  public columns: string[] = [];
  public readonly contestStates: typeof ContestState = ContestState;

  @Input()
  public showEndOfTestingPhase: boolean = false;

  @Input()
  public showArchivePer: boolean = false;

  @Input()
  public set contests(contests: ContestSummary[]) {
    this.dataSource.data = contests;
  }

  @Input()
  public showPaginator: boolean = false;

  @Output()
  public view: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public create: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public edit: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public archive: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public pastUnlock: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public delete: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public export: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public domainOfInfluences: DomainOfInfluence[] = [];
  public dataSource: MatTableDataSource<ContestSummary> = new MatTableDataSource<ContestSummary>();

  constructor(private readonly domainOfInfluenceService: DomainOfInfluenceService) {}

  public async ngOnInit(): Promise<void> {
    this.domainOfInfluences = await this.domainOfInfluenceService.listForCurrentTenant();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public ngOnChanges(): void {
    this.columns = ['date', 'endOfTestingPhase', 'archivePer', 'state', 'owner', 'pcd', 'politicalBusinesses', 'actions'];
    if (!this.showArchivePer) {
      this.columns.splice(2, 1);
    }
    if (!this.showEndOfTestingPhase) {
      this.columns.splice(1, 1);
    }
  }
}
