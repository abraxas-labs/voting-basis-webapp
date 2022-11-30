/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  MajorityElectionCandidateReference as MajorityElectionCandidateReferenceProto,
  SecondaryMajorityElection as SecondaryMajorityElectionProto,
  SecondaryMajorityElectionCandidate as SecondaryMajorityElectionCandidateProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/majority_election_pb';
import { SecondaryMajorityElectionAllowedCandidates } from '@abraxas/voting-basis-service-proto/grpc/shared/majority_election_pb';
import { MajorityElectionCandidate, newMajorityElectionCandidate } from './majority-election.model';

export { SecondaryMajorityElectionAllowedCandidates };
export { SecondaryMajorityElectionProto };
export type SecondaryMajorityElection = Omit<SecondaryMajorityElectionProto.AsObject, 'shortDescriptionMap' | 'officialDescriptionMap'> & {
  shortDescription: Map<string, string>;
  officialDescription: Map<string, string>;
};
export type SecondaryMajorityElectionCandidate = MajorityElectionCandidate & {
  isReferenced: boolean;
  referencedCandidateId: string;
};
export { SecondaryMajorityElectionCandidateProto };
export type MajorityElectionCandidateReference = MajorityElectionCandidateReferenceProto.AsObject;

export function newSecondaryMajorityElection(): SecondaryMajorityElection {
  return {
    allowedCandidates:
      SecondaryMajorityElectionAllowedCandidates.SECONDARY_MAJORITY_ELECTION_ALLOWED_CANDIDATES_MUST_EXIST_IN_PRIMARY_ELECTION,
    id: '',
    internalDescription: '',
    politicalBusinessNumber: '',
    numberOfMandates: 0,
    officialDescription: new Map<string, string>(),
    primaryMajorityElectionId: '',
    shortDescription: new Map<string, string>(),
    active: false,
  };
}

export function newSecondaryMajorityElectionCandidate(position: number, majorityElectionId: string): SecondaryMajorityElectionCandidate {
  return {
    ...newMajorityElectionCandidate(position, majorityElectionId),
    isReferenced: false,
    referencedCandidateId: '',
  };
}
