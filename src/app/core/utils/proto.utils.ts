/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DoubleValue } from 'google-protobuf/google/protobuf/wrappers_pb';

export function createDoubleValue(v: number | undefined): DoubleValue | undefined {
  if (!v && v !== 0) {
    return;
  }

  const proto = new DoubleValue();
  proto.setValue(v);
  return proto;
}
