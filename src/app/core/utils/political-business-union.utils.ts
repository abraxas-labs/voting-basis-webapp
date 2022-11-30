/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { PoliticalBusinessUnion } from '../models/political-business-union.model';

export function sortPoliticalBusinessUnions(politicalBusinessUnions: PoliticalBusinessUnion[]): void {
  politicalBusinessUnions.sort((a, b) => a.description.localeCompare(b.description));
}
