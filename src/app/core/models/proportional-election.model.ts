/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  ProportionalElection as ProportionalElectionProto,
  ProportionalElectionCandidate as ProportionalElectionCandidateProto,
  ProportionalElectionList as ProportionalElectionListProto,
  ProportionalElectionListUnion as ProportionalElectionListUnionProto,
  ProportionalElectionListUnionEntries as ProportionalElectionListUnionEntriesProto,
  ProportionalElectionListUnionMainList as ProportionalElectionListUnionMainListProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/proportional_election_pb';
import {
  ProportionalElectionMandateAlgorithm as ProportionalElectionMandateAlgorithmProto,
  ProportionalElectionReviewProcedure as ProportionalElectionReviewProcedureProto,
} from '@abraxas/voting-basis-service-proto/grpc/shared/proportional_election_pb';
import { LanguageService } from '../language.service';
import { BallotNumberGeneration } from './ballot-number-generation.model';
import { DomainOfInfluenceParty, newDomainOfInfluenceParty } from './domain-of-influence-party.model';
import { SexType } from './sex-type.model';

export { ProportionalElectionProto };
export type ProportionalElection = Omit<ProportionalElectionProto.AsObject, 'shortDescriptionMap' | 'officialDescriptionMap'> & {
  shortDescription: Map<string, string>;
  officialDescription: Map<string, string>;
};
export { ProportionalElectionMandateAlgorithmProto as ProportionalElectionMandateAlgorithm };
export { ProportionalElectionReviewProcedureProto as ProportionalElectionReviewProcedure };
export { ProportionalElectionListProto };
export type ProportionalElectionList = Omit<
  ProportionalElectionListProto.AsObject,
  'shortDescriptionMap' | 'descriptionMap' | 'listUnionDescriptionMap' | 'subListUnionDescriptionMap'
> & {
  shortDescription: Map<string, string>;
  description: Map<string, string>;
  listUnionDescription: Map<string, string>;
  subListUnionDescription: Map<string, string>;
  orderNumberAndDescription: string;
};
export { ProportionalElectionListUnionProto };
export type ProportionalElectionListUnionEntries = ProportionalElectionListUnionEntriesProto.AsObject;
export type ProportionalElectionListUnionMainList = ProportionalElectionListUnionMainListProto.AsObject;
export { ProportionalElectionCandidateProto };

export type ProportionalElectionCandidate = {
  id: string;
  proportionalElectionListId: string;
  number: string;
  firstName: string;
  lastName: string;
  politicalFirstName: string;
  politicalLastName: string;
  dateOfBirth: Date;
  sex: SexType;
  occupation: Map<string, string>;
  title: string;
  occupationTitle: Map<string, string>;
  incumbent: boolean;
  zipCode: string;
  locality: string;
  position: number;
  accumulated: boolean;
  accumulatedPosition: number;
  party?: DomainOfInfluenceParty;
  origin: string;
};

export type ProportionalElectionListUnion = {
  id: string;
  proportionalElectionId: string;
  description: Map<string, string>;
  position: number;
  proportionalElectionRootListUnionId: string;
  proportionalElectionSubListUnions: ProportionalElectionListUnion[];
  proportionalElectionListIds: string[];
  proportionalElectionMainListId?: string;

  proportionalElectionMainListNumber?: string;
  proportionalElectionListEnumeration?: string;
  proportionalElectionSubListUnionEnumeration?: string;
  number?: string;
};

export function newProportionalElection(): ProportionalElection {
  return {
    numberOfMandates: 0,
    ballotBundleSize: 0,
    ballotBundleSampleSize: 0,
    candidateCheckDigit: false,
    ballotNumberGeneration: BallotNumberGeneration.BALLOT_NUMBER_GENERATION_RESTART_FOR_EACH_BUNDLE,
    shortDescription: new Map<string, string>(),
    officialDescription: new Map<string, string>(),
    automaticBallotBundleNumberGeneration: false,
    automaticEmptyVoteCounting: false,
    reviewProcedure: ProportionalElectionReviewProcedureProto.PROPORTIONAL_ELECTION_REVIEW_PROCEDURE_ELECTRONICALLY,
  } as ProportionalElection;
}

export function newProportionalElectionList(position: number, proportionalElectionId: string): ProportionalElectionList {
  return {
    id: '',
    shortDescription: new Map<string, string>(),
    description: new Map<string, string>(),
    orderNumber: '',
    proportionalElectionId,
    position,
    blankRowCount: 0,
    candidateCountOk: false,
    countOfCandidates: 0,
    listUnionDescription: new Map<string, string>(),
    subListUnionDescription: new Map<string, string>(),
    orderNumberAndDescription: '',
  };
}

export function newProportionalElectionListUnion(
  position: number,
  proportionalElectionId: string,
  root?: ProportionalElectionListUnion,
): ProportionalElectionListUnion {
  return {
    id: '',
    description: LanguageService.fillAllLanguages(!!root ? `${root.position}.${position}` : position.toString()),
    proportionalElectionSubListUnions: [],
    proportionalElectionListIds: [],
    proportionalElectionRootListUnionId: root?.id ?? '',
    proportionalElectionMainListId: '',
    proportionalElectionId,
    position,
  };
}

export function newProportionalElectionCandidate(position: number, proportionalElectionListId: string): ProportionalElectionCandidate {
  return {
    id: '',
    firstName: '',
    lastName: '',
    politicalFirstName: '',
    politicalLastName: '',
    incumbent: false,
    dateOfBirth: new Date(),
    locality: '',
    number: '',
    occupation: new Map<string, string>(),
    title: '',
    occupationTitle: new Map<string, string>(),
    sex: SexType.SEX_TYPE_MALE,
    zipCode: '',
    proportionalElectionListId,
    position,
    accumulated: false,
    accumulatedPosition: 0,
    party: newDomainOfInfluenceParty(),
    origin: '',
  };
}

export function updateProportionalElectionListCandidateCountOk(l: ProportionalElectionList, numberOfMandates: number): void {
  l.candidateCountOk = numberOfMandates === l.countOfCandidates + l.blankRowCount;
}
