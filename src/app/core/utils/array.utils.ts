/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

export function flatMap<T>(arr: T[][]): T[] {
  if (!arr) {
    return [];
  }
  return arr.reduce((a1, a2) => [...a1, ...a2], []);
}

export function groupBy<E, K extends keyof any, V>(arr: E[], keySelector: (item: E) => K, itemSelector: (item: E) => V): Record<K, V[]> {
  return arr.reduce(
    (existing, current) => {
      const key = keySelector(current);
      if (!existing.hasOwnProperty(key)) {
        existing[key] = [];
      }
      existing[key].push(itemSelector(current));
      return existing;
    },
    {} as Record<K, V[]>,
  );
}

export function groupBySingle<E, K extends keyof any, V>(
  arr: E[],
  keySelector: (item: E) => K,
  itemSelector: (item: E) => V,
): Record<K, V> {
  return arr.reduce(
    (existing, current) => {
      const key = keySelector(current);
      existing[key] = itemSelector(current);
      return existing;
    },
    {} as Record<K, V>,
  );
}

export function isDistinct<E, K>(arr: E[], keySelector: (item: E) => K): boolean {
  return new Set(arr.map(keySelector)).size === arr.length;
}

export function distinct<E, V>(arr: E[], propSelector: (item: E) => V): E[] {
  const resultSet: Set<V> = new Set();
  const result: E[] = [];
  for (const el of arr) {
    const prop = propSelector(el);
    if (!resultSet.has(prop)) {
      resultSet.add(prop);
      result.push(el);
    }
  }
  return result;
}
