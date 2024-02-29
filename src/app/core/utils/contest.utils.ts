/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Contest } from '../models/contest.model';

export function sortContests(contests: Contest[]): void {
  contests.sort((a, b) => {
    if (!a.date) {
      return -1;
    }
    if (!b.date) {
      return 1;
    }
    return a.date.getTime() - b.date.getTime();
  });
}
