/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  Ballot as BallotProto,
  BallotQuestion as BallotQuestionProto,
  TieBreakQuestion as TieBreakQuestionProto,
  Vote as VoteProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/vote_pb';
import {
  BallotType as BallotTypeProto,
  VoteResultAlgorithm as VoteResultAlgorithmProto,
  VoteResultEntry as VoteResultEntryProto,
  VoteReviewProcedure as VoteReviewProcedureProto,
} from '@abraxas/voting-basis-service-proto/grpc/shared/vote_pb';

export { VoteProto };
export type Vote = {
  id: string;
  politicalBusinessNumber: string;
  shortDescription: Map<string, string>;
  officialDescription: Map<string, string>;
  internalDescription: string;
  domainOfInfluenceId: string;
  contestId: string;
  active: boolean;
  ballots: Ballot[];
  reportDomainOfInfluenceLevel: number;
  resultAlgorithm: VoteResultAlgorithmProto;
  resultEntry: VoteResultEntryProto;
  ballotBundleSampleSizePercent: number;
  enforceResultEntryForCountingCircles: boolean;
  automaticBallotBundleNumberGeneration: boolean;
  reviewProcedure: VoteReviewProcedureProto;
  enforceReviewProcedureForCountingCircles: boolean;
};
export { VoteResultAlgorithmProto as VoteResultAlgorithm };
export { BallotProto };
export type Ballot = {
  id: string;
  position: number;
  ballotType: BallotTypeProto;
  description: Map<string, string>;
  ballotQuestions: BallotQuestion[];
  voteId: string;
  hasTieBreakQuestions: boolean;
  tieBreakQuestions: TieBreakQuestion[];
};
export { BallotQuestionProto };
export type BallotQuestion = {
  number: number;
  question: Map<string, string>;
};
export { TieBreakQuestionProto };
export type TieBreakQuestion = {
  number: number;
  question: Map<string, string>;
  question1Number: number;
  question2Number: number;
};
export { BallotTypeProto as BallotType };
export { VoteResultEntryProto as VoteResultEntry };
export { VoteReviewProcedureProto as VoteReviewProcedure };

export function newVote(): Vote {
  return {
    ballots: [] as Ballot[],
    reportDomainOfInfluenceLevel: 0,
    resultAlgorithm: VoteResultAlgorithmProto.VOTE_RESULT_ALGORITHM_POPULAR_MAJORITY,
    officialDescription: new Map<string, string>(),
    shortDescription: new Map<string, string>(),
    resultEntry: VoteResultEntryProto.VOTE_RESULT_ENTRY_FINAL_RESULTS,
    ballotBundleSampleSizePercent: 0,
    enforceResultEntryForCountingCircles: true,
    automaticBallotBundleNumberGeneration: false,
    reviewProcedure: VoteReviewProcedureProto.VOTE_REVIEW_PROCEDURE_ELECTRONICALLY,
  } as Vote;
}

export function newBallot(): Ballot {
  return {
    ballotType: BallotTypeProto.BALLOT_TYPE_STANDARD_BALLOT,
    hasTieBreakQuestions: false,
    position: 1,
    description: new Map<string, string>(),
    ballotQuestions: [
      {
        number: 1,
        question: new Map<string, string>(),
      },
    ],
  } as Ballot;
}
