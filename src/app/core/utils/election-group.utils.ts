/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { ElectionGroup } from '../models/election-group.model';

export function sortElectionGroups(electionGroups: ElectionGroup[]): void {
  electionGroups.sort((a, b) => a.number - b.number);
}
