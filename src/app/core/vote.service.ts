/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  BallotQuestion as ProtoBallotQuestion,
  TieBreakQuestion as ProtoTieBreakQuestion,
} from '@abraxas/voting-basis-service-proto/grpc/models/vote_pb';
import {
  CreateBallotRequest,
  CreateVoteRequest,
  DeleteBallotRequest,
  DeleteVoteRequest,
  GetVoteRequest,
  UpdateBallotRequest,
  UpdateVoteActiveStateRequest,
  UpdateVoteRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/vote_requests_pb';
import { VoteServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/vote_service_grpc_web_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  Ballot,
  BallotProto,
  BallotQuestion,
  BallotQuestionProto,
  TieBreakQuestion,
  TieBreakQuestionProto,
  Vote,
  VoteProto,
} from './models/vote.model';
import { fillProtoMap, toJsMap } from './utils/map.utils';

@Injectable({
  providedIn: 'root',
})
export class VoteService extends GrpcService<VoteServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(VoteServicePromiseClient, environment, grpcBackend);
  }

  public static mapToVote(vote: VoteProto): Vote {
    return {
      ...vote.toObject(),
      shortDescription: toJsMap(vote.getShortDescriptionMap()),
      officialDescription: toJsMap(vote.getOfficialDescriptionMap()),
      ballots: vote.getBallotsList().map(b => VoteService.mapToBallot(b)),
    };
  }

  private static mapToBallot(ballot: BallotProto): Ballot {
    return {
      ...ballot.toObject(),
      ballotQuestions: ballot.getBallotQuestionsList().map(q => this.mapToBallotQuestion(q)),
      tieBreakQuestions: ballot.getTieBreakQuestionsList().map(q => this.mapToTieBreakQuestion(q)),
    };
  }

  private static mapToBallotQuestion(question: BallotQuestionProto): BallotQuestion {
    return {
      number: question.getNumber(),
      question: toJsMap(question.getQuestionMap()),
      type: question.getType(),
    };
  }

  private static mapToTieBreakQuestion(question: TieBreakQuestionProto): TieBreakQuestion {
    return {
      number: question.getNumber(),
      question1Number: question.getQuestion1Number(),
      question2Number: question.getQuestion2Number(),
      question: toJsMap(question.getQuestionMap()),
    };
  }

  public create(data: Vote): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateVoteRequest(data),
      r => r.getId(),
    );
  }

  public update(data: Vote): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateVoteRequest(data));
  }

  public updateActiveState(id: string, active: boolean): Promise<void> {
    const req = new UpdateVoteActiveStateRequest();
    req.setId(id);
    req.setActive(active);
    return this.requestEmptyResp(c => c.updateActiveState, req);
  }

  public get(id: string): Promise<Vote> {
    const req = new GetVoteRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => VoteService.mapToVote(r),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteVoteRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public createBallot(data: Ballot): Promise<string> {
    return this.request(
      c => c.createBallot,
      this.mapToCreateBallotRequest(data),
      r => r.getId(),
    );
  }

  public updateBallot(data: Ballot): Promise<void> {
    return this.requestEmptyResp(c => c.updateBallot, this.mapToUpdateBallotRequest(data));
  }

  public deleteBallot(id: string, voteId: string): Promise<void> {
    const req = new DeleteBallotRequest();
    req.setId(id);
    req.setVoteId(voteId);
    return this.requestEmptyResp(c => c.deleteBallot, req);
  }

  private mapToCreateVoteRequest(data: Vote): CreateVoteRequest {
    const result = new CreateVoteRequest();
    this.mapToVoteRequest(data, result);
    return result;
  }

  private mapToUpdateVoteRequest(data: Vote): UpdateVoteRequest {
    const result = new UpdateVoteRequest();
    result.setId(data.id);
    this.mapToVoteRequest(data, result);
    return result;
  }

  private mapToVoteRequest(data: Vote, result: CreateVoteRequest | UpdateVoteRequest): void {
    result.setPoliticalBusinessNumber(data.politicalBusinessNumber);
    fillProtoMap(result.getOfficialDescriptionMap(), data.officialDescription);
    fillProtoMap(result.getShortDescriptionMap(), data.shortDescription);
    result.setInternalDescription(data.internalDescription);
    result.setDomainOfInfluenceId(data.domainOfInfluenceId);
    result.setContestId(data.contestId);
    result.setReportDomainOfInfluenceLevel(data.reportDomainOfInfluenceLevel);
    result.setResultAlgorithm(data.resultAlgorithm);
    result.setEnforceResultEntryForCountingCircles(data.enforceResultEntryForCountingCircles);
    result.setBallotBundleSampleSizePercent(data.ballotBundleSampleSizePercent);
    result.setResultEntry(data.resultEntry);
    result.setAutomaticBallotBundleNumberGeneration(data.automaticBallotBundleNumberGeneration);
    result.setReviewProcedure(data.reviewProcedure);
    result.setEnforceReviewProcedureForCountingCircles(data.enforceReviewProcedureForCountingCircles);
  }

  private mapToCreateBallotRequest(data: Ballot): CreateBallotRequest {
    const result = new CreateBallotRequest();
    result.setPosition(data.position);
    this.mapToBallotRequest(data, result);
    return result;
  }

  private mapToUpdateBallotRequest(data: Ballot): UpdateBallotRequest {
    const result = new UpdateBallotRequest();
    result.setId(data.id);
    result.setVoteId(data.voteId);
    this.mapToBallotRequest(data, result);
    return result;
  }

  private mapToBallotRequest(data: Ballot, result: CreateBallotRequest | UpdateBallotRequest): void {
    result.setVoteId(data.voteId);
    result.setBallotType(data.ballotType);
    result.setHasTieBreakQuestions(data.hasTieBreakQuestions);
    result.setBallotQuestionsList(data.ballotQuestions.map(this.mapToProtoBallotQuestion));
    result.setTieBreakQuestionsList(data.tieBreakQuestions.map(this.mapToProtoTieBreakQuestion));
  }

  private mapToProtoBallotQuestion(data: BallotQuestion): ProtoBallotQuestion {
    const result = new ProtoBallotQuestion();
    result.setNumber(data.number);
    fillProtoMap(result.getQuestionMap(), data.question);
    result.setType(data.type);
    return result;
  }

  private mapToProtoTieBreakQuestion(data: TieBreakQuestion): ProtoTieBreakQuestion {
    const result = new ProtoTieBreakQuestion();
    result.setNumber(data.number);
    fillProtoMap(result.getQuestionMap(), data.question);
    result.setQuestion1Number(data.question1Number);
    result.setQuestion2Number(data.question2Number);
    return result;
  }
}
