/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EntityOrder } from '@abraxas/voting-basis-service-proto/grpc/models/entity_order_pb';
import { ProportionalElectionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/proportional_election_service_grpc_web_pb';
import {
  CreateProportionalElectionCandidateRequest,
  CreateProportionalElectionListRequest,
  CreateProportionalElectionListUnionRequest,
  CreateProportionalElectionRequest,
  DeleteProportionalElectionCandidateRequest,
  DeleteProportionalElectionListRequest,
  DeleteProportionalElectionListUnionRequest,
  DeleteProportionalElectionRequest,
  GetProportionalElectionCandidatesRequest,
  GetProportionalElectionListsRequest,
  GetProportionalElectionListUnionsRequest,
  GetProportionalElectionRequest,
  ListProportionalElectionRequest,
  ReorderProportionalElectionCandidatesRequest,
  ReorderProportionalElectionListsRequest,
  ReorderProportionalElectionListUnionsRequest,
  UpdateProportionalElectionActiveStateRequest,
  UpdateProportionalElectionCandidateRequest,
  UpdateProportionalElectionListRequest,
  UpdateProportionalElectionListUnionEntriesRequest,
  UpdateProportionalElectionListUnionMainListRequest,
  UpdateProportionalElectionListUnionRequest,
  UpdateProportionalElectionRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/proportional_election_requests_pb';
import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DomainOfInfluenceService } from './domain-of-influence.service';
import { LanguageService } from './language.service';
import { PoliticalBusiness, PoliticalBusinessType } from './models/political-business.model';
import {
  ProportionalElection,
  ProportionalElectionCandidate,
  ProportionalElectionCandidateProto,
  ProportionalElectionList,
  ProportionalElectionListProto,
  ProportionalElectionListUnion,
  ProportionalElectionListUnionProto,
  ProportionalElectionProto,
} from './models/proportional-election.model';
import { mapToEntityOrders } from './utils/entity-order.utils';
import { fillProtoMap, toJsMap } from './utils/map.utils';

@Injectable({
  providedIn: 'root',
})
export class ProportionalElectionService extends GrpcService<ProportionalElectionServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService, private readonly languageService: LanguageService) {
    super(ProportionalElectionServicePromiseClient, environment, grpcBackend);
  }

  public static mapToProportionalElection(election: ProportionalElectionProto): ProportionalElection {
    return {
      ...election.toObject(),
      shortDescription: toJsMap(election.getShortDescriptionMap()),
      officialDescription: toJsMap(election.getOfficialDescriptionMap()),
    };
  }

  public create(data: ProportionalElection): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateProportionalElectionRequest(data),
      r => r.getId(),
    );
  }

  public update(data: ProportionalElection): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateProportionalElectionRequest(data));
  }

  public updateActiveState(id: string, active: boolean): Promise<void> {
    const req = new UpdateProportionalElectionActiveStateRequest();
    req.setId(id);
    req.setActive(active);
    return this.requestEmptyResp(c => c.updateActiveState, req);
  }

  public get(id: string): Promise<ProportionalElection> {
    const req = new GetProportionalElectionRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => ProportionalElectionService.mapToProportionalElection(r),
    );
  }

  public list(contestId: string): Promise<ProportionalElection[]> {
    const req = new ListProportionalElectionRequest();
    req.setContestId(contestId);
    return this.request(
      c => c.list,
      req,
      r => r.getProportionalElectionsList().map(e => ProportionalElectionService.mapToProportionalElection(e)),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteProportionalElectionRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public listLists(proportionalElectionId: string): Promise<ProportionalElectionList[]> {
    const req = new GetProportionalElectionListsRequest();
    req.setProportionalElectionId(proportionalElectionId);
    return this.request(
      c => c.getLists,
      req,
      r => r.getListsList().map(l => this.mapToProportionalElectionList(l)),
    );
  }

  public createList(data: ProportionalElectionList): Promise<string> {
    return this.request(
      c => c.createList,
      this.mapToCreateProportionalElectionListRequest(data),
      r => r.toObject().id,
    );
  }

  public async updateList(data: ProportionalElectionList): Promise<void> {
    await this.request(
      c => c.updateList,
      this.mapToUpdateProportionalElectionListRequest(data),
      r => r,
    );
  }

  public async reorderLists(electionId: string, lists: ProportionalElectionList[]): Promise<void> {
    const req = new ReorderProportionalElectionListsRequest();
    req.setProportionalElectionId(electionId);
    req.setOrders(mapToEntityOrders(lists));
    await this.requestEmptyResp(c => c.reorderLists, req);
  }

  public deleteList(id: string): Promise<void> {
    const req = new DeleteProportionalElectionListRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteList, req);
  }

  public listListUnions(proportionalElectionId: string): Promise<ProportionalElectionListUnion[]> {
    const req = new GetProportionalElectionListUnionsRequest();
    req.setProportionalElectionId(proportionalElectionId);
    return this.request(
      c => c.getListUnions,
      req,
      r => this.mapToProportionalElectionListUnions(r.getProportionalElectionListUnionsList()),
    );
  }

  public createListUnion(data: ProportionalElectionListUnion): Promise<string> {
    return this.request(
      c => c.createListUnion,
      this.mapToCreateProportionalElectionListUnionRequest(data),
      r => r.getId(),
    );
  }

  public updateListUnion(data: ProportionalElectionListUnion): Promise<void> {
    return this.requestEmptyResp(c => c.updateListUnion, this.mapToUpdateProportionalElectionListUnionRequest(data));
  }

  public updateListUnionEntries(listUnionId: string, listIds: string[]): Promise<void> {
    const req = new UpdateProportionalElectionListUnionEntriesRequest();
    req.setProportionalElectionListUnionId(listUnionId);
    req.setProportionalElectionListIdsList(listIds);

    return this.requestEmptyResp(c => c.updateListUnionEntries, req);
  }

  public updateListUnionMainList(listUnionId: string, mainListId: string): Promise<void> {
    const req = new UpdateProportionalElectionListUnionMainListRequest();
    req.setProportionalElectionListUnionId(listUnionId);
    req.setProportionalElectionMainListId(mainListId);

    return this.requestEmptyResp(c => c.updateListUnionMainList, req);
  }

  public async reorderListUnions(electionId: string, listUnions: ProportionalElectionListUnion[], rootListUnionId?: string): Promise<void> {
    const req = new ReorderProportionalElectionListUnionsRequest();
    req.setProportionalElectionId(electionId);
    req.setProportionalElectionRootListUnionId(rootListUnionId ?? '');
    req.setOrders(mapToEntityOrders(listUnions));
    await this.request(
      c => c.reorderListUnions,
      req,
      x => x,
    );
  }

  public deleteListUnion(id: string): Promise<void> {
    const req = new DeleteProportionalElectionListUnionRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteListUnion, req);
  }

  public listCandidates(proportionalElectionListId: string): Promise<ProportionalElectionCandidate[]> {
    const req = new GetProportionalElectionCandidatesRequest();
    req.setProportionalElectionListId(proportionalElectionListId);
    return this.request(
      c => c.getCandidates,
      req,
      r => r.getCandidatesList().map(c => this.mapToProportionalElectionCandidate(c)),
    );
  }

  public createCandidate(data: ProportionalElectionCandidate): Promise<ProportionalElectionCandidate> {
    return this.request(
      c => c.createCandidate,
      this.mapToCreateProportionalElectionCandidateRequest(data),
      r => ({ ...data, id: r.getId() }),
    );
  }

  public updateCandidate(data: ProportionalElectionCandidate): Promise<ProportionalElectionCandidate> {
    return this.request(
      c => c.updateCandidate,
      this.mapToUpdateProportionalElectionCandidateRequest(data),
      r => data,
    );
  }

  public async reorderCandidates(listId: string, candidates: ProportionalElectionCandidate[]): Promise<void> {
    const req = new ReorderProportionalElectionCandidatesRequest();
    req.setProportionalElectionListId(listId);

    const orders = mapToEntityOrders(candidates);
    for (const candidate of candidates.filter(x => x.accumulated)) {
      const accumulatedOrder = new EntityOrder();
      accumulatedOrder.setId(candidate.id);
      accumulatedOrder.setPosition(candidate.accumulatedPosition);
      orders.addOrders(accumulatedOrder);
    }
    req.setOrders(orders);
    await this.request(
      c => c.reorderCandidates,
      req,
      x => x,
    );
  }

  public deleteCandidate(id: string): Promise<void> {
    const req = new DeleteProportionalElectionCandidateRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteCandidate, req);
  }

  public mapToProportionalElectionListUnions(data: ProportionalElectionListUnionProto[]): ProportionalElectionListUnion[] {
    return data.map(lu => this.mapDetailToProportionalElectionListUnion(lu));
  }

  public mapDetailToProportionalElectionListUnion(data: ProportionalElectionListUnionProto): ProportionalElectionListUnion {
    const children = data.getProportionalElectionSubListUnionsList();

    return {
      id: data.getId(),
      proportionalElectionId: data.getProportionalElectionId(),
      description: toJsMap(data.getDescriptionMap()),
      position: data.getPosition(),
      proportionalElectionRootListUnionId: data.getProportionalElectionRootListUnionId(),
      proportionalElectionSubListUnions: children.length ? this.mapToProportionalElectionListUnions(children) : [],
      proportionalElectionListIds: data.getProportionalElectionListIdsList(),
      proportionalElectionMainListId: data.getProportionalElectionMainListId(),
    };
  }

  public mapToPoliticalBusinesses(data: ProportionalElection[]): PoliticalBusiness[] {
    return data.map(m => this.mapToPoliticalBusiness(m));
  }

  public mapToPoliticalBusiness(data: ProportionalElection): PoliticalBusiness {
    return {
      id: data.id,
      politicalBusinessNumber: data.politicalBusinessNumber,
      officialDescription: data.officialDescription,
      shortDescription: data.shortDescription,
      politicalBusinessType: PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION,
      active: data.active,
      domainOfInfluence: {
        id: data.domainOfInfluenceId,
      },
    } as PoliticalBusiness;
  }

  private mapToProportionalElectionList(list: ProportionalElectionListProto): ProportionalElectionList {
    const description = toJsMap(list.getDescriptionMap());
    return {
      ...list.toObject(),
      shortDescription: toJsMap(list.getShortDescriptionMap()),
      description: description,
      listUnionDescription: toJsMap(list.getListUnionDescriptionMap()),
      subListUnionDescription: toJsMap(list.getSubListUnionDescriptionMap()),
      orderNumberAndDescription: `${list.getOrderNumber()} ${this.languageService.getTranslationForCurrentLang(description)}`,
    };
  }

  private mapToCreateProportionalElectionRequest(data: ProportionalElection): CreateProportionalElectionRequest {
    const result = new CreateProportionalElectionRequest();
    result.setPoliticalBusinessNumber(data.politicalBusinessNumber);
    fillProtoMap(result.getOfficialDescriptionMap(), data.officialDescription);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setNumberOfMandates(data.numberOfMandates);
    result.setMandateAlgorithm(data.mandateAlgorithm);
    result.setCandidateCheckDigit(data.candidateCheckDigit);
    result.setBallotBundleSize(data.ballotBundleSize);
    result.setBallotBundleSampleSize(data.ballotBundleSampleSize);
    result.setAutomaticBallotBundleNumberGeneration(data.automaticBallotBundleNumberGeneration);
    result.setBallotNumberGeneration(data.ballotNumberGeneration);
    result.setAutomaticEmptyVoteCounting(data.automaticEmptyVoteCounting);
    result.setEnforceEmptyVoteCountingForCountingCircles(data.enforceEmptyVoteCountingForCountingCircles);
    result.setDomainOfInfluenceId(data.domainOfInfluenceId);
    result.setContestId(data.contestId);
    result.setReviewProcedure(data.reviewProcedure);
    result.setEnforceReviewProcedureForCountingCircles(data.enforceReviewProcedureForCountingCircles);
    return result;
  }

  private mapToUpdateProportionalElectionRequest(data: ProportionalElection): UpdateProportionalElectionRequest {
    const result = new UpdateProportionalElectionRequest();
    result.setId(data.id);
    result.setPoliticalBusinessNumber(data.politicalBusinessNumber);
    fillProtoMap(result.getOfficialDescriptionMap(), data.officialDescription);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setNumberOfMandates(data.numberOfMandates);
    result.setMandateAlgorithm(data.mandateAlgorithm);
    result.setCandidateCheckDigit(data.candidateCheckDigit);
    result.setBallotBundleSize(data.ballotBundleSize);
    result.setBallotBundleSampleSize(data.ballotBundleSampleSize);
    result.setAutomaticBallotBundleNumberGeneration(data.automaticBallotBundleNumberGeneration);
    result.setBallotNumberGeneration(data.ballotNumberGeneration);
    result.setAutomaticEmptyVoteCounting(data.automaticEmptyVoteCounting);
    result.setEnforceEmptyVoteCountingForCountingCircles(data.enforceEmptyVoteCountingForCountingCircles);
    result.setDomainOfInfluenceId(data.domainOfInfluenceId);
    result.setContestId(data.contestId);
    result.setReviewProcedure(data.reviewProcedure);
    result.setEnforceReviewProcedureForCountingCircles(data.enforceReviewProcedureForCountingCircles);
    return result;
  }

  private mapToCreateProportionalElectionListRequest(data: ProportionalElectionList): CreateProportionalElectionListRequest {
    const result = new CreateProportionalElectionListRequest();
    result.setOrderNumber(data.orderNumber);
    fillProtoMap(result.getDescriptionMap(), data.description);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setBlankRowCount(data.blankRowCount);
    result.setPosition(data.position);
    result.setProportionalElectionId(data.proportionalElectionId);
    return result;
  }

  private mapToUpdateProportionalElectionListRequest(data: ProportionalElectionList): UpdateProportionalElectionListRequest {
    const result = new UpdateProportionalElectionListRequest();
    result.setId(data.id);
    result.setOrderNumber(data.orderNumber);
    fillProtoMap(result.getDescriptionMap(), data.description);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setBlankRowCount(data.blankRowCount);
    result.setPosition(data.position);
    result.setProportionalElectionId(data.proportionalElectionId);
    return result;
  }

  private mapToCreateProportionalElectionListUnionRequest(data: ProportionalElectionListUnion): CreateProportionalElectionListUnionRequest {
    const result = new CreateProportionalElectionListUnionRequest();
    result.setProportionalElectionRootListUnionId(data.proportionalElectionRootListUnionId);
    result.setPosition(data.position);
    fillProtoMap(result.getDescriptionMap(), data.description);
    result.setProportionalElectionId(data.proportionalElectionId);
    return result;
  }

  private mapToUpdateProportionalElectionListUnionRequest(data: ProportionalElectionListUnion): UpdateProportionalElectionListUnionRequest {
    const result = new UpdateProportionalElectionListUnionRequest();
    result.setId(data.id);
    result.setProportionalElectionRootListUnionId(data.proportionalElectionRootListUnionId);
    result.setPosition(data.position);
    fillProtoMap(result.getDescriptionMap(), data.description);
    result.setProportionalElectionId(data.proportionalElectionId);
    return result;
  }

  private mapToProportionalElectionCandidate(data: ProportionalElectionCandidateProto): ProportionalElectionCandidate {
    return {
      id: data.getId(),
      firstName: data.getFirstName(),
      lastName: data.getLastName(),
      politicalFirstName: data.getPoliticalFirstName(),
      politicalLastName: data.getPoliticalLastName(),
      incumbent: data.getIncumbent(),
      dateOfBirth: data.getDateOfBirth()!.toDate(),
      locality: data.getLocality(),
      number: data.getNumber(),
      occupation: toJsMap(data.getOccupationMap()),
      title: data.getTitle(),
      occupationTitle: toJsMap(data.getOccupationTitleMap()),
      sex: data.getSex(),
      zipCode: data.getZipCode(),
      proportionalElectionListId: data.getProportionalElectionListId(),
      position: data.getPosition(),
      accumulated: data.getAccumulated(),
      accumulatedPosition: data.getAccumulatedPosition(),
      party: DomainOfInfluenceService.mapToParty(data.getParty()),
      origin: data.getOrigin(),
    };
  }

  private mapToCreateProportionalElectionCandidateRequest(data: ProportionalElectionCandidate): CreateProportionalElectionCandidateRequest {
    const result = new CreateProportionalElectionCandidateRequest();
    result.setFirstName(data.firstName);
    result.setLastName(data.lastName);
    result.setPoliticalFirstName(data.politicalFirstName);
    result.setPoliticalLastName(data.politicalLastName);
    result.setIncumbent(data.incumbent);
    result.setDateOfBirth(TimestampUtil.toTimestamp(data.dateOfBirth));
    result.setLocality(data.locality);
    result.setNumber(data.number);
    fillProtoMap(result.getOccupationMap(), data.occupation);
    result.setTitle(data.title);
    fillProtoMap(result.getOccupationTitleMap(), data.occupationTitle);
    result.setSex(data.sex);
    result.setZipCode(data.zipCode);
    result.setProportionalElectionListId(data.proportionalElectionListId);
    result.setPosition(data.position);
    result.setAccumulated(data.accumulated);
    result.setAccumulatedPosition(data.accumulatedPosition);
    result.setPartyId(data.party!.id);
    result.setOrigin(data.origin);
    return result;
  }

  private mapToUpdateProportionalElectionCandidateRequest(data: ProportionalElectionCandidate): UpdateProportionalElectionCandidateRequest {
    const result = new UpdateProportionalElectionCandidateRequest();
    result.setId(data.id);
    result.setFirstName(data.firstName);
    result.setLastName(data.lastName);
    result.setPoliticalFirstName(data.politicalFirstName);
    result.setPoliticalLastName(data.politicalLastName);
    result.setIncumbent(data.incumbent);
    result.setDateOfBirth(TimestampUtil.toTimestamp(data.dateOfBirth));
    result.setLocality(data.locality);
    result.setNumber(data.number);
    fillProtoMap(result.getOccupationMap(), data.occupation);
    result.setTitle(data.title);
    fillProtoMap(result.getOccupationTitleMap(), data.occupationTitle);
    result.setSex(data.sex);
    result.setZipCode(data.zipCode);
    result.setProportionalElectionListId(data.proportionalElectionListId);
    result.setPosition(data.position);
    result.setAccumulated(data.accumulated);
    result.setAccumulatedPosition(data.accumulatedPosition);
    result.setPartyId(data.party!.id);
    result.setOrigin(data.origin);
    return result;
  }
}
