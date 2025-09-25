/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  EventLog as EventLogProto,
  EventLogTenant as EventLogTenantProto,
  EventLogUser as EventLogUserProto,
  Event as EventProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/event_log_pb';

export { EventLogProto, EventProto };

export type EventLogUser = EventLogUserProto.AsObject;
export type EventLogTenant = EventLogTenantProto.AsObject;

export type EventLog = {
  eventName: string;
  eventContent: string;
  timestamp: Date;
  eventUser: EventLogUser;
  eventTenant: EventLogTenant;
};

export interface Event extends Omit<EventProto.AsObject, 'type'> {
  type: EventType;
}

export const EventTypePrefix: string = 'abraxas.voting.basis.events.v1.';
export type EventType =
  | 'CountingCircleCreated'
  | 'CountingCircleUpdated'
  | 'CountingCircleDeleted'
  | 'ContestCreated'
  | 'ContestUpdated'
  | 'ContestDeleted'
  | 'ElectionGroupCreated'
  | 'ElectionGroupDeleted'
  | 'VoteCreated'
  | 'VoteUpdated'
  | 'VoteActiveStateUpdated'
  | 'VoteEVotingApprovalUpdated'
  | 'VoteDeleted'
  | 'BallotCreated'
  | 'BallotUpdated'
  | 'BallotAfterTestingPhaseUpdated'
  | 'BallotDeleted'
  | 'ProportionalElectionCreated'
  | 'ProportionalElectionUpdated'
  | 'ProportionalElectionActiveStateUpdated'
  | 'ProportionalElectionEVotingApprovalUpdated'
  | 'ProportionalElectionAfterTestingPhaseUpdated'
  | 'ProportionalElectionDeleted'
  | 'ProportionalElectionUnionCreated'
  | 'ProportionalElectionUnionUpdated'
  | 'ProportionalElectionUnionEntriesUpdated'
  | 'ProportionalElectionUnionDeleted'
  | 'ProportionalElectionListCreated'
  | 'ProportionalElectionListUpdated'
  | 'ProportionalElectionListAfterTestingPhaseUpdated'
  | 'ProportionalElectionListDeleted'
  | 'MajorityElectionCreated'
  | 'MajorityElectionUpdated'
  | 'MajorityElectionActiveStateUpdated'
  | 'MajorityElectionEVotingApprovalUpdated'
  | 'MajorityElectionDeleted'
  | 'MajorityElectionAfterTestingPhaseUpdated'
  | 'MajorityElectionUnionCreated'
  | 'MajorityElectionUnionUpdated'
  | 'MajorityElectionUnionEntriesUpdated'
  | 'MajorityElectionUnionDeleted'
  | 'SecondaryMajorityElectionCreated'
  | 'SecondaryMajorityElectionUpdated'
  | 'SecondaryMajorityElectionActiveStateUpdated'
  | 'SecondaryMajorityElectionEVotingApprovalUpdated'
  | 'SecondaryMajorityElectionAfterTestingPhaseUpdated'
  | 'SecondaryMajorityElectionDeleted';
