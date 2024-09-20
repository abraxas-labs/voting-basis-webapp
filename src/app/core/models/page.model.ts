/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Page as PageProto, Pageable as PageableProto } from '@abraxas/voting-basis-service-proto/grpc/models/page_pb';

export { PageableProto };
export const defaultPageSize = 10;

export interface Page<T> extends Required<PageProto.AsObject> {
  items: T[];
}

export type Pageable = PageableProto.AsObject;
