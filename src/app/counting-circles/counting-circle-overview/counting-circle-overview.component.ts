/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CountingCircleService } from '../../core/counting-circle.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { CountingCircle } from '../../core/models/counting-circle.model';
import { RolesService } from '../../core/roles.service';
import { HistorizationFilter, newHistorizationFilter } from '../../shared/historization-filter-bar/historization-filter-bar.component';

@Component({
  selector: 'app-counting-circle-overview',
  templateUrl: './counting-circle-overview.component.html',
  styleUrls: ['./counting-circle-overview.component.scss'],
})
export class CountingCircleOverviewComponent implements OnInit {
  public readonly allColumns = ['name', 'bfs', 'code', 'authority', 'modifiedOn', 'state', 'actions'];
  public columns = this.allColumns;
  public loading: boolean = true;
  public data: CountingCircle[] = [];
  public isAdmin: boolean = false;

  public historizationFilter: HistorizationFilter = newHistorizationFilter();

  constructor(
    private readonly router: Router,
    private readonly i18n: TranslateService,
    private readonly rolesService: RolesService,
    private readonly snackbarService: SnackbarService,
    private readonly countingCircleService: CountingCircleService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly route: ActivatedRoute,
    private readonly dialogService: DialogService,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      this.isAdmin = await this.rolesService.isAdmin();
      this.data = await this.countingCircleService.list();
    } finally {
      this.loading = false;
    }
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
    this.data = this.data.filter(d => d.id !== row.id);
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async historizationFilterChange(filter: HistorizationFilter): Promise<void> {
    this.historizationFilter = filter;

    this.data = !this.historizationFilter.useHistorizationRequests
      ? await this.countingCircleService.list()
      : await this.countingCircleService.listSnapshot(filter.includeDeleted, filter.date);

    // Remove actions column
    this.columns = [...this.allColumns];
    if (this.historizationFilter.date) {
      this.columns.splice(-1, 1);
    }
  }
}
