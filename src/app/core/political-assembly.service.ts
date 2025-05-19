/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { GrpcBackendService, GrpcService, TimestampUtil } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DomainOfInfluenceService } from './domain-of-influence.service';
import { fillProtoMap, toJsMap } from './utils/map.utils';
import { PoliticalAssemblyServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/political_assembly_service_grpc_web_pb';
import { PoliticalAssembly, PoliticalAssemblyProto, PoliticalAssemblyState } from './models/political-assembly.model';
import {
  CreatePoliticalAssemblyRequest,
  DeletePoliticalAssemblyRequest,
  GetPoliticalAssemblyRequest,
  ListPoliticalAssemblyRequest,
  UpdatePoliticalAssemblyRequest,
  ArchivePoliticalAssemblyRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/political_assembly_requests_pb';

@Injectable({
  providedIn: 'root',
})
export class PoliticalAssemblyService extends GrpcService<PoliticalAssemblyServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(PoliticalAssemblyServicePromiseClient, environment, grpcBackend);
  }

  public create(data: PoliticalAssembly): Promise<string> {
    return this.request(
      x => x.create,
      this.mapToCreatePoliticalAssemblyRequest(data),
      r => r.getId(),
    );
  }

  public async update(data: PoliticalAssembly): Promise<void> {
    await this.request(
      x => x.update,
      this.mapToUpdatePoliticalAssemblyRequest(data),
      r => r,
    );
  }

  public get(id: string): Promise<PoliticalAssembly> {
    const req = new GetPoliticalAssemblyRequest();
    req.setId(id);
    return this.request(
      x => x.get,
      req,
      r => this.mapToPoliticalAssembly(r),
    );
  }

  public delete(id: string): Promise<void> {
    const req = new DeletePoliticalAssemblyRequest();
    req.setId(id);
    return this.requestEmptyResp(x => x.delete, req);
  }

  public list(state: PoliticalAssemblyState): Promise<PoliticalAssembly[]> {
    const req = new ListPoliticalAssemblyRequest();
    req.setState(state);
    return this.request(
      x => x.list,
      req,
      r => r.getPoliticalAssembliesList().map(x => this.mapToPoliticalAssembly(x)),
    );
  }

  public archive(id: string, archivePer?: Date): Promise<void> {
    const req = new ArchivePoliticalAssemblyRequest();
    req.setId(id);
    req.setArchivePer(TimestampUtil.toTimestamp(archivePer));
    return this.requestEmptyResp(c => c.archive, req);
  }

  private mapToPoliticalAssembly(data: PoliticalAssemblyProto): PoliticalAssembly {
    const state = data.getState();
    return {
      id: data.getId(),
      date: data.getDate()?.toDate(),
      domainOfInfluenceId: data.getDomainOfInfluenceId(),
      description: toJsMap(data.getDescriptionMap()),
      domainOfInfluence: DomainOfInfluenceService.mapToDomainOfInfluence(data.getDomainOfInfluence()!),
      archivePer: data.getArchivePer()?.toDate(),
      state,
    };
  }

  private mapToUpdatePoliticalAssemblyRequest(data: PoliticalAssembly): UpdatePoliticalAssemblyRequest {
    const request = new UpdatePoliticalAssemblyRequest();
    request.setId(data.id);
    request.setDate(TimestampUtil.toTimestamp(data.date));
    request.setDomainOfInfluenceId(data.domainOfInfluenceId);
    fillProtoMap(request.getDescriptionMap(), data.description);
    return request;
  }

  private mapToCreatePoliticalAssemblyRequest(data: PoliticalAssembly): CreatePoliticalAssemblyRequest {
    const request = new CreatePoliticalAssemblyRequest();
    request.setDate(TimestampUtil.toTimestamp(data.date));
    request.setDomainOfInfluenceId(data.domainOfInfluenceId);
    fillProtoMap(request.getDescriptionMap(), data.description);
    return request;
  }
}
