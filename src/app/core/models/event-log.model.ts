/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  EventLog as EventLogProto,
  EventLogTenant as EventLogTenantProto,
  EventLogUser as EventLogUserProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/event_log_pb';

export { EventLogProto };

export type EventLogUser = EventLogUserProto.AsObject;
export type EventLogTenant = EventLogTenantProto.AsObject;

export type EventLog = {
  eventName: string;
  eventContent: string;
  timestamp: Date;
  eventUser: EventLogUser;
  eventTenant: EventLogTenant;
};
