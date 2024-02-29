/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DomainOfInfluenceType } from '../models/domain-of-influence.model';

export function isCommunalDoiType(doiType: DomainOfInfluenceType): boolean {
  return doiType >= DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU;
}
