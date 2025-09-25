/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  MajorityElection as MajorityElectionProto,
  MajorityElectionCandidate as MajorityElectionCandidateProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/majority_election_pb';
import {
  MajorityElectionMandateAlgorithm as MajorityElectionMandateAlgorithmProto,
  MajorityElectionResultEntry as MajorityElectionResultEntryProto,
  MajorityElectionReviewProcedure as MajorityElectionReviewProcedureProto,
} from '@abraxas/voting-basis-service-proto/grpc/shared/majority_election_pb';
import { BallotNumberGeneration } from './ballot-number-generation.model';
import { SexType } from './sex-type.model';

export { MajorityElectionProto };
export type MajorityElection = Omit<
  MajorityElectionProto.AsObject,
  'shortDescriptionMap' | 'officialDescriptionMap' | 'federalIdentification' | 'eVotingApproved'
> & {
  shortDescription: Map<string, string>;
  officialDescription: Map<string, string>;
  federalIdentification?: number;
  eVotingApproved?: boolean;
};
export { MajorityElectionMandateAlgorithmProto as MajorityElectionMandateAlgorithm };
export { MajorityElectionResultEntryProto as MajorityElectionResultEntry };
export { MajorityElectionReviewProcedureProto as MajorityElectionReviewProcedure };
export { MajorityElectionCandidateProto };

export type MajorityElectionCandidate = {
  id: string;
  majorityElectionId: string;
  number: string;
  firstName: string;
  lastName: string;
  politicalFirstName: string;
  politicalLastName: string;
  dateOfBirth?: Date;
  sex?: SexType;
  occupation: Map<string, string>;
  title: string;
  occupationTitle: Map<string, string>;
  party: Map<string, string>;
  incumbent: boolean;
  zipCode: string;
  locality: string;
  position: number;
  origin: string;
  street: string;
  houseNumber: string;
  country: string;
};

export function newMajorityElection(): MajorityElection {
  return {
    numberOfMandates: 0,
    ballotBundleSize: 0,
    ballotBundleSampleSize: 0,
    candidateCheckDigit: false,
    ballotNumberGeneration: BallotNumberGeneration.BALLOT_NUMBER_GENERATION_RESTART_FOR_EACH_BUNDLE,
    resultEntry: MajorityElectionResultEntryProto.MAJORITY_ELECTION_RESULT_ENTRY_FINAL_RESULTS,
    mandateAlgorithm: MajorityElectionMandateAlgorithmProto.MAJORITY_ELECTION_MANDATE_ALGORITHM_ABSOLUTE_MAJORITY,
    reportDomainOfInfluenceLevel: 0,
    shortDescription: new Map<string, string>(),
    officialDescription: new Map<string, string>(),
    reviewProcedure: MajorityElectionReviewProcedureProto.MAJORITY_ELECTION_REVIEW_PROCEDURE_ELECTRONICALLY,
  } as MajorityElection;
}

export function newMajorityElectionCandidate(position: number, majorityElectionId: string): MajorityElectionCandidate {
  return {
    id: '',
    firstName: '',
    lastName: '',
    politicalFirstName: '',
    politicalLastName: '',
    incumbent: false,
    locality: '',
    number: '',
    occupation: new Map<string, string>(),
    title: '',
    occupationTitle: new Map<string, string>(),
    party: new Map<string, string>(),
    zipCode: '',
    majorityElectionId,
    position,
    origin: '',
    sex: undefined,
    street: '',
    houseNumber: '',
    country: 'CH',
  };
}
