/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { CantonSettingsServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/canton_settings_service_grpc_web_pb';
import {
  CantonSettingsVotingCardChannel as CantonSettingsVotingCardChannelProto,
  CountingCircleResultStateDescription as CountingCircleResultStateDescriptionProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/canton_settings_pb';
import {
  CreateCantonSettingsRequest,
  GetCantonSettingsRequest,
  ListCantonSettingsRequest,
  UpdateCantonSettingsRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/canton_settings_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CantonSettings, CantonSettingsVotingCardChannel, CountingCircleResultStateDescription } from './models/canton-settings.model';

@Injectable({
  providedIn: 'root',
})
export class CantonSettingsService extends GrpcService<CantonSettingsServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(CantonSettingsServicePromiseClient, environment, grpcBackend);
  }

  public create(data: CantonSettings): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateCantonSettingsRequest(data),
      r => r.getId(),
    );
  }

  public update(data: CantonSettings): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateCantonSettingsRequest(data));
  }

  public get(id: string): Promise<CantonSettings> {
    const req = new GetCantonSettingsRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => r.toObject(),
    );
  }

  public list(): Promise<CantonSettings[]> {
    const req = new ListCantonSettingsRequest();
    return this.request(
      c => c.list,
      req,
      r => r.getCantonSettingsListList().map(c => c.toObject()),
    );
  }

  private mapToUpdateCantonSettingsRequest(data: CantonSettings): UpdateCantonSettingsRequest {
    const result = new UpdateCantonSettingsRequest();
    result.setId(data.id);
    result.setAuthorityName(data.authorityName);
    result.setSecureConnectId(data.secureConnectId);
    result.setProportionalElectionMandateAlgorithmsList(data.proportionalElectionMandateAlgorithmsList);
    result.setMajorityElectionAbsoluteMajorityAlgorithm(data.majorityElectionAbsoluteMajorityAlgorithm);
    result.setMajorityElectionInvalidVotes(data.majorityElectionInvalidVotes);
    result.setSwissAbroadVotingRight(data.swissAbroadVotingRight);
    result.setSwissAbroadVotingRightDomainOfInfluenceTypesList(data.swissAbroadVotingRightDomainOfInfluenceTypesList);
    result.setEnabledPoliticalBusinessUnionTypesList(data.enabledPoliticalBusinessUnionTypesList);
    result.setEnabledVotingCardChannelsList(this.mapToVotingCardChannels(data.enabledVotingCardChannelsList));
    result.setVotingDocumentsEVotingEaiMessageType(data.votingDocumentsEVotingEaiMessageType);
    result.setProtocolCountingCircleSortType(data.protocolCountingCircleSortType);
    result.setProtocolDomainOfInfluenceSortType(data.protocolDomainOfInfluenceSortType);
    result.setMultipleVoteBallotsEnabled(data.multipleVoteBallotsEnabled);
    result.setCountingMachineEnabled(data.countingMachineEnabled);
    result.setNewZhFeaturesEnabled(data.newZhFeaturesEnabled);
    result.setMajorityElectionUseCandidateCheckDigit(data.majorityElectionUseCandidateCheckDigit);
    result.setProportionalElectionUseCandidateCheckDigit(data.proportionalElectionUseCandidateCheckDigit);
    result.setCountingCircleResultStateDescriptionsList(
      this.filterEmptyCountingCircleResultStateDescriptions(data.countingCircleResultStateDescriptionsList),
    );
    result.setStatePlausibilisedDisabled(data.statePlausibilisedDisabled);
    result.setPublishResultsEnabled(data.publishResultsEnabled);
    result.setPublishResultsBeforeAuditedTentatively(data.publishResultsBeforeAuditedTentatively);
    result.setEndResultFinalizeDisabled(data.endResultFinalizeDisabled);
    result.setCreateContestOnHighestHierarchicalLevelEnabled(data.createContestOnHighestHierarchicalLevelEnabled);
    result.setInternalPlausibilisationDisabled(data.internalPlausibilisationDisabled);
    return result;
  }

  private mapToCreateCantonSettingsRequest(data: CantonSettings): CreateCantonSettingsRequest {
    const result = new CreateCantonSettingsRequest();
    result.setCanton(data.canton);
    result.setAuthorityName(data.authorityName);
    result.setSecureConnectId(data.secureConnectId);
    result.setProportionalElectionMandateAlgorithmsList(data.proportionalElectionMandateAlgorithmsList);
    result.setMajorityElectionAbsoluteMajorityAlgorithm(data.majorityElectionAbsoluteMajorityAlgorithm);
    result.setMajorityElectionInvalidVotes(data.majorityElectionInvalidVotes);
    result.setSwissAbroadVotingRight(data.swissAbroadVotingRight);
    result.setSwissAbroadVotingRightDomainOfInfluenceTypesList(data.swissAbroadVotingRightDomainOfInfluenceTypesList);
    result.setEnabledPoliticalBusinessUnionTypesList(data.enabledPoliticalBusinessUnionTypesList);
    result.setEnabledVotingCardChannelsList(this.mapToVotingCardChannels(data.enabledVotingCardChannelsList));
    result.setVotingDocumentsEVotingEaiMessageType(data.votingDocumentsEVotingEaiMessageType);
    result.setProtocolCountingCircleSortType(data.protocolCountingCircleSortType);
    result.setProtocolDomainOfInfluenceSortType(data.protocolDomainOfInfluenceSortType);
    result.setMultipleVoteBallotsEnabled(data.multipleVoteBallotsEnabled);
    result.setCountingMachineEnabled(data.countingMachineEnabled);
    result.setNewZhFeaturesEnabled(data.newZhFeaturesEnabled);
    result.setMajorityElectionUseCandidateCheckDigit(data.majorityElectionUseCandidateCheckDigit);
    result.setProportionalElectionUseCandidateCheckDigit(data.proportionalElectionUseCandidateCheckDigit);
    result.setCountingCircleResultStateDescriptionsList(
      this.filterEmptyCountingCircleResultStateDescriptions(data.countingCircleResultStateDescriptionsList),
    );
    result.setStatePlausibilisedDisabled(data.statePlausibilisedDisabled);
    result.setPublishResultsEnabled(data.publishResultsEnabled);
    result.setPublishResultsBeforeAuditedTentatively(data.publishResultsBeforeAuditedTentatively);
    result.setEndResultFinalizeDisabled(data.endResultFinalizeDisabled);
    result.setCreateContestOnHighestHierarchicalLevelEnabled(data.createContestOnHighestHierarchicalLevelEnabled);
    result.setInternalPlausibilisationDisabled(data.internalPlausibilisationDisabled);
    return result;
  }

  private mapToVotingCardChannels(channels: Array<CantonSettingsVotingCardChannel>): CantonSettingsVotingCardChannelProto[] {
    return channels.map(x => {
      const obj = new CantonSettingsVotingCardChannelProto();
      obj.setVotingChannel(x.votingChannel);
      obj.setValid(x.valid);
      return obj;
    });
  }

  private filterEmptyCountingCircleResultStateDescriptions(
    descriptions: Array<CountingCircleResultStateDescription>,
  ): CountingCircleResultStateDescriptionProto[] {
    return descriptions
      .filter(x => !!x.description)
      .map(x => {
        const obj = new CountingCircleResultStateDescriptionProto();
        obj.setState(x.state);
        obj.setDescription(x.description);
        return obj;
      });
  }
}
