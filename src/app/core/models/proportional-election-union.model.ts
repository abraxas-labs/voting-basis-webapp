/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { ProportionalElectionUnionList as ProportionalElectionUnionListProto } from '@abraxas/voting-basis-service-proto/grpc/models/proportional_election_union_list_pb';
import { ProportionalElectionUnion as ProportionalElectionUnionProto } from '@abraxas/voting-basis-service-proto/grpc/models/proportional_election_union_pb';

export type ProportionalElectionUnion = ProportionalElectionUnionProto.AsObject;

export { ProportionalElectionUnionListProto };
export type ProportionalElectionUnionList = Omit<ProportionalElectionUnionListProto.AsObject, 'shortDescriptionMap'> & {
  shortDescription: Map<string, string>;
};
