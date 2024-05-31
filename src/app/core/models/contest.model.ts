/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  Contest as ContestProto,
  ContestDetailsChangeMessage as ContestDetailsChangeMessageProto,
  ContestOverviewChangeMessage as ContestOverviewChangeMessageProto,
  ContestSummary as ContestSummaryProto,
  ContestSummaryEntryDetails as ContestSummaryEntryDetailsProto,
  PreconfiguredContestDate as PreconfiguredContestDateProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/contest_pb';
import { ContestDateAvailability, ContestState } from '@abraxas/voting-basis-service-proto/grpc/shared/contest_pb';
import { DomainOfInfluence } from './domain-of-influence.model';
import { ElectionGroupMessage } from './election-group.model';
import { BaseEntityMessage } from './message.model';
import { PoliticalBusinessUnion, PoliticalBusinessUnionMessage } from './political-business-union.model';
import { PoliticalBusiness, PoliticalBusinessMessage } from './political-business.model';

export { ContestDetailsChangeMessageProto, ContestOverviewChangeMessageProto };
export { ContestState };
export { ContestProto };
export type Contest = {
  id: string;
  date?: Date;
  description: Map<string, string>;
  endOfTestingPhase?: Date;
  testingPhaseEnded: boolean;
  locked: boolean;
  domainOfInfluenceId: string;
  domainOfInfluence: DomainOfInfluence;
  eVoting: boolean;
  eVotingFrom?: Date;
  eVotingTo?: Date;
  politicalBusinesses: PoliticalBusiness[];
  politicalBusinessUnions: PoliticalBusinessUnion[];
  state: ContestState;
  previousContestId?: string;
};
export { ContestDateAvailability };
export { ContestSummaryProto };
export type ContestSummary = Contest & {
  isPreconfiguredDate: boolean;
  archivePer?: Date;
  contestEntriesDetails: ContestSummaryEntryDetails[];
};
export type ContestSummaryEntryDetails = ContestSummaryEntryDetailsProto.AsObject;
export { PreconfiguredContestDateProto };
export type PreconfiguredContestDate = {
  date: Date;
};

export type ContestSimple = {
  id: string;
  date: Date;
};
export type ContestMessage = BaseEntityMessage<Contest>;
export interface ContestOverviewChangeMessage {
  contest: ContestMessage;
}
export interface ContestDetailsChangeMessage {
  politicalBusiness?: PoliticalBusinessMessage;
  politicalBusinessUnion?: PoliticalBusinessUnionMessage;
  electionGroup?: ElectionGroupMessage;
}
export function newContest(): Contest {
  return {
    date: new Date(),
    testingPhaseEnded: false,
    locked: false,
    description: new Map<string, string>(),
  } as Contest;
}
