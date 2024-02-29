/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DomainOfInfluenceVotingCardSwissPostData as DomainOfInfluenceVotingCardSwissPostDataProto } from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_voting_card_swiss_post_data_pb';

export type DomainOfInfluenceVotingCardSwissPostData = DomainOfInfluenceVotingCardSwissPostDataProto.AsObject;
export { DomainOfInfluenceVotingCardSwissPostDataProto };

export function newDomainOfInfluenceVotingCardSwissPostData(): DomainOfInfluenceVotingCardSwissPostData {
  return {} as DomainOfInfluenceVotingCardSwissPostData;
}
