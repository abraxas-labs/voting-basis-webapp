/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CountingCircleService } from '../../core/counting-circle.service';
import { CountingCircle } from '../../core/models/counting-circle.model';
import { PermissionService } from '../../core/permission.service';
import { HistorizationFilter, newHistorizationFilter } from '../../shared/historization-filter-bar/historization-filter-bar.component';
import { Permissions } from '../../core/models/permissions.model';
import { CountingCircleState } from '@abraxas/voting-basis-service-proto/grpc/shared/counting_circle_pb';
import { FilterDirective, PaginatorComponent, SortDirective, TableDataSource } from '@abraxas/base-components';
import { Subscription } from 'rxjs';
import { EventLogService } from '../../core/event-log.service';
import { EventType } from '../../core/models/event-log.model';

@Component({
  selector: 'app-counting-circle-overview',
  templateUrl: './counting-circle-overview.component.html',
  styleUrls: ['./counting-circle-overview.component.scss'],
  standalone: false,
})
export class CountingCircleOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  public readonly nameColumn = 'name';
  public readonly bfsColumn = 'bfs';
  public readonly codeColumn = 'code';
  public readonly authorityColumn = 'authority';
  public readonly modifiedOnColumn = 'modifiedOn';
  public readonly stateColumn = 'state';
  public readonly actionsColumn = 'actions';

  public readonly allColumns = [
    this.nameColumn,
    this.bfsColumn,
    this.codeColumn,
    this.authorityColumn,
    this.modifiedOnColumn,
    this.stateColumn,
    this.actionsColumn,
  ];

  @ViewChild('paginator')
  public paginator!: PaginatorComponent;

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  @ViewChild(FilterDirective, { static: true })
  public filter!: FilterDirective;

  public columns = this.allColumns;
  public loading: boolean = true;
  public dataSource = new TableDataSource<CountingCircle>();
  public canDelete: boolean = false;
  public canCreate: boolean = false;
  public canMerge: boolean = false;

  public historizationFilter: HistorizationFilter = newHistorizationFilter();
  public stateList: EnumItemDescription<CountingCircleState>[] = [];

  private changesSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly i18n: TranslateService,
    private readonly permissionService: PermissionService,
    private readonly snackbarService: SnackbarService,
    private readonly countingCircleService: CountingCircleService,
    private readonly route: ActivatedRoute,
    private readonly dialogService: DialogService,
    private readonly enumUtil: EnumUtil,
    private readonly eventLog: EventLogService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.stateList = this.enumUtil.getArrayWithDescriptions<CountingCircleState>(CountingCircleState, 'COUNTING_CIRCLE.STATES.');
    const dataAccessor = (data: CountingCircle, filterId: string) => {
      if (filterId === this.authorityColumn) {
        return data.responsibleAuthority?.name ?? '';
      }

      return (data as Record<string, any>)[filterId];
    };

    this.dataSource.filterDataAccessor = dataAccessor;
    this.dataSource.sortingDataAccessor = dataAccessor;

    try {
      this.canDelete = await this.permissionService.hasPermission(Permissions.CountingCircle.DeleteSameCanton);
      this.canCreate = await this.permissionService.hasPermission(Permissions.CountingCircle.CreateSameCanton);
      this.canMerge = await this.permissionService.hasPermission(Permissions.CountingCircle.MergeSameCanton);
      this.dataSource.data = await this.countingCircleService.list();
      this.startChangesListener();
    } finally {
      this.loading = false;
    }
  }

  public ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.filter = this.filter;
    this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    this.changesSubscription?.unsubscribe();
  }

  public async create(): Promise<void> {
    await this.router.navigate(['new'], { relativeTo: this.route });
  }

  public async openMergers(): Promise<void> {
    await this.router.navigate(['mergers'], { relativeTo: this.route });
  }

  public async show(row: CountingCircle): Promise<void> {
    if (this.historizationFilter.date || row.deletedOn) {
      return;
    }

    await this.router.navigate([row.id], { relativeTo: this.route });
  }

  public async delete(row: CountingCircle): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'COUNTING_CIRCLE.CONFIRM_DELETE', 'APP.DELETE');

    if (!shouldDelete) {
      return;
    }

    await this.countingCircleService.delete(row.id);
    this.dataSource.data = this.dataSource.data.filter(d => d.id !== row.id);
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async historizationFilterChange(filter: HistorizationFilter): Promise<void> {
    this.historizationFilter = filter;

    this.dataSource.data = !this.historizationFilter.useHistorizationRequests
      ? await this.countingCircleService.list()
      : await this.countingCircleService.listSnapshot(filter.includeDeleted, filter.date);

    // Remove actions column
    this.columns = [...this.allColumns];
    if (this.historizationFilter.date) {
      this.columns.splice(-1, 1);
    }

    this.startChangesListener();
  }

  private startChangesListener(): void {
    this.changesSubscription?.unsubscribe();
    if (this.historizationFilter.useHistorizationRequests) {
      return;
    }

    this.changesSubscription = this.eventLog
      .watch(['CountingCircleCreated', 'CountingCircleUpdated', 'CountingCircleDeleted'])
      .subscribe(e => this.handleCountingCircleEvent(e.type, e.aggregateId));
  }

  private async handleCountingCircleEvent(eventType: EventType, countingCircleId: string): Promise<void> {
    switch (eventType) {
      case 'CountingCircleCreated':
        if (this.dataSource.data.find(x => x.id === countingCircleId)) {
          break;
        }

        this.dataSource.data = [...this.dataSource.data, await this.countingCircleService.get(countingCircleId)];
        break;
      case 'CountingCircleUpdated':
        const idx = this.dataSource.data.findIndex(d => d.id === countingCircleId);
        if (idx >= 0) {
          this.dataSource.data[idx] = await this.countingCircleService.get(countingCircleId);
          this.dataSource.data = [...this.dataSource.data];
        }
        break;
      case 'CountingCircleDeleted':
        this.dataSource.data = this.dataSource.data.filter(c => c.id !== countingCircleId);
        break;
    }
  }
}
