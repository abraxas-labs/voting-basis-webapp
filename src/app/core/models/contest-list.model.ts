/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ContestState, ContestSummary } from './contest.model';
import { PoliticalAssembly } from './political-assembly.model';

export type ContestListType = {
  id: string;
  date: Date;
  dateString: string; // Can be removed after BC fixed the table date filter, VOTING-4891
  type: string;
  isPreconfiguredDate: boolean;
  isPoliticalAssembly: boolean;
  description: string;
  endOfTestingPhase?: Date;
  testingPhaseEnded?: boolean;
  state?: ContestState;
  archivePer?: Date;
  politicalBusinesses: string;
  locked: boolean;
  owner: string;
  ownerId?: string;
  contest?: ContestSummary;
  politicalAssembly?: PoliticalAssembly;
  eVotingApprovalDueDateString?: string;
};
