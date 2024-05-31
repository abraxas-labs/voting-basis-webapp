/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService } from '@abraxas/base-components';
import { DomainOfInfluenceServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/domain_of_influence_service_grpc_web_pb';
import {
  CreateDomainOfInfluenceRequest,
  DeleteDomainOfInfluenceLogoRequest,
  DeleteDomainOfInfluenceRequest,
  GetDomainOfInfluenceCantonDefaultsRequest,
  GetDomainOfInfluenceLogoRequest,
  GetDomainOfInfluenceRequest,
  ListDomainOfInfluencePartiesRequest,
  ListDomainOfInfluenceRequest,
  ListDomainOfInfluenceSnapshotRequest,
  ListTreeDomainOfInfluenceRequest,
  ListTreeDomainOfInfluenceSnapshotRequest,
  UpdateDomainOfInfluenceCountingCircleEntriesRequest,
  UpdateDomainOfInfluenceForAdminRequest,
  UpdateDomainOfInfluenceForElectionAdminRequest,
  UpdateDomainOfInfluenceRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/domain_of_influence_requests_pb';
import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DomainOfInfluenceCantonDefaults } from './models/canton-settings.model';
import { DomainOfInfluenceParty, DomainOfInfluencePartyProto } from './models/domain-of-influence-party.model';
import {
  DomainOfInfluenceVotingCardReturnAddress,
  DomainOfInfluenceVotingCardReturnAddressProto,
} from './models/domain-of-influence-return-address.model';
import {
  DomainOfInfluenceVotingCardPrintData,
  DomainOfInfluenceVotingCardPrintDataProto,
} from './models/domain-of-influence-voting-card-print-data.model';
import {
  DomainOfInfluenceVotingCardSwissPostData,
  DomainOfInfluenceVotingCardSwissPostDataProto,
} from './models/domain-of-influence-voting-card-swiss-post-data.model';
import { DomainOfInfluence, DomainOfInfluenceProto } from './models/domain-of-influence.model';
import { ExportConfiguration, ExportConfigurationProto } from './models/export.model';
import {
  ComparisonCountOfVotersConfiguration,
  ComparisonCountOfVotersConfigurationProto,
  ComparisonCountOfVotersCountingCircleEntry,
  ComparisonCountOfVotersCountingCircleEntryProto,
  ComparisonVoterParticipationConfiguration,
  ComparisonVoterParticipationConfigurationProto,
  ComparisonVotingChannelConfiguration,
  ComparisonVotingChannelConfigurationProto,
  PlausibilisationConfiguration,
  PlausibilisationConfigurationProto,
} from './models/plausibilisation.model';
import { mapToProtoContactPerson } from './utils/contact-person.utils';
import { fillProtoMap, toJsMap } from './utils/map.utils';
import { createDoubleValue } from './utils/proto.utils';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DomainOfInfluenceService extends GrpcService<DomainOfInfluenceServicePromiseClient> {
  private readonly restApiUrl: string;

  constructor(grpcBackend: GrpcBackendService, private readonly http: HttpClient, private readonly auth: AuthorizationService) {
    super(DomainOfInfluenceServicePromiseClient, environment, grpcBackend);
    this.restApiUrl = `${environment.restApiEndpoint}/domain-of-influences`;
  }

  public static mapToDomainOfInfluences(data: DomainOfInfluenceProto[] | undefined): DomainOfInfluence[] {
    if (!data) {
      return [];
    }

    return data.map(doi => this.mapToDomainOfInfluence(doi));
  }

  public static mapToDomainOfInfluence(doi: DomainOfInfluenceProto): DomainOfInfluence {
    const doiId = doi.getId();
    return {
      id: doiId,
      name: doi.getName(),
      shortName: doi.getShortName(),
      authorityName: doi.getAuthorityName(),
      secureConnectId: doi.getSecureConnectId(),
      type: doi.getType(),
      parentId: doi.getParentId(),
      childrenList: this.mapToDomainOfInfluences(doi.getChildrenList()),
      canton: doi.getCanton(),
      responsibleForVotingCards: doi.getResponsibleForVotingCards(),
      contactPerson: doi.getContactPerson()?.toObject(),
      createdOn: doi.getInfo()?.getCreatedOn()?.toDate(),
      modifiedOn: doi.getInfo()?.getModifiedOn()?.toDate(),
      deletedOn: doi.getInfo()?.getDeletedOn()?.toDate(),
      bfs: doi.getBfs(),
      code: doi.getCode(),
      sortNumber: doi.getSortNumber(),
      exportConfigurationsList: doi.getExportConfigurationsList().map(x => x.toObject()),
      returnAddress: doi.getReturnAddress()?.toObject(),
      printData: doi.getPrintData()?.toObject(),
      swissPostData: doi.getSwissPostData()?.toObject(),
      externalPrintingCenter: doi.getExternalPrintingCenter(),
      externalPrintingCenterEaiMessageType: doi.getExternalPrintingCenterEaiMessageType(),
      sapCustomerOrderNumber: doi.getSapCustomerOrderNumber(),
      hasLogo: doi.getHasLogo(),
      plausibilisationConfiguration: DomainOfInfluenceService.mapToPlausibilisationConfiguration(doi.getPlausibilisationConfiguration()),
      parties: doi.getPartiesList().map(x => DomainOfInfluenceService.mapToParty(x, doiId)!),
      nameForProtocol: doi.getNameForProtocol(),
      virtualTopLevel: doi.getVirtualTopLevel(),
      viewCountingCirclePartialResults: doi.getViewCountingCirclePartialResults(),
      votingCardColor: doi.getVotingCardColor(),
      electoralRegistrationEnabled: doi.getElectoralRegistrationEnabled(),
    };
  }

  public static mapToParty(data: DomainOfInfluencePartyProto | undefined, doiId?: string): DomainOfInfluenceParty | undefined {
    if (!data) {
      return undefined;
    }

    const partyDoiId = data.getDomainOfInfluenceId();
    return {
      id: data.getId(),
      name: toJsMap(data.getNameMap()),
      shortDescription: toJsMap(data.getShortDescriptionMap()),
      domainOfInfluenceId: data.getDomainOfInfluenceId(),
      inherited: !!doiId && doiId !== partyDoiId,
    };
  }

  private static mapToPlausibilisationConfiguration(
    data: PlausibilisationConfigurationProto | undefined,
  ): PlausibilisationConfiguration | undefined {
    if (!data) {
      return undefined;
    }

    return {
      comparisonValidVotingCardsWithAccountedBallotsThresholdPercent: data
        .getComparisonValidVotingCardsWithAccountedBallotsThresholdPercent()
        ?.getValue(),
      comparisonVoterParticipationConfigurationsList: data.getComparisonVoterParticipationConfigurationsList().map(x => ({
        ...x.toObject(),
        thresholdPercent: x.getThresholdPercent()?.getValue(),
      })),
      comparisonCountOfVotersConfigurationsList: data.getComparisonCountOfVotersConfigurationsList().map(x => ({
        ...x.toObject(),
        thresholdPercent: x.getThresholdPercent()?.getValue(),
      })),
      comparisonCountOfVotersCountingCircleEntriesList: data.getComparisonCountOfVotersCountingCircleEntriesList().map(x => x.toObject()),
      comparisonVotingChannelConfigurationsList: data.getComparisonVotingChannelConfigurationsList().map(x => ({
        ...x.toObject(),
        thresholdPercent: x.getThresholdPercent()?.getValue(),
      })),
    };
  }

  public async filterOnlyManagedByCurrentTenantAndNotVirtualTopLevel(dois: DomainOfInfluence[]): Promise<DomainOfInfluence[]> {
    const { id: tenantId } = await this.auth.getActiveTenant();
    return dois.filter(({ secureConnectId, virtualTopLevel }) => secureConnectId === tenantId && !virtualTopLevel);
  }

  public get(id: string): Promise<DomainOfInfluence> {
    const req = new GetDomainOfInfluenceRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluence(r),
    );
  }

  public listForCountingCircle(countingCircleId: string): Promise<DomainOfInfluence[]> {
    const req = new ListDomainOfInfluenceRequest();
    req.setCountingCircleId(countingCircleId);
    return this.request(
      c => c.list,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluences(r.getDomainOfInfluencesList()),
    );
  }

  public async listForCurrentTenant(): Promise<DomainOfInfluence[]> {
    const { id } = await this.auth.getActiveTenant();
    return await this.listForTenant(id);
  }

  public listForTenant(tenantId: string): Promise<DomainOfInfluence[]> {
    const req = new ListDomainOfInfluenceRequest();
    req.setSecureConnectId(tenantId);
    return this.request(
      c => c.list,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluences(r.getDomainOfInfluencesList()),
    );
  }

  public listForPoliticalBusiness(contestDomainOfInfluenceId: string): Promise<DomainOfInfluence[]> {
    const req = new ListDomainOfInfluenceRequest();
    req.setContestDomainOfInfluenceId(contestDomainOfInfluenceId);
    return this.request(
      c => c.list,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluences(r.getDomainOfInfluencesList()),
    );
  }

  public listTree(): Promise<DomainOfInfluence[]> {
    const req = new ListTreeDomainOfInfluenceRequest();
    return this.request(
      c => c.listTree,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluences(r.getDomainOfInfluencesList()),
    );
  }

  public create(data: DomainOfInfluence): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateDomainOfInfluenceRequest(data),
      r => r.getId(),
    );
  }

  public updateForAdmin(data: DomainOfInfluence): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateDomainOfInfluenceRequest(data, true));
  }

  public updateForElectionAdmin(data: DomainOfInfluence): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateDomainOfInfluenceRequest(data, false));
  }

  public updateCountingCircleEntries(id: string, countingCircleIds: string[]): Promise<void> {
    return this.requestEmptyResp(
      c => c.updateCountingCircleEntries,
      this.mapToUpdateDomainOfInfluenceCountingCircleEntriesRequest(id, countingCircleIds),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteDomainOfInfluenceRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public listTreeSnapshot(includeDeleted: boolean, dateTime?: Date): Promise<DomainOfInfluence[]> {
    const req = new ListTreeDomainOfInfluenceSnapshotRequest();
    req.setDateTime(TimestampUtil.toTimestamp(dateTime));
    req.setIncludeDeleted(includeDeleted);
    return this.request(
      c => c.listTreeSnapshot,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluences(r.getDomainOfInfluencesList()),
    );
  }

  public listForCountingCircleSnapshot(countingCircleId: string, dateTime?: Date): Promise<DomainOfInfluence[]> {
    const req = new ListDomainOfInfluenceSnapshotRequest();
    req.setCountingCircleId(countingCircleId);
    req.setDateTime(TimestampUtil.toTimestamp(dateTime));

    return this.request(
      c => c.listSnapshot,
      req,
      r => DomainOfInfluenceService.mapToDomainOfInfluences(r.getDomainOfInfluencesList()),
    );
  }

  public getCantonDefaults(domainOfInfluenceId: string): Promise<DomainOfInfluenceCantonDefaults> {
    const req = new GetDomainOfInfluenceCantonDefaultsRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    return this.request(
      c => c.getCantonDefaults,
      req,
      r => r.toObject(),
    );
  }

  public getLogoUrl(domainOfInfluenceId: string): Promise<string> {
    const req = new GetDomainOfInfluenceLogoRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    return this.request(
      c => c.getLogo,
      req,
      r => r.getLogoUrl(),
    );
  }

  public async updateLogo(domainOfInfluenceId: string, logo: File): Promise<void> {
    const formData = new FormData();
    formData.append('logo', logo);
    await firstValueFrom(this.http.post(`${this.restApiUrl}/${domainOfInfluenceId}/logo`, formData));
  }

  public deleteLogo(domainOfInfluenceId: string): Promise<void> {
    const req = new DeleteDomainOfInfluenceLogoRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    return this.requestEmptyResp(c => c.deleteLogo, req);
  }

  public listParties(domainOfInfluenceId: string): Promise<DomainOfInfluenceParty[]> {
    const req = new ListDomainOfInfluencePartiesRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    return this.request(
      c => c.listParties,
      req,
      r => r.getPartiesList()!.map(x => DomainOfInfluenceService.mapToParty(x, domainOfInfluenceId)!),
    );
  }

  private mapToCreateDomainOfInfluenceRequest(data: DomainOfInfluence): CreateDomainOfInfluenceRequest {
    const result = new CreateDomainOfInfluenceRequest();
    result.setName(data.name);
    result.setShortName(data.shortName);
    result.setSecureConnectId(data.secureConnectId);
    result.setAuthorityName(data.authorityName);
    result.setType(data.type);
    result.setParentId(data.parentId);
    result.setCanton(data.canton);
    result.setResponsibleForVotingCards(data.responsibleForVotingCards);
    result.setContactPerson(mapToProtoContactPerson(data.contactPerson));
    result.setBfs(data.bfs);
    result.setCode(data.code);
    result.setSortNumber(data.sortNumber);
    result.setNameForProtocol(data.nameForProtocol);
    result.setExportConfigurationsList(data.exportConfigurationsList.map(x => this.mapToExportConfigurationRequest(x)));
    result.setReturnAddress(this.mapToVotingCardReturnAddressProto(data.returnAddress));
    result.setPrintData(this.mapToVotingCardPrintDataProto(data.printData));
    result.setSwissPostData(this.mapToVotingCardSwissPostDataProto(data.swissPostData));
    result.setPlausibilisationConfiguration(this.mapToPlausibilisationConfigurationProto(data.plausibilisationConfiguration));
    result.setExternalPrintingCenter(data.externalPrintingCenter);
    result.setExternalPrintingCenterEaiMessageType(data.externalPrintingCenterEaiMessageType);
    result.setSapCustomerOrderNumber(data.sapCustomerOrderNumber);
    result.setPartiesList(this.filterOnlyUpdateablePartiesAndMapToProto(data));
    result.setVirtualTopLevel(data.virtualTopLevel);
    result.setViewCountingCirclePartialResults(data.viewCountingCirclePartialResults);
    result.setVotingCardColor(data.votingCardColor);
    return result;
  }

  private mapToExportConfigurationRequest(data: ExportConfiguration): ExportConfigurationProto {
    const req = new ExportConfigurationProto();
    req.setId(data.id);
    req.setDescription(data.description);
    req.setExportKeysList(data.exportKeysList);
    req.setEaiMessageType(data.eaiMessageType);
    req.setProvider(data.provider);
    return req;
  }

  private mapToUpdateDomainOfInfluenceRequest(data: DomainOfInfluence, forAdmin: boolean): UpdateDomainOfInfluenceRequest {
    const result = new UpdateDomainOfInfluenceRequest();

    if (forAdmin) {
      const adminRequest = new UpdateDomainOfInfluenceForAdminRequest();
      adminRequest.setId(data.id);
      adminRequest.setName(data.name);
      adminRequest.setShortName(data.shortName);
      adminRequest.setSecureConnectId(data.secureConnectId);
      adminRequest.setAuthorityName(data.authorityName);
      adminRequest.setType(data.type);
      adminRequest.setCanton(data.canton);
      adminRequest.setResponsibleForVotingCards(data.responsibleForVotingCards);
      adminRequest.setBfs(data.bfs);
      adminRequest.setCode(data.code);
      adminRequest.setSortNumber(data.sortNumber);
      adminRequest.setNameForProtocol(data.nameForProtocol);
      adminRequest.setExternalPrintingCenter(data.externalPrintingCenter);
      adminRequest.setExternalPrintingCenterEaiMessageType(data.externalPrintingCenterEaiMessageType);
      adminRequest.setSapCustomerOrderNumber(data.sapCustomerOrderNumber);
      adminRequest.setExportConfigurationsList(data.exportConfigurationsList.map(x => this.mapToExportConfigurationRequest(x)));
      adminRequest.setSwissPostData(this.mapToVotingCardSwissPostDataProto(data.swissPostData));
      adminRequest.setVirtualTopLevel(data.virtualTopLevel);
      adminRequest.setViewCountingCirclePartialResults(data.viewCountingCirclePartialResults);
      adminRequest.setElectoralRegistrationEnabled(data.electoralRegistrationEnabled);
      this.mapToDomainOfInfluenceElectionAdminOrAdminRequest(data, adminRequest);
      result.setAdminRequest(adminRequest);
    } else {
      const electionAdminRequest = new UpdateDomainOfInfluenceForElectionAdminRequest();
      electionAdminRequest.setId(data.id);
      this.mapToDomainOfInfluenceElectionAdminOrAdminRequest(data, electionAdminRequest);
      result.setElectionAdminRequest(electionAdminRequest);
    }

    return result;
  }

  private mapToDomainOfInfluenceElectionAdminOrAdminRequest(
    data: DomainOfInfluence,
    request: UpdateDomainOfInfluenceForAdminRequest | UpdateDomainOfInfluenceForElectionAdminRequest,
  ): void {
    request.setContactPerson(mapToProtoContactPerson(data.contactPerson));
    request.setReturnAddress(this.mapToVotingCardReturnAddressProto(data.returnAddress));
    request.setPrintData(this.mapToVotingCardPrintDataProto(data.printData));
    request.setExternalPrintingCenter(data.externalPrintingCenter);
    request.setExternalPrintingCenterEaiMessageType(data.externalPrintingCenterEaiMessageType);
    request.setSapCustomerOrderNumber(data.sapCustomerOrderNumber);
    request.setPlausibilisationConfiguration(this.mapToPlausibilisationConfigurationProto(data.plausibilisationConfiguration));
    request.setPartiesList(this.filterOnlyUpdateablePartiesAndMapToProto(data));
    request.setVotingCardColor(data.votingCardColor);
  }

  private mapToUpdateDomainOfInfluenceCountingCircleEntriesRequest(
    id: string,
    countingCircleIds: string[],
  ): UpdateDomainOfInfluenceCountingCircleEntriesRequest {
    const result = new UpdateDomainOfInfluenceCountingCircleEntriesRequest();
    result.setId(id);
    result.setCountingCircleIdsList(countingCircleIds);
    return result;
  }

  private mapToVotingCardPrintDataProto(
    data?: DomainOfInfluenceVotingCardPrintData,
  ): DomainOfInfluenceVotingCardPrintDataProto | undefined {
    if (!data) {
      return undefined;
    }

    const result = new DomainOfInfluenceVotingCardPrintDataProto();
    result.setShippingReturn(data.shippingReturn);
    result.setShippingAway(data.shippingAway);
    result.setShippingMethod(data.shippingMethod);
    result.setShippingVotingCardsToDeliveryAddress(data.shippingVotingCardsToDeliveryAddress);
    return result;
  }

  private mapToVotingCardSwissPostDataProto(
    data?: DomainOfInfluenceVotingCardSwissPostData,
  ): DomainOfInfluenceVotingCardSwissPostDataProto | undefined {
    if (!data) {
      return undefined;
    }

    const result = new DomainOfInfluenceVotingCardSwissPostDataProto();
    result.setInvoiceReferenceNumber(data.invoiceReferenceNumber);
    result.setFrankingLicenceReturnNumber(data.frankingLicenceReturnNumber);
    return result;
  }

  private mapToVotingCardReturnAddressProto(
    data?: DomainOfInfluenceVotingCardReturnAddress,
  ): DomainOfInfluenceVotingCardReturnAddressProto | undefined {
    if (!data) {
      return undefined;
    }

    const result = new DomainOfInfluenceVotingCardReturnAddressProto();
    result.setAddressLine1(data.addressLine1);
    result.setAddressLine2(data.addressLine2);
    result.setStreet(data.street);
    result.setZipCode(data.zipCode);
    result.setCountry(data.country);
    result.setCity(data.city);
    result.setAddressAddition(data.addressAddition);
    return result;
  }

  private mapToPlausibilisationConfigurationProto(
    data: PlausibilisationConfiguration | undefined,
  ): PlausibilisationConfigurationProto | undefined {
    if (!data) {
      return undefined;
    }

    const result = new PlausibilisationConfigurationProto();
    result.setComparisonVoterParticipationConfigurationsList(
      data.comparisonVoterParticipationConfigurationsList.map(this.mapToComparisonVoterParticipationConfiguration),
    );
    result.setComparisonCountOfVotersConfigurationsList(
      data.comparisonCountOfVotersConfigurationsList.map(this.mapToComparisonCountOfVotersConfiguration),
    );
    result.setComparisonCountOfVotersCountingCircleEntriesList(
      data.comparisonCountOfVotersCountingCircleEntriesList.map(this.mapToComparisonCountOfVotersCountingCircleEntry),
    );
    result.setComparisonVotingChannelConfigurationsList(
      data.comparisonVotingChannelConfigurationsList.map(this.mapToComparisonVotingChannelConfiguration),
    );
    result.setComparisonValidVotingCardsWithAccountedBallotsThresholdPercent(
      createDoubleValue(data.comparisonValidVotingCardsWithAccountedBallotsThresholdPercent),
    );
    return result;
  }

  private mapToComparisonVoterParticipationConfiguration(
    data: ComparisonVoterParticipationConfiguration,
  ): ComparisonVoterParticipationConfigurationProto {
    const result = new ComparisonVoterParticipationConfigurationProto();
    result.setMainLevel(data.mainLevel);
    result.setComparisonLevel(data.comparisonLevel);
    result.setThresholdPercent(createDoubleValue(data.thresholdPercent));
    return result;
  }

  private mapToComparisonCountOfVotersConfiguration(data: ComparisonCountOfVotersConfiguration): ComparisonCountOfVotersConfigurationProto {
    const result = new ComparisonCountOfVotersConfigurationProto();
    result.setCategory(data.category);
    result.setThresholdPercent(createDoubleValue(data.thresholdPercent));
    return result;
  }

  private mapToComparisonCountOfVotersCountingCircleEntry(
    data: ComparisonCountOfVotersCountingCircleEntry,
  ): ComparisonCountOfVotersCountingCircleEntryProto {
    const result = new ComparisonCountOfVotersCountingCircleEntryProto();
    result.setCategory(data.category);
    result.setCountingCircleId(data.countingCircleId);
    return result;
  }

  private mapToComparisonVotingChannelConfiguration(data: ComparisonVotingChannelConfiguration): ComparisonVotingChannelConfigurationProto {
    const result = new ComparisonVotingChannelConfigurationProto();
    result.setVotingChannel(data.votingChannel);
    result.setThresholdPercent(createDoubleValue(data.thresholdPercent));
    return result;
  }

  private filterOnlyUpdateablePartiesAndMapToProto(data: DomainOfInfluence): DomainOfInfluencePartyProto[] {
    return data.parties.filter(x => !x.inherited).map(x => this.mapToPartyProto(x));
  }

  private mapToPartyProto(data: DomainOfInfluenceParty): DomainOfInfluencePartyProto {
    const result = new DomainOfInfluencePartyProto();
    result.setId(data.id);
    fillProtoMap(result.getNameMap(), data.name);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    return result;
  }
}
