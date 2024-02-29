/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Map as ProtoMap } from 'google-protobuf';

export function fillProtoMap<K, V>(protoMap: ProtoMap<K, V>, map: Map<K, V>): void {
  for (const [key, value] of map) {
    protoMap.set(key, value);
  }
}

export function toJsMap<K, V>(protoMap: ProtoMap<K, V>): Map<K, V> {
  const map = new Map<K, V>();

  for (const [key, value] of protoMap.toArray()) {
    map.set(key, value);
  }

  return map;
}
