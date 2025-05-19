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
};
