/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DomainOfInfluenceVotingCardPrintData as DomainOfInfluenceVotingCardPrintDataProto } from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_voting_card_print_data_pb';
import {
  VotingCardShippingFranking,
  VotingCardShippingMethod,
} from '@abraxas/voting-basis-service-proto/grpc/shared/voting_card_shipping_pb';

export type DomainOfInfluenceVotingCardPrintData = DomainOfInfluenceVotingCardPrintDataProto.AsObject;
export { VotingCardShippingFranking, VotingCardShippingMethod };
export { DomainOfInfluenceVotingCardPrintDataProto };

export function newDomainOfInfluenceVotingCardPrintData(): DomainOfInfluenceVotingCardPrintData {
  return {} as DomainOfInfluenceVotingCardPrintData;
}
