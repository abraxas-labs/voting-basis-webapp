/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { MajorityElectionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/majority_election_service_grpc_web_pb';
import {
  CreateMajorityElectionCandidateRequest,
  CreateMajorityElectionRequest,
  DeleteMajorityElectionCandidateRequest,
  DeleteMajorityElectionRequest,
  GetMajorityElectionRequest,
  ListMajorityElectionCandidatesRequest,
  ListMajorityElectionRequest,
  ReorderMajorityElectionCandidatesRequest,
  UpdateMajorityElectionActiveStateRequest,
  UpdateMajorityElectionCandidateRequest,
  UpdateMajorityElectionRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/majority_election_requests_pb';
import { SexType } from '@abraxas/voting-basis-service-proto/grpc/shared/sex_pb';
import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  MajorityElection,
  MajorityElectionCandidate,
  MajorityElectionCandidateProto,
  MajorityElectionProto,
} from './models/majority-election.model';
import { PoliticalBusiness, PoliticalBusinessType } from './models/political-business.model';
import { mapToEntityOrders } from './utils/entity-order.utils';
import { fillProtoMap, toJsMap } from './utils/map.utils';
import { createInt32Value } from './utils/proto.utils';

@Injectable({
  providedIn: 'root',
})
export class MajorityElectionService extends GrpcService<MajorityElectionServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(MajorityElectionServicePromiseClient, environment, grpcBackend);
  }

  public static mapToMajorityElectionCandidate(data: MajorityElectionCandidateProto): MajorityElectionCandidate {
    return {
      id: data.getId(),
      firstName: data.getFirstName(),
      lastName: data.getLastName(),
      politicalFirstName: data.getPoliticalFirstName(),
      politicalLastName: data.getPoliticalLastName(),
      incumbent: data.getIncumbent(),
      dateOfBirth: data.getDateOfBirth()?.toDate(),
      locality: data.getLocality(),
      number: data.getNumber(),
      occupation: toJsMap(data.getOccupationMap()),
      title: data.getTitle(),
      occupationTitle: toJsMap(data.getOccupationTitleMap()),
      party: toJsMap(data.getPartyMap()),
      sex: data.getSex(),
      zipCode: data.getZipCode(),
      majorityElectionId: data.getMajorityElectionId(),
      position: data.getPosition(),
      origin: data.getOrigin(),
      street: data.getStreet(),
      houseNumber: data.getHouseNumber(),
      country: data.getCountry(),
    };
  }

  public static mapToMajorityElection(election: MajorityElectionProto): MajorityElection {
    return {
      ...election.toObject(),
      shortDescription: toJsMap(election.getShortDescriptionMap()),
      officialDescription: toJsMap(election.getOfficialDescriptionMap()),
      federalIdentification: election.getFederalIdentification()?.getValue(),
    };
  }

  public create(data: MajorityElection): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateMajorityElectionRequest(data),
      r => r.getId(),
    );
  }

  public update(data: MajorityElection): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateMajorityElectionRequest(data));
  }

  public async reorderCandidates(electionId: string, candidates: MajorityElectionCandidate[]): Promise<void> {
    const req = new ReorderMajorityElectionCandidatesRequest();
    req.setMajorityElectionId(electionId);
    req.setOrders(mapToEntityOrders(candidates));
    await this.request(
      c => c.reorderCandidates,
      req,
      x => x,
    );
  }

  public updateActiveState(id: string, active: boolean): Promise<void> {
    const req = new UpdateMajorityElectionActiveStateRequest();
    req.setId(id);
    req.setActive(active);
    return this.requestEmptyResp(c => c.updateActiveState, req);
  }

  public get(id: string): Promise<MajorityElection> {
    const req = new GetMajorityElectionRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => MajorityElectionService.mapToMajorityElection(r),
    );
  }

  public list(contestId: string): Promise<MajorityElection[]> {
    const req = new ListMajorityElectionRequest();
    req.setContestId(contestId);
    return this.request(
      c => c.list,
      req,
      r => r.getMajorityElectionsList().map(e => MajorityElectionService.mapToMajorityElection(e)),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteMajorityElectionRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public listCandidates(majorityElectionId: string): Promise<MajorityElectionCandidate[]> {
    const req = new ListMajorityElectionCandidatesRequest();
    req.setMajorityElectionId(majorityElectionId);
    return this.request(
      c => c.listCandidates,
      req,
      r => r.getCandidatesList().map(c => MajorityElectionService.mapToMajorityElectionCandidate(c)),
    );
  }

  public createCandidate(data: MajorityElectionCandidate): Promise<string> {
    return this.request(
      c => c.createCandidate,
      this.mapToCreateMajorityElectionCandidateRequest(data),
      r => r.getId(),
    );
  }

  public updateCandidate(data: MajorityElectionCandidate): Promise<void> {
    return this.requestEmptyResp(c => c.updateCandidate, this.mapToUpdateMajorityElectionCandidateRequest(data));
  }

  public deleteCandidate(id: string): Promise<void> {
    const req = new DeleteMajorityElectionCandidateRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteCandidate, req);
  }

  public mapToPoliticalBusinesses(data: MajorityElection[]): PoliticalBusiness[] {
    return data.map(m => this.mapToPoliticalBusiness(m));
  }

  public mapToPoliticalBusiness(data: MajorityElection): PoliticalBusiness {
    return {
      id: data.id,
      politicalBusinessNumber: data.politicalBusinessNumber,
      officialDescription: data.officialDescription,
      shortDescription: data.shortDescription,
      politicalBusinessType: PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION,
      active: data.active,
      domainOfInfluence: {
        id: data.domainOfInfluenceId,
      },
    } as PoliticalBusiness;
  }

  private mapToCreateMajorityElectionRequest(data: MajorityElection): CreateMajorityElectionRequest {
    const result = new CreateMajorityElectionRequest();
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
    result.setResultEntry(data.resultEntry);
    result.setEnforceResultEntryForCountingCircles(data.enforceResultEntryForCountingCircles);
    result.setDomainOfInfluenceId(data.domainOfInfluenceId);
    result.setContestId(data.contestId);
    result.setReportDomainOfInfluenceLevel(data.reportDomainOfInfluenceLevel);
    result.setReviewProcedure(data.reviewProcedure);
    result.setEnforceReviewProcedureForCountingCircles(data.enforceReviewProcedureForCountingCircles);
    result.setEnforceCandidateCheckDigitForCountingCircles(data.enforceCandidateCheckDigitForCountingCircles);
    result.setIndividualCandidatesDisabled(data.individualCandidatesDisabled);
    result.setFederalIdentification(createInt32Value(data.federalIdentification));
    return result;
  }

  private mapToUpdateMajorityElectionRequest(data: MajorityElection): UpdateMajorityElectionRequest {
    const result = new UpdateMajorityElectionRequest();
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
    result.setResultEntry(data.resultEntry);
    result.setEnforceResultEntryForCountingCircles(data.enforceResultEntryForCountingCircles);
    result.setDomainOfInfluenceId(data.domainOfInfluenceId);
    result.setContestId(data.contestId);
    result.setReportDomainOfInfluenceLevel(data.reportDomainOfInfluenceLevel);
    result.setReviewProcedure(data.reviewProcedure);
    result.setEnforceReviewProcedureForCountingCircles(data.enforceReviewProcedureForCountingCircles);
    result.setEnforceCandidateCheckDigitForCountingCircles(data.enforceCandidateCheckDigitForCountingCircles);
    result.setIndividualCandidatesDisabled(data.individualCandidatesDisabled);
    result.setFederalIdentification(createInt32Value(data.federalIdentification));
    return result;
  }

  private mapToCreateMajorityElectionCandidateRequest(data: MajorityElectionCandidate): CreateMajorityElectionCandidateRequest {
    const result = new CreateMajorityElectionCandidateRequest();
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
    fillProtoMap(result.getPartyMap(), data.party);
    result.setSex(data.sex ?? SexType.SEX_TYPE_UNSPECIFIED);
    result.setZipCode(data.zipCode);
    result.setMajorityElectionId(data.majorityElectionId);
    result.setPosition(data.position);
    result.setOrigin(data.origin);
    result.setStreet(data.street);
    result.setHouseNumber(data.houseNumber);
    result.setCountry(data.country);
    return result;
  }

  private mapToUpdateMajorityElectionCandidateRequest(data: MajorityElectionCandidate): UpdateMajorityElectionCandidateRequest {
    const result = new UpdateMajorityElectionCandidateRequest();
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
    fillProtoMap(result.getPartyMap(), data.party);
    result.setSex(data.sex ?? SexType.SEX_TYPE_UNSPECIFIED);
    result.setZipCode(data.zipCode);
    result.setMajorityElectionId(data.majorityElectionId);
    result.setPosition(data.position);
    result.setOrigin(data.origin);
    result.setStreet(data.street);
    result.setHouseNumber(data.houseNumber);
    result.setCountry(data.country);
    return result;
  }
}
