/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  ElectionGroup as ElectionGroupProto,
  ElectionGroupMessage as ElectionGroupMessageProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/election_group_pb';
import { BaseEntityMessage } from './message.model';

export { ElectionGroupMessageProto };
export type ElectionGroup = ElectionGroupProto.AsObject;
export type ElectionGroupMessage = BaseEntityMessage<ElectionGroup>;
