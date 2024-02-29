/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EventLogServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/event_log_service_grpc_web_pb';
import { EventLogsPage } from '@abraxas/voting-basis-service-proto/grpc/models/event_log_pb';
import { ListEventLogsRequest } from '@abraxas/voting-basis-service-proto/grpc/requests/event_log_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { EventLog, EventLogProto } from './models/event-log.model';
import { Page, Pageable, PageableProto } from './models/page.model';

@Injectable({
  providedIn: 'root',
})
export class EventLogService extends GrpcService<EventLogServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(EventLogServicePromiseClient, environment, grpcBackend);
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
