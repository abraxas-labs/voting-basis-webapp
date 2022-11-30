/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DomainOfInfluenceParty as DomainOfInfluencePartyProto } from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_party_pb';

export { DomainOfInfluencePartyProto };

export function newDomainOfInfluenceParty(): DomainOfInfluenceParty {
  return {
    name: new Map<string, string>(),
    shortDescription: new Map<string, string>(),
  } as DomainOfInfluenceParty;
}

export interface DomainOfInfluenceParty {
  id: string;
  domainOfInfluenceId: string;
  name: Map<string, string>;
  shortDescription: Map<string, string>;
  inherited?: boolean;
}
