/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { MajorityElectionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/majority_election_service_grpc_web_pb';
import {
  CreateMajorityElectionBallotGroupRequest,
  DeleteMajorityElectionBallotGroupRequest,
  ListMajorityElectionBallotGroupCandidatesRequest,
  ListMajorityElectionBallotGroupsRequest,
  UpdateMajorityElectionBallotGroupCandidatesRequest,
  UpdateMajorityElectionBallotGroupRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/majority_election_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  MajorityElectionBallotGroup,
  MajorityElectionBallotGroupCandidates,
  MajorityElectionBallotGroupCandidatesProto,
  MajorityElectionBallotGroupEntry,
  MajorityElectionBallotGroupEntryCandidates,
  MajorityElectionBallotGroupEntryCandidatesProto,
  MajorityElectionBallotGroupEntryProto,
  MajorityElectionBallotGroupProto,
} from './models/majority-election-ballot-group.model';

@Injectable({
  providedIn: 'root',
})
export class MajorityElectionBallotGroupService extends GrpcService<MajorityElectionServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(MajorityElectionServicePromiseClient, environment, grpcBackend);
  }

  public create(data: MajorityElectionBallotGroup): Promise<MajorityElectionBallotGroup> {
    return this.request(
      c => c.createBallotGroup,
      this.mapToCreateBallotGroupRequest(data),
      r => this.mapToBallotGroup(r),
    );
  }

  public async update(data: MajorityElectionBallotGroup): Promise<MajorityElectionBallotGroup> {
    return await this.request(
      c => c.updateBallotGroup,
      this.mapToUpdateBallotGroupRequest(data),
      r => this.mapToBallotGroup(r),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteMajorityElectionBallotGroupRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.deleteBallotGroup, req);
  }

  public list(majorityElectionId: string): Promise<MajorityElectionBallotGroup[]> {
    const req = new ListMajorityElectionBallotGroupsRequest();
    req.setMajorityElectionId(majorityElectionId);
    return this.request(
      c => c.listBallotGroups,
      req,
      r => r.getBallotGroupsList().map(c => this.mapToBallotGroup(c)),
    );
  }

  public listCandidates(ballotGroupId: string): Promise<MajorityElectionBallotGroupCandidates> {
    const req = new ListMajorityElectionBallotGroupCandidatesRequest();
    req.setBallotGroupId(ballotGroupId);
    return this.request(
      c => c.listBallotGroupCandidates,
      req,
      r => this.mapToBallotGroupCandidates(r),
    );
  }

  public updateCandidates(candidates: MajorityElectionBallotGroupCandidates): Promise<void> {
    return this.requestEmptyResp(c => c.updateBallotGroupCandidates, this.mapToUpdateBallotGroupCandidatesRequest(candidates));
  }

  private mapToBallotGroup(data: MajorityElectionBallotGroupProto): MajorityElectionBallotGroup {
    return {
      id: data.getId(),
      shortDescription: data.getShortDescription(),
      majorityElectionId: data.getMajorityElectionId(),
      description: data.getDescription(),
      position: data.getPosition(),
      entries: data.getEntriesList().map(e => e.toObject()),
    };
  }

  private mapToCreateBallotGroupRequest(data: MajorityElectionBallotGroup): CreateMajorityElectionBallotGroupRequest {
    const result = new CreateMajorityElectionBallotGroupRequest();
    result.setDescription(data.description);
    result.setShortDescription(data.shortDescription);
    result.setMajorityElectionId(data.majorityElectionId);
    result.setPosition(data.position);
    result.setEntriesList(data.entries.map(e => this.mapToBallotGroupEntryProto(e)));
    return result;
  }

  private mapToUpdateBallotGroupRequest(data: MajorityElectionBallotGroup): UpdateMajorityElectionBallotGroupRequest {
    const result = new UpdateMajorityElectionBallotGroupRequest();
    result.setId(data.id);
    result.setDescription(data.description);
    result.setShortDescription(data.shortDescription);
    result.setMajorityElectionId(data.majorityElectionId);
    result.setPosition(data.position);
    result.setEntriesList(data.entries.map(e => this.mapToBallotGroupEntryProto(e)));
    return result;
  }

  private mapToBallotGroupEntryProto(data: MajorityElectionBallotGroupEntry): MajorityElectionBallotGroupEntryProto {
    const result = new MajorityElectionBallotGroupEntryProto();
    result.setId(data.id);
    result.setElectionId(data.electionId);
    result.setBlankRowCount(data.blankRowCount);
    return result;
  }

  private mapToBallotGroupCandidates(data: MajorityElectionBallotGroupCandidatesProto): MajorityElectionBallotGroupCandidates {
    return {
      ballotGroupId: data.getBallotGroupId(),
      entryCandidates: data.toObject().entryCandidatesList,
    };
  }

  private mapToUpdateBallotGroupCandidatesRequest(
    data: MajorityElectionBallotGroupCandidates,
  ): UpdateMajorityElectionBallotGroupCandidatesRequest {
    const result = new UpdateMajorityElectionBallotGroupCandidatesRequest();
    result.setBallotGroupId(data.ballotGroupId);
    result.setEntryCandidatesList(data.entryCandidates.map(c => this.mapToBallotGroupEntryCandidatesProto(c)));
    return result;
  }

  private mapToBallotGroupEntryCandidatesProto(
    data: MajorityElectionBallotGroupEntryCandidates,
  ): MajorityElectionBallotGroupEntryCandidatesProto {
    const result = new MajorityElectionBallotGroupEntryCandidatesProto();
    result.setBallotGroupEntryId(data.ballotGroupEntryId);
    result.setCandidateIdsList(data.candidateIdsList);
    result.setIndividualCandidatesVoteCount(data.individualCandidatesVoteCount);
    return result;
  }
}
