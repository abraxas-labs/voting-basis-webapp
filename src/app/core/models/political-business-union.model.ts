/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PoliticalBusinessUnionType } from '@abraxas/voting-basis-service-proto/grpc/shared/political_business_union_pb';
import { ElectionCandidate } from './election-candidate.model';
import { BaseEntityMessage } from './message.model';
import { PoliticalBusiness } from './political-business.model';

export { PoliticalBusinessUnionType };

export type PoliticalBusinessUnion = {
  id: string;
  contestId: string;
  description: string;
  secureConnectId: string;
  type: PoliticalBusinessUnionType;

  politicalBusinesses?: PoliticalBusiness[];
  candidates?: ElectionCandidate[];
};

export type PoliticalBusinessUnionMessage = BaseEntityMessage<PoliticalBusinessUnion>;

export function newPoliticalBusinessUnion(
  contestId: string,
  enabledPoliticalBusinessUnionTypes: PoliticalBusinessUnionType[],
): PoliticalBusinessUnion {
  const union = {
    contestId,
  } as PoliticalBusinessUnion;

  if (enabledPoliticalBusinessUnionTypes.length === 1) {
    union.type = enabledPoliticalBusinessUnionTypes[0];
  }

  return union;
}
