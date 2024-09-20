/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { MajorityElectionUnion as MajorityElectionUnionProto } from '@abraxas/voting-basis-service-proto/grpc/models/majority_election_union_pb';

export type MajorityElectionUnion = MajorityElectionUnionProto.AsObject;
