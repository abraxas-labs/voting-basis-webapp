/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EntityOrder, EntityOrders } from '@abraxas/voting-basis-service-proto/grpc/models/entity_order_pb';

export function mapToEntityOrder(item: EntityOrder.AsObject): EntityOrder {
  const newOrder = new EntityOrder();
  newOrder.setId(item.id);
  newOrder.setPosition(item.position);
  return newOrder;
}

export function mapToEntityOrders(items: EntityOrder.AsObject[]): EntityOrders {
  const newOrders = new EntityOrders();
  for (const item of items) {
    newOrders.addOrders(mapToEntityOrder(item));
  }
  return newOrders;
}
