/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { ElectionCandidate as ElectionCandidateProto } from '@abraxas/voting-basis-service-proto/grpc/models/election_candidate_pb';
import { SexType } from './sex-type.model';

export { ElectionCandidateProto };
export type ElectionCandidate = {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  sex: SexType;
  title: string;
  incumbent: boolean;
  zipCode: string;
  locality: string;
};
