/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventLogService } from '../core/event-log.service';
import { EventLog } from '../core/models/event-log.model';
import { ServerSidePaginationDataSource } from '../core/server-side-pagination-data-source';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
})
export class ActivityComponent implements AfterViewInit, OnDestroy {
  public readonly dataSource = new ServerSidePaginationDataSource<EventLog>();
  @ViewChild('paginator') public paginator!: MatPaginator;

  private pagingSubscription: Subscription = Subscription.EMPTY;

  constructor(private readonly eventLogService: EventLogService) {}

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.pagingSubscription = this.dataSource.setupPaginator(p => this.eventLogService.list(p)).subscribe();
  }

  public ngOnDestroy(): void {
    this.pagingSubscription.unsubscribe();
  }
}
