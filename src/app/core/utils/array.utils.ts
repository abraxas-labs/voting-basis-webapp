/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

export function flatMap<T>(arr: T[][]): T[] {
  if (!arr) {
    return [];
  }
  return arr.reduce((a1, a2) => [...a1, ...a2], []);
}

export function groupBy<E, K extends keyof any, V>(arr: E[], keySelector: (item: E) => K, itemSelector: (item: E) => V): Record<K, V[]> {
  return arr.reduce((existing, current) => {
    const key = keySelector(current);
    if (!existing.hasOwnProperty(key)) {
      existing[key] = [];
    }
    existing[key].push(itemSelector(current));
    return existing;
  }, {} as Record<K, V[]>);
}

export function groupBySingle<E, K extends keyof any, V>(
  arr: E[],
  keySelector: (item: E) => K,
  itemSelector: (item: E) => V,
): Record<K, V> {
  return arr.reduce((existing, current) => {
    const key = keySelector(current);
    existing[key] = itemSelector(current);
    return existing;
  }, {} as Record<K, V>);
}

export function isDistinct<E, K>(arr: E[], keySelector: (item: E) => K): boolean {
  return new Set(arr.map(keySelector)).size === arr.length;
}
