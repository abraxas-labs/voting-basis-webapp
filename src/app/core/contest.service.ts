/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ContestServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/contest_service_grpc_web_pb';
import {
  ArchiveContestRequest,
  CheckAvailabilityRequest,
  CreateContestRequest,
  DeleteContestRequest,
  GetContestRequest,
  GetPoliticalBusinessSummaryRequest,
  ListContestPastRequest,
  ListContestSummariesRequest,
  ListFuturePreconfiguredDatesRequest,
  ListPoliticalBusinessSummariesRequest,
  PastUnlockContestRequest,
  UpdateContestRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/contest_requests_pb';
import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DomainOfInfluenceService } from './domain-of-influence.service';
import {
  Contest,
  ContestDateAvailability,
  ContestProto,
  ContestSimple,
  ContestState,
  ContestSummary,
  ContestSummaryProto,
  PreconfiguredContestDate,
  PreconfiguredContestDateProto,
} from './models/contest.model';
import {
  PoliticalBusiness,
  PoliticalBusinessProto,
  PoliticalBusinessSummary,
  PoliticalBusinessSummaryProto,
  PoliticalBusinessType,
} from './models/political-business.model';
import { fillProtoMap, toJsMap } from './utils/map.utils';

@Injectable({
  providedIn: 'root',
})
export class ContestService extends GrpcService<ContestServicePromiseClient> {
  private static preconfiguredContestDateCache?: PreconfiguredContestDate[];

  constructor(grpcBackend: GrpcBackendService) {
    super(ContestServicePromiseClient, environment, grpcBackend);
  }

  public static mapToPoliticalBusiness(data: PoliticalBusinessProto): PoliticalBusiness {
    return {
      ...data.toObject(),
      domainOfInfluence: DomainOfInfluenceService.mapToDomainOfInfluence(data.getDomainOfInfluence()!),
      shortDescription: toJsMap(data.getShortDescriptionMap()),
      officialDescription: toJsMap(data.getOfficialDescriptionMap()),
    };
  }

  public create(data: Contest): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateContestRequest(data),
      r => r.getId(),
    );
  }

  public checkAvailability(data: Contest): Promise<ContestDateAvailability> {
    const req = new CheckAvailabilityRequest();
    req.setDate(TimestampUtil.toTimestamp(data.date));
    req.setDomainOfInfluenceId(data.domainOfInfluenceId);
    return this.request(
      c => c.checkAvailability,
      req,
      r => r.getAvailability(),
    );
  }

  public async update(data: Contest): Promise<void> {
    await this.request(
      c => c.update,
      this.mapToUpdateContestRequest(data),
      r => r,
    );
  }

  public get(id: string): Promise<Contest> {
    const req = new GetContestRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => this.mapToContest(r),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteContestRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public archive(id: string, archivePer?: Date): Promise<void> {
    const req = new ArchiveContestRequest();
    req.setId(id);
    req.setArchivePer(TimestampUtil.toTimestamp(archivePer));
    return this.requestEmptyResp(c => c.archive, req);
  }

  public pastUnlock(id: string): Promise<void> {
    const req = new PastUnlockContestRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.pastUnlock, req);
  }

  public listSummaries(...states: ContestState[]): Promise<ContestSummary[]> {
    const req = new ListContestSummariesRequest();
    req.setStatesList(states);

    return this.request(
      c => c.listSummaries,
      req,
      r => this.mapToContestSummaries(r.getContestSummariesList()),
    );
  }

  public async listFuturePreconfiguredDates(): Promise<PreconfiguredContestDate[]> {
    if (ContestService.preconfiguredContestDateCache) {
      return ContestService.preconfiguredContestDateCache;
    }

    const preconfiguredContestDates = await this.request(
      c => c.listFuturePreconfiguredDates,
      new ListFuturePreconfiguredDatesRequest(),
      r => this.mapToPreconfiguredDates(r.getPreconfiguredContestDatesList()),
    );
    ContestService.preconfiguredContestDateCache = preconfiguredContestDates;
    return preconfiguredContestDates;
  }

  public async listPast(data: Contest): Promise<ContestSimple[]> {
    const req = new ListContestPastRequest();
    req.setDate(TimestampUtil.toTimestamp(data.date));
    req.setDomainOfInfluenceId(data.domainOfInfluenceId);

    return this.request(
      c => c.listPast,
      req,
      r => r.getContestsList().map(x => this.mapToContestSimple(x)),
    );
  }

  public getPoliticalBusinessSummary(type: PoliticalBusinessType, id: string): Promise<PoliticalBusinessSummary> {
    const req = new GetPoliticalBusinessSummaryRequest();
    req.setPoliticalBusinessId(id);
    req.setPoliticalBusinessType(type);

    return this.request(
      c => c.getPoliticalBusinessSummary,
      req,
      r => this.mapToPoliticalBusinessSummary(r),
    );
  }

  public listPoliticalBusinessSummaries(contestId: string): Promise<PoliticalBusinessSummary[]> {
    const req = new ListPoliticalBusinessSummariesRequest();
    req.setContestId(contestId);

    return this.request(
      c => c.listPoliticalBusinessSummaries,
      req,
      r => this.mapToPoliticalBusinessSummaries(r.getPoliticalBusinessSummariesList()),
    );
  }

  private mapToContestSimple(data: ContestProto): ContestSimple {
    return {
      id: data.getId(),
      date: data.getDate()!.toDate(),
    };
  }

  private mapToContest(data: ContestProto): Contest {
    const endOfTestingPhase = data.getEndOfTestingPhase();
    const state = data.getState();
    return {
      id: data.getId(),
      date: data.getDate()?.toDate(),
      domainOfInfluenceId: data.getDomainOfInfluenceId(),
      description: toJsMap(data.getDescriptionMap()),
      endOfTestingPhase: endOfTestingPhase?.toDate(),
      testingPhaseEnded: endOfTestingPhase ? endOfTestingPhase.toDate() < new Date() : false,
      eVoting: data.getEVoting(),
      eVotingFrom: data.getEVotingFrom()?.toDate(),
      eVotingTo: data.getEVotingTo()?.toDate(),
      politicalBusinesses: data.getPoliticalBusinessesList().map(d => ContestService.mapToPoliticalBusiness(d)),
      politicalBusinessUnions: data.getPoliticalBusinessUnionsList().map(d => d.toObject()),
      state,
      locked: state === ContestState.CONTEST_STATE_PAST_LOCKED || state === ContestState.CONTEST_STATE_ARCHIVED,
      domainOfInfluence: DomainOfInfluenceService.mapToDomainOfInfluence(data.getDomainOfInfluence()!),
      previousContestId: data.getPreviousContestId(),
    };
  }

  private mapToContestSummaries(data: ContestSummaryProto[]): ContestSummary[] {
    return data.map(cs => this.mapToContestSummary(cs));
  }

  private mapToContestSummary(data: ContestSummaryProto): ContestSummary {
    const endOfTestingPhase = data.getEndOfTestingPhase();
    const state = data.getState();
    return {
      id: data.getId(),
      date: data.getDate()?.toDate(),
      domainOfInfluenceId: data.getDomainOfInfluence()?.getId()!,
      description: toJsMap(data.getDescriptionMap()),
      endOfTestingPhase: endOfTestingPhase?.toDate(),
      testingPhaseEnded: endOfTestingPhase ? endOfTestingPhase.toDate() < new Date() : false,
      isPreconfiguredDate: false,
      contestEntriesDetails: data.getContestEntriesDetailsList().map(d => d.toObject()),
      eVoting: data.getEVoting(),
      eVotingFrom: data.getEVotingFrom()?.toDate(),
      eVotingTo: data.getEVotingTo()?.toDate(),
      state,
      archivePer: data.getArchivePer()?.toDate(),
      locked: state === ContestState.CONTEST_STATE_PAST_LOCKED || state === ContestState.CONTEST_STATE_ARCHIVED,
      domainOfInfluence: DomainOfInfluenceService.mapToDomainOfInfluence(data.getDomainOfInfluence()!),
      politicalBusinessUnions: [],
      politicalBusinesses: [],
    };
  }

  private mapToPreconfiguredDates(data: PreconfiguredContestDateProto[]): PreconfiguredContestDate[] {
    return data.map(pcd => this.mapToPreconfiguredDate(pcd));
  }

  private mapToPreconfiguredDate(data: PreconfiguredContestDateProto): PreconfiguredContestDate {
    return { date: data.getDate()!.toDate() };
  }

  private mapToUpdateContestRequest(data: Contest): UpdateContestRequest {
    const request = new UpdateContestRequest();
    request.setId(data.id);
    request.setDate(TimestampUtil.toTimestamp(data.date));
    request.setDomainOfInfluenceId(data.domainOfInfluenceId);
    fillProtoMap(request.getDescriptionMap(), data.description);
    request.setEndOfTestingPhase(TimestampUtil.toTimestamp(data.endOfTestingPhase));
    request.setEVoting(data.eVoting);
    request.setEVotingFrom(TimestampUtil.toTimestamp(data.eVotingFrom));
    request.setEVotingTo(TimestampUtil.toTimestamp(data.eVotingTo));
    request.setPreviousContestId(data.previousContestId ?? '');
    return request;
  }

  private mapToCreateContestRequest(data: Contest): CreateContestRequest {
    const request = new CreateContestRequest();
    request.setDate(TimestampUtil.toTimestamp(data.date));
    request.setDomainOfInfluenceId(data.domainOfInfluenceId);
    fillProtoMap(request.getDescriptionMap(), data.description);
    request.setEndOfTestingPhase(TimestampUtil.toTimestamp(data.endOfTestingPhase));
    request.setEVoting(data.eVoting);
    request.setEVotingFrom(TimestampUtil.toTimestamp(data.eVotingFrom));
    request.setEVotingTo(TimestampUtil.toTimestamp(data.eVotingTo));
    request.setPreviousContestId(data.previousContestId ?? '');
    return request;
  }

  private mapToPoliticalBusinessSummaries(data: PoliticalBusinessSummaryProto[]): PoliticalBusinessSummary[] {
    return data.map(x => this.mapToPoliticalBusinessSummary(x));
  }

  private mapToPoliticalBusinessSummary(data: PoliticalBusinessSummaryProto): PoliticalBusinessSummary {
    return {
      ...data.toObject(),
      shortDescription: toJsMap(data.getShortDescriptionMap()),
      officialDescription: toJsMap(data.getOfficialDescriptionMap()),
      domainOfInfluence: DomainOfInfluenceService.mapToDomainOfInfluence(data.getDomainOfInfluence()!),
    };
  }
}
