/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EntityState } from '@abraxas/voting-basis-service-proto/grpc/models/entity_state_pb';

export { EntityState };

export interface BaseEntityMessage<TEntity> {
  data: TEntity;
  newEntityState: EntityState;
}
