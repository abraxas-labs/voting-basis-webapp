/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DomainOfInfluenceVotingCardReturnAddress as DomainOfInfluenceVotingCardReturnAddressProto } from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_voting_card_return_address_pb';

export { DomainOfInfluenceVotingCardReturnAddressProto };

export type DomainOfInfluenceVotingCardReturnAddress = DomainOfInfluenceVotingCardReturnAddressProto.AsObject;

export function newDomainOfInfluenceVotingCardReturnAddress(): DomainOfInfluenceVotingCardReturnAddress {
  return {} as DomainOfInfluenceVotingCardReturnAddress;
}
