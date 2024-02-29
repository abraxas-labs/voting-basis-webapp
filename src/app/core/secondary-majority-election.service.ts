/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { MajorityElectionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/majority_election_service_grpc_web_pb';
import {
  CreateMajorityElectionCandidateReferenceRequest,
  CreateSecondaryMajorityElectionCandidateRequest,
  CreateSecondaryMajorityElectionRequest,
  DeleteMajorityElectionCandidateReferenceRequest,
  DeleteSecondaryMajorityElectionCandidateRequest,
  DeleteSecondaryMajorityElectionRequest,
  GetSecondaryMajorityElectionRequest,
  ListSecondaryMajorityElectionCandidatesRequest,
  ListSecondaryMajorityElectionsRequest,
  ReorderSecondaryMajorityElectionCandidatesRequest,
  UpdateMajorityElectionCandidateReferenceRequest,
  UpdateSecondaryMajorityElectionActiveStateRequest,
  UpdateSecondaryMajorityElectionCandidateRequest,
  UpdateSecondaryMajorityElectionRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/majority_election_requests_pb';
import { SexType } from '@abraxas/voting-basis-service-proto/grpc/shared/sex_pb';
import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MajorityElectionService } from './majority-election.service';
import {
  MajorityElectionCandidateReference,
  SecondaryMajorityElection,
  SecondaryMajorityElectionCandidate,
  SecondaryMajorityElectionCandidateProto,
  SecondaryMajorityElectionProto,
} from './models/secondary-majority-election.model';
import { mapToEntityOrders } from './utils/entity-order.utils';
import { fillProtoMap, toJsMap } from './utils/map.utils';

@Injectable({
  providedIn: 'root',
})
export class SecondaryMajorityElectionService extends GrpcService<MajorityElectionServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(MajorityElectionServicePromiseClient, environment, grpcBackend);
  }

  public get(id: string): Promise<SecondaryMajorityElection> {
    const request = new GetSecondaryMajorityElectionRequest();
    request.setId(id);
    return this.request(
      c => c.getSecondaryMajorityElection,
      request,
      r => this.mapToSecondaryMajorityElection(r),
    );
  }

  public list(majorityElectionId: string): Promise<SecondaryMajorityElection[]> {
    const request = new ListSecondaryMajorityElectionsRequest();
    request.setMajorityElectionId(majorityElectionId);
    return this.request(
      c => c.listSecondaryMajorityElections,
      request,
      r => r.getSecondaryMajorityElectionsList().map(e => this.mapToSecondaryMajorityElection(e)),
    );
  }

  public create(data: SecondaryMajorityElection): Promise<string> {
    return this.request(
      c => c.createSecondaryMajorityElection,
      this.mapToCreateSecondaryMajorityElectionRequest(data),
      r => r.getId(),
    );
  }

  public update(data: SecondaryMajorityElection): Promise<void> {
    return this.requestEmptyResp(c => c.updateSecondaryMajorityElection, this.mapToUpdateSecondaryMajorityElectionRequest(data));
  }

  public updateActiveState(id: string, active: boolean): Promise<void> {
    const req = new UpdateSecondaryMajorityElectionActiveStateRequest();
    req.setId(id);
    req.setActive(active);
    return this.requestEmptyResp(c => c.updateSecondaryMajorityElectionActiveState, req);
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteSecondaryMajorityElectionRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteSecondaryMajorityElection, req);
  }

  public listCandidates(secondaryMajorityElectionId: string): Promise<SecondaryMajorityElectionCandidate[]> {
    const req = new ListSecondaryMajorityElectionCandidatesRequest();
    req.setSecondaryMajorityElectionId(secondaryMajorityElectionId);
    return this.request(
      c => c.listSecondaryMajorityElectionCandidates,
      req,
      r => r.getCandidatesList().map(c => this.mapToSecondaryMajorityElectionCandidate(c)),
    );
  }

  public createCandidate(data: SecondaryMajorityElectionCandidate): Promise<string> {
    return this.request(
      c => c.createSecondaryMajorityElectionCandidate,
      this.mapToCreateSecondaryMajorityElectionCandidateRequest(data),
      r => r.getId(),
    );
  }

  public updateCandidate(data: SecondaryMajorityElectionCandidate): Promise<void> {
    return this.requestEmptyResp(
      c => c.updateSecondaryMajorityElectionCandidate,
      this.mapToUpdateSecondaryMajorityElectionCandidateRequest(data),
    );
  }

  public deleteCandidate(id: string): Promise<void> {
    const req = new DeleteSecondaryMajorityElectionCandidateRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteSecondaryMajorityElectionCandidate, req);
  }

  public createCandidateReference(data: MajorityElectionCandidateReference): Promise<string> {
    return this.request(
      c => c.createMajorityElectionCandidateReference,
      this.mapToCreateMajorityElectionCandidateReferenceRequest(data),
      r => r.getId(),
    );
  }

  public updateCandidateReference(data: MajorityElectionCandidateReference): Promise<void> {
    return this.requestEmptyResp(
      c => c.updateMajorityElectionCandidateReference,
      this.mapToUpdateMajorityElectionCandidateReferenceRequest(data),
    );
  }

  public deleteCandidateReference(id: string): Promise<void> {
    const req = new DeleteMajorityElectionCandidateReferenceRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteMajorityElectionCandidateReference, req);
  }

  public async reorderCandidates(electionId: string, candidates: SecondaryMajorityElectionCandidate[]): Promise<void> {
    const req = new ReorderSecondaryMajorityElectionCandidatesRequest();
    req.setSecondaryMajorityElectionId(electionId);
    req.setOrders(mapToEntityOrders(candidates));
    await this.request(
      c => c.reorderSecondaryMajorityElectionCandidates,
      req,
      x => x,
    );
  }

  private mapToSecondaryMajorityElection(election: SecondaryMajorityElectionProto): SecondaryMajorityElection {
    return {
      ...election.toObject(),
      shortDescription: toJsMap(election.getShortDescriptionMap()),
      officialDescription: toJsMap(election.getOfficialDescriptionMap()),
    };
  }

  private mapToSecondaryMajorityElectionCandidate(data: SecondaryMajorityElectionCandidateProto): SecondaryMajorityElectionCandidate {
    const majorityElectionCandidate = MajorityElectionService.mapToMajorityElectionCandidate(data.getCandidate()!);
    return {
      ...majorityElectionCandidate,
      isReferenced: data.getIsReferenced(),
      referencedCandidateId: data.getReferencedCandidateId(),
    };
  }

  private mapToCreateSecondaryMajorityElectionRequest(data: SecondaryMajorityElection): CreateSecondaryMajorityElectionRequest {
    const result = new CreateSecondaryMajorityElectionRequest();
    result.setPoliticalBusinessNumber(data.politicalBusinessNumber);
    fillProtoMap(result.getOfficialDescriptionMap(), data.officialDescription);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setNumberOfMandates(data.numberOfMandates);
    result.setAllowedCandidates(data.allowedCandidates);
    result.setPrimaryMajorityElectionId(data.primaryMajorityElectionId);
    result.setActive(data.active);
    return result;
  }

  private mapToUpdateSecondaryMajorityElectionRequest(data: SecondaryMajorityElection): UpdateSecondaryMajorityElectionRequest {
    const result = new UpdateSecondaryMajorityElectionRequest();
    result.setId(data.id);
    result.setPoliticalBusinessNumber(data.politicalBusinessNumber);
    fillProtoMap(result.getOfficialDescriptionMap(), data.officialDescription);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setNumberOfMandates(data.numberOfMandates);
    result.setAllowedCandidates(data.allowedCandidates);
    result.setPrimaryMajorityElectionId(data.primaryMajorityElectionId);
    result.setActive(data.active);
    return result;
  }

  private mapToCreateSecondaryMajorityElectionCandidateRequest(
    data: SecondaryMajorityElectionCandidate,
  ): CreateSecondaryMajorityElectionCandidateRequest {
    const result = new CreateSecondaryMajorityElectionCandidateRequest();
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
    result.setSex(data.sex ?? SexType.SEX_TYPE_UNDEFINED);
    result.setZipCode(data.zipCode);
    result.setSecondaryMajorityElectionId(data.majorityElectionId);
    result.setPosition(data.position);
    result.setOrigin(data.origin);
    return result;
  }

  private mapToUpdateSecondaryMajorityElectionCandidateRequest(
    data: SecondaryMajorityElectionCandidate,
  ): UpdateSecondaryMajorityElectionCandidateRequest {
    const result = new UpdateSecondaryMajorityElectionCandidateRequest();
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
    result.setSex(data.sex ?? SexType.SEX_TYPE_UNDEFINED);
    result.setZipCode(data.zipCode);
    result.setSecondaryMajorityElectionId(data.majorityElectionId);
    result.setPosition(data.position);
    result.setOrigin(data.origin);
    return result;
  }

  private mapToCreateMajorityElectionCandidateReferenceRequest(
    data: MajorityElectionCandidateReference,
  ): CreateMajorityElectionCandidateReferenceRequest {
    const result = new CreateMajorityElectionCandidateReferenceRequest();
    result.setSecondaryMajorityElectionId(data.secondaryMajorityElectionId);
    result.setCandidateId(data.candidateId);
    result.setIncumbent(data.incumbent);
    result.setPosition(data.position);
    return result;
  }

  private mapToUpdateMajorityElectionCandidateReferenceRequest(
    data: MajorityElectionCandidateReference,
  ): UpdateMajorityElectionCandidateReferenceRequest {
    const result = new UpdateMajorityElectionCandidateReferenceRequest();
    result.setId(data.id);
    result.setSecondaryMajorityElectionId(data.secondaryMajorityElectionId);
    result.setCandidateId(data.candidateId);
    result.setIncumbent(data.incumbent);
    result.setPosition(data.position);
    return result;
  }
}
