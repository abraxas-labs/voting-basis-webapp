/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EventLogServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/event_log_service_grpc_web_pb';
import { EventLogsPage } from '@abraxas/voting-basis-service-proto/grpc/models/event_log_pb';
import {
  ListEventLogsRequest,
  WatchEventsRequest,
  WatchEventsRequestFilter,
} from '@abraxas/voting-basis-service-proto/grpc/requests/event_log_requests_pb';
import { GrpcBackendService, GrpcService, retryForeverWithBackoff } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Event, EventLog, EventLogProto, EventType, EventTypePrefix } from './models/event-log.model';
import { Page, Pageable, PageableProto } from './models/page.model';
import { Observable } from 'rxjs/internal/Observable';
import { filter, finalize, Subject, Subscription, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventLogService extends GrpcService<EventLogServicePromiseClient> {
  private watchFilters: WatchEventsRequestFilter[] = [];
  private readonly watchSubject: Subject<Event> = new Subject<Event>();
  private readonly watch$: Observable<Event> = this.watchSubject.pipe(
    tap({
      finalize: () => {
        this.watchCallSubscription?.unsubscribe();
        delete this.watchCallSubscription;
      },
    }),
  );
  private watchCallSubscription?: Subscription;

  constructor(grpcBackend: GrpcBackendService) {
    super(EventLogServicePromiseClient, environment, grpcBackend);
  }

  public watch(types: EventType[], contestId?: string): Observable<Event> {
    const filterId = crypto.randomUUID();
    const watchFilter = new WatchEventsRequestFilter();
    watchFilter.setId(filterId);
    watchFilter.setTypesList(types.map(t => EventTypePrefix + t));
    if (contestId !== undefined) {
      watchFilter.setContestId(contestId);
    }

    this.watchFilters.push(watchFilter);

    // unfortunately grpc-web doesn't support client streaming.
    // therefore we need to reconnect and may lose a small set of updates.
    // But the idea is to only have one connection to the server to limit the open http connections
    // the browser and the server has to handle due to connection limits on several layers.
    const newSubscription = this.requestServerStream(
      c => c.watch,
      new WatchEventsRequest().setFiltersList(this.watchFilters),
      r =>
        ({
          ...r.toObject(),
          type: r.getType().substring(EventTypePrefix.length) as EventType,
        }) satisfies Event,
    )
      .pipe(retryForeverWithBackoff())
      .subscribe(e => this.watchSubject.next(e));

    this.watchCallSubscription?.unsubscribe();
    this.watchCallSubscription = newSubscription;
    return this.watch$.pipe(
      filter(e => e.filterId == filterId),
      finalize(() => (this.watchFilters = this.watchFilters.filter(f => f.getId() !== watchFilter.getId()))),
    );
  }

  public async list(pageable: Pageable): Promise<Page<EventLog>> {
    const req = new ListEventLogsRequest();

    const pageableProto = new PageableProto();
    pageableProto.setPage(pageable.page);
    pageableProto.setPageSize(pageable.pageSize);

    req.setPageable(pageableProto);

    return this.request(
      e => e.list,
      req,
      r => this.mapToPage(r),
    );
  }

  private mapToPage(response: EventLogsPage): Page<EventLog> {
    return {
      ...(response.getPage()!.toObject() as Page<EventLog>),
      items: response.getEventLogs()!.getEventLogsList().map(this.mapToEventLog) ?? [],
    };
  }

  private mapToEventLog(e: EventLogProto): EventLog {
    return {
      eventName: e.getEventName(),
      eventContent: e.getEventContent(),
      timestamp: e.getTimestamp()!.toDate(),
      eventUser: e.getEventUser()!.toObject(),
      eventTenant: e.getEventTenant()!.toObject(),
    };
  }
}
