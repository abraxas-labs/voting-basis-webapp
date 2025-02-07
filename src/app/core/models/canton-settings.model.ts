/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  CantonSettings as CantonSettingsProto,
  CantonSettingsVotingCardChannel as CantonSettingsVotingCardChannelProto,
  DomainOfInfluenceCantonDefaults as DomainOfInfluenceCantonDefaultsProto,
  CountingCircleResultStateDescription as CountingCircleResultStateDescriptionProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/canton_settings_pb';
import {
  CantonMajorityElectionAbsoluteMajorityAlgorithm as CantonMajorityElectionAbsoluteMajorityAlgorithmProto,
  ProtocolCountingCircleSortType as ProtocolCountingCircleSortTypeProto,
  ProtocolDomainOfInfluenceSortType as ProtocolDomainOfInfluenceSortTypeProto,
  SwissAbroadVotingRight as SwissAbroadVotingRightProto,
} from '@abraxas/voting-basis-service-proto/grpc/shared/canton_settings_pb';
import { VotingChannel } from '@abraxas/voting-basis-service-proto/grpc/shared/voting_channel_pb';
import { DomainOfInfluenceCanton } from './domain-of-influence.model';
import { PoliticalBusinessUnionType } from './political-business-union.model';
import { CountingCircleResultState } from '@abraxas/voting-basis-service-proto/grpc/shared/counting_circle_pb';

export { CantonSettingsProto };
export { SwissAbroadVotingRightProto as SwissAbroadVotingRight };

export type CantonSettings = CantonSettingsProto.AsObject;
export type DomainOfInfluenceCantonDefaults = DomainOfInfluenceCantonDefaultsProto.AsObject;
export {
  CantonMajorityElectionAbsoluteMajorityAlgorithmProto as CantonMajorityElectionAbsoluteMajorityAlgorithm,
  ProtocolCountingCircleSortTypeProto as ProtocolCountingCircleSortType,
  ProtocolDomainOfInfluenceSortTypeProto as ProtocolDomainOfInfluenceSortType,
};
export type CantonSettingsVotingCardChannel = CantonSettingsVotingCardChannelProto.AsObject;
export type CountingCircleResultStateDescription = CountingCircleResultStateDescriptionProto.AsObject;

export function newCantonSettings(): CantonSettings {
  return {
    id: '',
    authorityName: '',
    secureConnectId: '',
    votingDocumentsEVotingEaiMessageType: '',
    majorityElectionAbsoluteMajorityAlgorithm:
      CantonMajorityElectionAbsoluteMajorityAlgorithmProto.CANTON_MAJORITY_ELECTION_ABSOLUTE_MAJORITY_ALGORITHM_VALID_BALLOTS_DIVIDED_BY_TWO, // eslint-disable-line
    proportionalElectionMandateAlgorithmsList: [],
    majorityElectionInvalidVotes: false,
    swissAbroadVotingRight: SwissAbroadVotingRightProto.SWISS_ABROAD_VOTING_RIGHT_ON_EVERY_COUNTING_CIRCLE,
    canton: DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED,
    swissAbroadVotingRightDomainOfInfluenceTypesList: [],
    enabledPoliticalBusinessUnionTypesList: [
      PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION,
      PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_MAJORITY_ELECTION,
    ],
    enabledVotingCardChannelsList: [
      {
        votingChannel: VotingChannel.VOTING_CHANNEL_BY_MAIL,
        valid: true,
      },
      {
        votingChannel: VotingChannel.VOTING_CHANNEL_BY_MAIL,
        valid: false,
      },
      {
        votingChannel: VotingChannel.VOTING_CHANNEL_PAPER,
        valid: true,
      },
      {
        votingChannel: VotingChannel.VOTING_CHANNEL_BALLOT_BOX,
        valid: true,
      },
    ],
    protocolCountingCircleSortType: ProtocolCountingCircleSortTypeProto.PROTOCOL_COUNTING_CIRCLE_SORT_TYPE_SORT_NUMBER,
    protocolDomainOfInfluenceSortType: ProtocolDomainOfInfluenceSortTypeProto.PROTOCOL_DOMAIN_OF_INFLUENCE_SORT_TYPE_SORT_NUMBER,
    multipleVoteBallotsEnabled: false,
    countingMachineEnabled: false,
    majorityElectionUseCandidateCheckDigit: false,
    proportionalElectionUseCandidateCheckDigit: false,
    countingCircleResultStateDescriptionsList: allCountingCircleResultStateDescriptions.map(x => ({ state: x, description: '' })),
    statePlausibilisedDisabled: false,
    manualPublishResultsEnabled: false,
    endResultFinalizeDisabled: false,
    createContestOnHighestHierarchicalLevelEnabled: false,
    internalPlausibilisationDisabled: false,
    publishResultsBeforeAuditedTentatively: false,
    candidateLocalityRequired: false,
    candidateOriginRequired: false,
    domainOfInfluencePublishResultsOptionEnabled: false,
    secondaryMajorityElectionOnSeparateBallot: false,
  };
}

export const allCountingCircleResultStateDescriptions = [
  CountingCircleResultState.COUNTING_CIRCLE_RESULT_STATE_SUBMISSION_ONGOING,
  CountingCircleResultState.COUNTING_CIRCLE_RESULT_STATE_SUBMISSION_DONE,
  CountingCircleResultState.COUNTING_CIRCLE_RESULT_STATE_READY_FOR_CORRECTION,
  CountingCircleResultState.COUNTING_CIRCLE_RESULT_STATE_CORRECTION_DONE,
  CountingCircleResultState.COUNTING_CIRCLE_RESULT_STATE_AUDITED_TENTATIVELY,
  CountingCircleResultState.COUNTING_CIRCLE_RESULT_STATE_PLAUSIBILISED,
];
