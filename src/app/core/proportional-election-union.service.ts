/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ProportionalElectionUnionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/proportional_election_union_service_grpc_web_pb';
import {
  CreateProportionalElectionUnionRequest,
  DeleteProportionalElectionUnionRequest,
  GetProportionalElectionUnionCandidatesRequest,
  GetProportionalElectionUnionListsRequest,
  GetProportionalElectionUnionPoliticalBusinessesRequest,
  ListProportionalElectionUnionsRequest,
  UpdateProportionalElectionUnionEntriesRequest,
  UpdateProportionalElectionUnionPoliticalBusinessesRequest,
  UpdateProportionalElectionUnionRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/proportional_election_union_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ContestService } from './contest.service';
import { ElectionCandidate, ElectionCandidateProto } from './models/election-candidate.model';
import { PoliticalBusiness } from './models/political-business.model';
import {
  ProportionalElectionUnion,
  ProportionalElectionUnionList,
  ProportionalElectionUnionListProto,
} from './models/proportional-election-union.model';
import { toJsMap } from './utils/map.utils';
import { ProportionalElectionMandateAlgorithm } from './models/proportional-election.model';

@Injectable({
  providedIn: 'root',
})
export class ProportionalElectionUnionService extends GrpcService<ProportionalElectionUnionServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(ProportionalElectionUnionServicePromiseClient, environment, grpcBackend);
  }

  public static mapToElectionCandidate(data: ElectionCandidateProto): ElectionCandidate {
    return {
      id: data.getId(),
      firstName: data.getFirstName(),
      lastName: data.getLastName(),
      incumbent: data.getIncumbent(),
      dateOfBirth: data.getDateOfBirth()!.toDate(),
      locality: data.getLocality(),
      number: data.getNumber(),
      sex: data.getSex(),
      title: data.getTitle(),
      zipCode: data.getZipCode(),
    };
  }

  public create(data: ProportionalElectionUnion): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateProportionalElectionUnionRequest(data),
      r => r.getId(),
    );
  }

  public update(data: ProportionalElectionUnion): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateProportionalElectionUnionRequest(data));
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteProportionalElectionUnionRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public updateEntries(unionId: string, electionIds: string[]): Promise<void> {
    const req = new UpdateProportionalElectionUnionEntriesRequest();
    req.setProportionalElectionUnionId(unionId);
    req.setProportionalElectionIdsList(electionIds);
    return this.requestEmptyResp(c => c.updateEntries, req);
  }

  public getPoliticalBusinesses(unionId: string): Promise<PoliticalBusiness[]> {
    const req = new GetProportionalElectionUnionPoliticalBusinessesRequest();
    req.setProportionalElectionUnionId(unionId);
    return this.request(
      c => c.getPoliticalBusinesses,
      req,
      r => r.getPoliticalBusinessesList().map(b => ContestService.mapToPoliticalBusiness(b)),
    );
  }

  public getCandidates(unionId: string): Promise<ElectionCandidate[]> {
    const req = new GetProportionalElectionUnionCandidatesRequest();
    req.setProportionalElectionUnionId(unionId);
    return this.request(
      c => c.getCandidates,
      req,
      r => r.getElectionCandidatesList().map(c => ProportionalElectionUnionService.mapToElectionCandidate(c)),
    );
  }

  public getProportionalElectionUnionLists(unionId: string): Promise<ProportionalElectionUnionList[]> {
    const req = new GetProportionalElectionUnionListsRequest();
    req.setProportionalElectionUnionId(unionId);
    return this.request(
      c => c.getProportionalElectionUnionLists,
      req,
      r => r.getProportionalElectionUnionListsList().map(l => this.mapToProportionalElectionUnionList(l)),
    );
  }

  public list(proportionalElectionId: string): Promise<ProportionalElectionUnion[]> {
    const req = new ListProportionalElectionUnionsRequest();
    req.setProportionalElectionId(proportionalElectionId);
    return this.request(
      x => x.list,
      req,
      x => x.getUnionsList().map(y => y.toObject()),
    );
  }

  public updatePoliticalBusinesses(unionIds: string[], mandateAlgorithm: ProportionalElectionMandateAlgorithm) {
    const req = new UpdateProportionalElectionUnionPoliticalBusinessesRequest();
    req.setProportionalElectionUnionIdsList(unionIds);
    req.setMandateAlgorithm(mandateAlgorithm);
    return this.requestEmptyResp(c => c.updatePoliticalBusinesses, req);
  }

  private mapToProportionalElectionUnionList(list: ProportionalElectionUnionListProto): ProportionalElectionUnionList {
    return {
      ...list.toObject(),
      shortDescription: toJsMap(list.getShortDescriptionMap()),
    };
  }

  private mapToCreateProportionalElectionUnionRequest(data: ProportionalElectionUnion): CreateProportionalElectionUnionRequest {
    const result = new CreateProportionalElectionUnionRequest();
    result.setContestId(data.contestId);
    result.setDescription(data.description);
    return result;
  }

  private mapToUpdateProportionalElectionUnionRequest(data: ProportionalElectionUnion): UpdateProportionalElectionUnionRequest {
    const result = new UpdateProportionalElectionUnionRequest();
    result.setId(data.id);
    result.setDescription(data.description);
    return result;
  }
}
