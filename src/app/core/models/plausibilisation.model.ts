/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  ComparisonCountOfVotersConfiguration as ComparisonCountOfVotersConfigurationProto,
  ComparisonCountOfVotersCountingCircleEntry as ComparisonCountOfVotersCountingCircleEntryProto,
  ComparisonVoterParticipationConfiguration as ComparisonVoterParticipationConfigurationProto,
  ComparisonVotingChannelConfiguration as ComparisonVotingChannelConfigurationProto,
  PlausibilisationConfiguration as PlausibilisationConfigurationProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/plausibilisation_pb';
import { ComparisonCountOfVotersCategory } from '@abraxas/voting-basis-service-proto/grpc/shared/plausibilisation_pb';
import { VotingChannel } from '@abraxas/voting-basis-service-proto/grpc/shared/voting_channel_pb';
import { EnumUtil } from '@abraxas/voting-lib';

export {
  ComparisonCountOfVotersCategory,
  PlausibilisationConfigurationProto,
  ComparisonCountOfVotersConfigurationProto,
  ComparisonCountOfVotersCountingCircleEntryProto,
  ComparisonVoterParticipationConfigurationProto,
  ComparisonVotingChannelConfigurationProto,
};
export type ComparisonCountOfVotersCountingCircleEntry = ComparisonCountOfVotersCountingCircleEntryProto.AsObject;

export interface ComparisonVotingChannelConfiguration extends Omit<ComparisonVotingChannelConfigurationProto.AsObject, 'thresholdPercent'> {
  thresholdPercent?: number;
}

export interface ComparisonCountOfVotersConfiguration extends Omit<ComparisonCountOfVotersConfigurationProto.AsObject, 'thresholdPercent'> {
  thresholdPercent?: number;
}

export interface ComparisonVoterParticipationConfiguration
  extends Omit<ComparisonVoterParticipationConfigurationProto.AsObject, 'thresholdPercent'> {
  thresholdPercent?: number;
}

export interface PlausibilisationConfiguration {
  comparisonValidVotingCardsWithAccountedBallotsThresholdPercent?: number;
  comparisonVoterParticipationConfigurationsList: ComparisonVoterParticipationConfiguration[];
  comparisonCountOfVotersConfigurationsList: ComparisonCountOfVotersConfiguration[];
  comparisonCountOfVotersCountingCircleEntriesList: ComparisonCountOfVotersCountingCircleEntry[];
  comparisonVotingChannelConfigurationsList: ComparisonVotingChannelConfiguration[];
}

export function newPlausibilisationConfiguration(): PlausibilisationConfiguration {
  const comparisonCountOfVotersConfigurations: ComparisonCountOfVotersConfiguration[] = EnumUtil.getArray<ComparisonCountOfVotersCategory>(
    ComparisonCountOfVotersCategory,
  ).map(x => ({ category: x.value }));

  const comparisonVotingChannelConfigurations: ComparisonVotingChannelConfiguration[] = EnumUtil.getArray<VotingChannel>(VotingChannel).map(
    x => ({ votingChannel: x.value }),
  );

  return {
    comparisonCountOfVotersConfigurationsList: comparisonCountOfVotersConfigurations,
    comparisonVotingChannelConfigurationsList: comparisonVotingChannelConfigurations,
    comparisonCountOfVotersCountingCircleEntriesList: [],
    comparisonVoterParticipationConfigurationsList: [],
  };
}

export function newComparisonCountOfVotersConfiguration(): ComparisonVoterParticipationConfiguration {
  return {} as ComparisonVoterParticipationConfiguration;
}
