/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  MajorityElectionBallotGroup as MajorityElectionBallotGroupProto,
  MajorityElectionBallotGroupCandidates as MajorityElectionBallotGroupCandidatesProto,
  MajorityElectionBallotGroupEntry as MajorityElectionBallotGroupEntryProto,
  MajorityElectionBallotGroupEntryCandidates as MajorityElectionBallotGroupEntryCandidatesProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/majority_election_pb';
import { groupBySingle } from '../utils/array.utils';
import { MajorityElection } from './majority-election.model';
import { SecondaryMajorityElection } from './secondary-majority-election.model';

export { MajorityElectionBallotGroupProto };
export type MajorityElectionBallotGroup = Omit<MajorityElectionBallotGroupProto.AsObject, 'entriesList'> & {
  entries: MajorityElectionBallotGroupEntry[];
};
export { MajorityElectionBallotGroupEntryProto };
export type MajorityElectionBallotGroupEntry = MajorityElectionBallotGroupEntryProto.AsObject;

export { MajorityElectionBallotGroupCandidatesProto };
export type MajorityElectionBallotGroupCandidates = Omit<MajorityElectionBallotGroupCandidatesProto.AsObject, 'entryCandidatesList'> & {
  entryCandidates: MajorityElectionBallotGroupEntryCandidates[];
};

export { MajorityElectionBallotGroupEntryCandidatesProto };
export type MajorityElectionBallotGroupEntryCandidates = MajorityElectionBallotGroupEntryCandidatesProto.AsObject;

export function newMajorityElectionBallotGroup(majorityElectionId: string, position: number): MajorityElectionBallotGroup {
  return {
    id: '',
    description: '',
    majorityElectionId,
    shortDescription: '',
    position,
    entries: [],
  };
}

export function newMajorityElectionBallotGroupEntry(electionId: string): MajorityElectionBallotGroupEntry {
  return {
    id: '',
    electionId,
    blankRowCount: 0,
    candidateCountOk: false,
    individualCandidatesVoteCount: 0,
    countOfCandidates: 0,
  };
}

export function updateMajorityElectionBallotGroupCandidateCountOk(
  bg: MajorityElectionBallotGroup,
  elections: (MajorityElection | SecondaryMajorityElection)[],
): void {
  const elById = groupBySingle(
    elections,
    e => e.id,
    e => e,
  );
  for (const entry of bg.entries) {
    const el = elById[entry.electionId];
    if (el) {
      updateMajorityElectionBallotGroupEntryCandidateCountOk(entry, el.numberOfMandates);
    }
  }
}

export function updateMajorityElectionBallotGroupEntryCandidateCountOk(
  entry: MajorityElectionBallotGroupEntry,
  numberOfMandates: number,
): void {
  entry.candidateCountOk = numberOfMandates === entry.individualCandidatesVoteCount + entry.blankRowCount + entry.countOfCandidates;
}
