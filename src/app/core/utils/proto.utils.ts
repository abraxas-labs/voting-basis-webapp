/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DoubleValue, Int32Value } from 'google-protobuf/google/protobuf/wrappers_pb';

export function createDoubleValue(v: number | undefined): DoubleValue | undefined {
  if (!v && v !== 0) {
    return;
  }

  const proto = new DoubleValue();
  proto.setValue(v);
  return proto;
}

export function createInt32Value(v: number | undefined): Int32Value | undefined {
  if (v === undefined || v === null) {
    return;
  }

  const proto = new Int32Value();
  proto.setValue(v);
  return proto;
}
