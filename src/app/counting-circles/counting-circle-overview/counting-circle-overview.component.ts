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
import { CountingCircle, CountingCircleMessage } from '../../core/models/counting-circle.model';
import { PermissionService } from '../../core/permission.service';
import { HistorizationFilter, newHistorizationFilter } from '../../shared/historization-filter-bar/historization-filter-bar.component';
import { Permissions } from '../../core/models/permissions.model';
import { CountingCircleState } from '@abraxas/voting-basis-service-proto/grpc/shared/counting_circle_pb';
import { FilterDirective, PaginatorComponent, SortDirective, TableDataSource } from '@abraxas/base-components';
import { Subscription } from 'rxjs';
import { EntityState } from '../../core/models/message.model';

@Component({
  selector: 'app-counting-circle-overview',
  templateUrl: './counting-circle-overview.component.html',
  styleUrls: ['./counting-circle-overview.component.scss'],
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
  }

  private startChangesListener(): void {
    this.changesSubscription?.unsubscribe();

    this.changesSubscription = this.countingCircleService.getChanges().subscribe(e => this.handleCountingCircleMessage(e.countingCircle));
  }

  private handleCountingCircleMessage(e: CountingCircleMessage): void {
    const countingCircle = e.data;
    if (e.newEntityState === EntityState.ENTITY_STATE_DELETED) {
      this.dataSource.data = this.dataSource.data.filter(c => c.id !== countingCircle.id);
      return;
    }

    const existingCountingCircleIndex = this.dataSource.data.map(x => x.id).indexOf(countingCircle.id);
    if (existingCountingCircleIndex >= 0) {
      this.dataSource.data[existingCountingCircleIndex] = countingCircle;

      // trigger angular change detection
      this.dataSource.data = [...this.dataSource.data];
    } else {
      this.dataSource.data = [...this.dataSource.data, countingCircle];
    }
  }
}
