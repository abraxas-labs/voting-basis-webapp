/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PoliticalBusiness } from '../models/political-business.model';

export function sortPoliticalBusinesses(politicalBusinesses: PoliticalBusiness[]): void {
  politicalBusinesses.sort((a, b) => {
    const sortByDoiType = a.domainOfInfluence.type - b.domainOfInfluence.type;
    if (!!sortByDoiType) {
      return sortByDoiType;
    }

    const sortByPbNumber = a.politicalBusinessNumber.localeCompare(b.politicalBusinessNumber);
    if (!!sortByPbNumber) {
      return sortByPbNumber;
    }

    return a.politicalBusinessType - b.politicalBusinessType;
  });
}
