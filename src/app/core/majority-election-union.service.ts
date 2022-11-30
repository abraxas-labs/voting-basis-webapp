/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { MajorityElectionUnionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/majority_election_union_service_grpc_web_pb';
import {
  CreateMajorityElectionUnionRequest,
  DeleteMajorityElectionUnionRequest,
  GetMajorityElectionUnionCandidatesRequest,
  GetMajorityElectionUnionPoliticalBusinessesRequest,
  UpdateMajorityElectionUnionEntriesRequest,
  UpdateMajorityElectionUnionRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/majority_election_union_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ContestService } from './contest.service';
import { ElectionCandidate, ElectionCandidateProto } from './models/election-candidate.model';
import { MajorityElectionUnion } from './models/majority-election-union.model';
import { PoliticalBusiness } from './models/political-business.model';

@Injectable({
  providedIn: 'root',
})
export class MajorityElectionUnionService extends GrpcService<MajorityElectionUnionServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(MajorityElectionUnionServicePromiseClient, environment, grpcBackend);
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

  public create(data: MajorityElectionUnion): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateMajorityElectionUnionRequest(data),
      r => r.getId(),
    );
  }

  public update(data: MajorityElectionUnion): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateMajorityElectionUnionRequest(data));
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteMajorityElectionUnionRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public updateEntries(unionId: string, electionIds: string[]): Promise<void> {
    const req = new UpdateMajorityElectionUnionEntriesRequest();
    req.setMajorityElectionUnionId(unionId);
    req.setMajorityElectionIdsList(electionIds);
    return this.requestEmptyResp(c => c.updateEntries, req);
  }

  public getPoliticalBusinesses(unionId: string): Promise<PoliticalBusiness[]> {
    const req = new GetMajorityElectionUnionPoliticalBusinessesRequest();
    req.setMajorityElectionUnionId(unionId);
    return this.request(
      c => c.getPoliticalBusinesses,
      req,
      r => r.getPoliticalBusinessesList().map(b => ContestService.mapToPoliticalBusiness(b)),
    );
  }

  public getCandidates(unionId: string): Promise<ElectionCandidate[]> {
    const req = new GetMajorityElectionUnionCandidatesRequest();
    req.setMajorityElectionUnionId(unionId);
    return this.request(
      c => c.getCandidates,
      req,
      r => r.getElectionCandidatesList().map(c => MajorityElectionUnionService.mapToElectionCandidate(c)),
    );
  }

  private mapToCreateMajorityElectionUnionRequest(data: MajorityElectionUnion): CreateMajorityElectionUnionRequest {
    const result = new CreateMajorityElectionUnionRequest();
    result.setContestId(data.contestId);
    result.setDescription(data.description);
    return result;
  }

  private mapToUpdateMajorityElectionUnionRequest(data: MajorityElectionUnion): UpdateMajorityElectionUnionRequest {
    const result = new UpdateMajorityElectionUnionRequest();
    result.setId(data.id);
    result.setDescription(data.description);
    return result;
  }
}
