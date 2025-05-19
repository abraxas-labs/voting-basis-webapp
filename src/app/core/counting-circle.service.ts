/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { CountingCircleServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/counting_circle_service_grpc_web_pb';
import {
  CreateCountingCircleRequest,
  DeleteCountingCircleRequest,
  DeleteScheduledCountingCirclesMergerRequest,
  GetCountingCircleRequest,
  ListAssignableCountingCircleRequest,
  ListAssignedCountingCircleRequest,
  ListAssignedCountingCircleSnapshotRequest,
  ListCountingCircleRequest,
  ListCountingCirclesMergersRequest,
  ListCountingCircleSnapshotRequest,
  ScheduleCountingCirclesMergerRequest,
  UpdateCountingCircleRequest,
  UpdateScheduledCountingCirclesMergerRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/counting_circle_requests_pb';
import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  Authority,
  AuthorityProto,
  CountingCircle,
  CountingCircleElectorate,
  CountingCircleElectorateProto,
  CountingCircleProto,
  CountingCirclesMerger,
  CountingCirclesMergerProto,
  DomainOfInfluenceCountingCircle,
  DomainOfInfluenceCountingCircleProto,
} from './models/counting-circle.model';
import { mapToProtoContactPerson } from './utils/contact-person.utils';

@Injectable({
  providedIn: 'root',
})
export class CountingCircleService extends GrpcService<CountingCircleServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(CountingCircleServicePromiseClient, environment, grpcBackend);
  }

  public create(data: CountingCircle): Promise<string> {
    return this.request(
      c => c.create,
      this.mapToCreateCountingCircleRequest(data),
      r => r.getId(),
    );
  }

  public update(data: CountingCircle): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateCountingCircleRequest(data));
  }

  public get(id: string): Promise<CountingCircle> {
    const req = new GetCountingCircleRequest();
    req.setId(id);
    return this.request(
      c => c.get,
      req,
      r => this.mapToCountingCircle(r),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeleteCountingCircleRequest();
    req.setId(id);
    return this.requestEmptyResp(c => c.delete, req);
  }

  public list(): Promise<CountingCircle[]> {
    const req = new ListCountingCircleRequest();
    return this.request(
      c => c.list,
      req,
      r => r.getCountingCirclesList().map(cc => this.mapToCountingCircle(cc)),
    );
  }

  public listAssignableForDomainOfInfluence(domainOfInfluenceId: string): Promise<DomainOfInfluenceCountingCircle[]> {
    const req = new ListAssignableCountingCircleRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    return this.request(
      c => c.listAssignable,
      req,
      r => this.mapToDomainOfInfluenceCountingCircles(r.getCountingCirclesList().map(cc => this.mapToCountingCircle(cc))),
    );
  }

  public scheduleMerger(merge: CountingCirclesMerger): Promise<string> {
    return this.request(
      c => c.scheduleMerger,
      this.mapToScheduleCountingCirclesMergerRequest(merge),
      x => x.getId(),
    );
  }

  public updateScheduledMerger(merge: CountingCirclesMerger): Promise<void> {
    return this.requestEmptyResp(c => c.updateScheduledMerger, this.mapToUpdateScheduledMergerCountingCirclesRequest(merge));
  }

  public deleteScheduledMerger(merger: CountingCirclesMerger): Promise<void> {
    const req = new DeleteScheduledCountingCirclesMergerRequest();
    req.setNewCountingCircleId(merger.newCountingCircle.id);
    return this.requestEmptyResp(c => c.deleteScheduledMerger, req);
  }

  public listMergers(): Promise<CountingCirclesMerger[]> {
    return this.request(
      c => c.listMergers,
      new ListCountingCirclesMergersRequest(),
      x => x.getMergersList().map(m => this.mapToCountingCircleMerger(m)),
    );
  }

  public listAssignedForDomainOfInfluence(domainOfInfluenceId: string): Promise<DomainOfInfluenceCountingCircle[]> {
    const req = new ListAssignedCountingCircleRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    return this.request(
      c => c.listAssigned,
      req,
      r => r.toObject().countingCirclesList,
    );
  }

  public listSnapshot(includeDeleted: boolean, dateTime?: Date): Promise<CountingCircle[]> {
    const req = new ListCountingCircleSnapshotRequest();
    req.setIncludeDeleted(includeDeleted);
    req.setDateTime(TimestampUtil.toTimestamp(dateTime));
    return this.request(
      c => c.listSnapshot,
      req,
      r => r.getCountingCirclesList().map(cc => this.mapToCountingCircle(cc)),
    );
  }

  public listAssignedForDomainOfInfluenceSnapshot(
    domainOfInfluenceId: string,
    dateTime?: Date,
  ): Promise<DomainOfInfluenceCountingCircle[]> {
    const req = new ListAssignedCountingCircleSnapshotRequest();
    req.setDomainOfInfluenceId(domainOfInfluenceId);
    req.setDateTime(TimestampUtil.toTimestamp(dateTime));
    return this.request(
      c => c.listAssignedSnapshot,
      req,
      r => r.toObject().countingCirclesList,
    );
  }

  private mapToDomainOfInfluenceCountingCircles(data: CountingCircle[]): DomainOfInfluenceCountingCircle[] {
    return data.map(d => this.mapToDomainOfInfluenceCountingCircle(d));
  }

  private mapToDomainOfInfluenceCountingCircle(data: CountingCircle): DomainOfInfluenceCountingCircle {
    const result = new DomainOfInfluenceCountingCircleProto();
    result.setId(data.id);
    result.setName(data.name);
    result.setBfs(data.bfs);
    result.setResponsibleAuthority(this.mapToProtoAuthority(data.responsibleAuthority));
    result.setContactPersonSameDuringEventAsAfter(data.contactPersonSameDuringEventAsAfter);
    result.setContactPersonDuringEvent(mapToProtoContactPerson(data.contactPersonDuringEvent));
    result.setContactPersonAfterEvent(mapToProtoContactPerson(data.contactPersonAfterEvent));
    result.setCode(data.code);
    result.setNameForProtocol(data.nameForProtocol);
    result.setSortNumber(data.sortNumber);
    result.setEVoting(data.eVoting);
    result.setEVotingActiveFrom(TimestampUtil.toTimestamp(data.eVotingActiveFrom));
    result.setECounting(data.eCounting);
    return result.toObject();
  }

  private mapToUpdateCountingCircleRequest(data: CountingCircle): UpdateCountingCircleRequest {
    const result = new UpdateCountingCircleRequest();
    result.setId(data.id);
    result.setName(data.name);
    result.setBfs(data.bfs);
    result.setResponsibleAuthority(this.mapToProtoAuthority(data.responsibleAuthority));
    result.setContactPersonSameDuringEventAsAfter(data.contactPersonSameDuringEventAsAfter);
    result.setContactPersonDuringEvent(mapToProtoContactPerson(data.contactPersonDuringEvent));
    result.setContactPersonAfterEvent(mapToProtoContactPerson(data.contactPersonAfterEvent));
    result.setCode(data.code);
    result.setNameForProtocol(data.nameForProtocol);
    result.setSortNumber(data.sortNumber);
    result.setElectoratesList(data.electoratesList.map(e => this.mapToProtoElectorate(e)));
    result.setCanton(data.canton);
    result.setEVotingActiveFrom(TimestampUtil.toTimestamp(data.eVotingActiveFrom));
    result.setECounting(data.eCounting);
    return result;
  }

  private mapToCreateCountingCircleRequest(data: CountingCircle): CreateCountingCircleRequest {
    const result = new CreateCountingCircleRequest();
    result.setName(data.name);
    result.setBfs(data.bfs);
    result.setResponsibleAuthority(this.mapToProtoAuthority(data.responsibleAuthority));
    result.setContactPersonSameDuringEventAsAfter(data.contactPersonSameDuringEventAsAfter);
    result.setContactPersonDuringEvent(mapToProtoContactPerson(data.contactPersonDuringEvent));
    result.setContactPersonAfterEvent(mapToProtoContactPerson(data.contactPersonAfterEvent));
    result.setCode(data.code);
    result.setNameForProtocol(data.nameForProtocol);
    result.setSortNumber(data.sortNumber);
    result.setElectoratesList(data.electoratesList.map(e => this.mapToProtoElectorate(e)));
    result.setCanton(data.canton);
    result.setEVotingActiveFrom(TimestampUtil.toTimestamp(data.eVotingActiveFrom));
    result.setECounting(data.eCounting);
    return result;
  }

  private mapToScheduleCountingCirclesMergerRequest(data: CountingCirclesMerger): ScheduleCountingCirclesMergerRequest {
    const result = new ScheduleCountingCirclesMergerRequest();
    this.mapToScheduledMergerCountingCirclesRequest(data, result);
    return result;
  }

  private mapToUpdateScheduledMergerCountingCirclesRequest(data: CountingCirclesMerger): UpdateScheduledCountingCirclesMergerRequest {
    const result = new UpdateScheduledCountingCirclesMergerRequest();
    result.setNewCountingCircleId(data.newCountingCircle.id);
    this.mapToScheduledMergerCountingCirclesRequest(data, result);
    return result;
  }

  private mapToScheduledMergerCountingCirclesRequest(
    data: CountingCirclesMerger,
    req: UpdateScheduledCountingCirclesMergerRequest | ScheduleCountingCirclesMergerRequest,
  ): void {
    req.setName(data.newCountingCircle.name);
    req.setBfs(data.newCountingCircle.bfs);
    req.setCode(data.newCountingCircle.code);
    req.setResponsibleAuthority(this.mapToProtoAuthority(data.newCountingCircle.responsibleAuthority));
    req.setMergedCountingCircleIdsList(data.mergedCountingCircles.map(c => c.id));
    req.setCopyFromCountingCircleId(data.copyFromCountingCircleId);
    req.setActiveFrom(TimestampUtil.toTimestamp(data.activeFrom));
    req.setNameForProtocol(data.newCountingCircle.nameForProtocol);
    req.setSortNumber(data.newCountingCircle.sortNumber);
    req.setEVotingActiveFrom(TimestampUtil.toTimestamp(data.newCountingCircle.eVotingActiveFrom));
    req.setECounting(data.newCountingCircle.eCounting);
  }

  private mapToProtoAuthority(data?: Authority): AuthorityProto {
    const result = new AuthorityProto();
    if (!data) {
      return result;
    }

    result.setSecureConnectId(data.secureConnectId);
    result.setName(data.name);
    result.setStreet(data.street);
    result.setZip(data.zip);
    result.setCity(data.city);
    result.setPhone(data.phone);
    result.setEmail(data.email);
    return result;
  }

  private mapToProtoElectorate(data: CountingCircleElectorate): CountingCircleElectorateProto {
    const result = new CountingCircleElectorateProto();
    result.setDomainOfInfluenceTypesList(data.domainOfInfluenceTypesList);
    return result;
  }

  private mapToCountingCircle(cc: CountingCircleProto): CountingCircle {
    return {
      id: cc.getId(),
      name: cc.getName(),
      bfs: cc.getBfs(),
      responsibleAuthority: cc.getResponsibleAuthority()?.toObject(),
      contactPersonDuringEvent: cc.getContactPersonDuringEvent()?.toObject(),
      contactPersonSameDuringEventAsAfter: cc.getContactPersonSameDuringEventAsAfter(),
      contactPersonAfterEvent: cc.getContactPersonAfterEvent()?.toObject(),
      state: cc.getState(),
      createdOn: cc.getInfo()?.getCreatedOn()?.toDate(),
      modifiedOn: cc.getInfo()?.getModifiedOn()?.toDate(),
      deletedOn: cc.getInfo()?.getDeletedOn()?.toDate(),
      code: cc.getCode(),
      sortNumber: cc.getSortNumber(),
      nameForProtocol: cc.getNameForProtocol(),
      electoratesList: cc.getElectoratesList().map(x => x.toObject()),
      canton: cc.getCanton(),
      eVoting: cc.getEVoting(),
      eVotingActiveFrom: cc.getEVotingActiveFrom()?.toDate(),
      eCounting: cc.getECounting(),
    };
  }

  private mapToCountingCircleMerger(merger: CountingCirclesMergerProto): CountingCirclesMerger {
    return {
      id: merger.getId(),
      copyFromCountingCircleId: merger.getCopyFromCountingCircleId(),
      activeFrom: merger.getActiveFrom()!.toDate(),
      mergedCountingCircles: merger.getMergedCountingCirclesList().map(cc => this.mapToCountingCircle(cc)),
      newCountingCircle: this.mapToCountingCircle(merger.getNewCountingCircle()!),
      merged: merger.getMerged(),
    };
  }
}
