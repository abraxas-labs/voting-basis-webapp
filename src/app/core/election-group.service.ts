/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ElectionGroupServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/election_group_service_grpc_web_pb';
import {
  ListElectionGroupsRequest,
  UpdateElectionGroupRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/election_group_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ElectionGroup } from './models/election-group.model';

@Injectable({
  providedIn: 'root',
})
export class ElectionGroupService extends GrpcService<ElectionGroupServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(ElectionGroupServicePromiseClient, environment, grpcBackend);
  }

  public update(data: ElectionGroup): Promise<void> {
    return this.requestEmptyResp(c => c.update, this.mapToUpdateElectionGroupRequest(data));
  }

  public list(contestId: string): Promise<ElectionGroup[]> {
    const req = new ListElectionGroupsRequest();
    req.setContestId(contestId);
    return this.request(
      c => c.list,
      req,
      r => r.toObject().electionGroupsList,
    );
  }

  private mapToUpdateElectionGroupRequest(data: ElectionGroup): UpdateElectionGroupRequest {
    const result = new UpdateElectionGroupRequest();
    result.setId(data.id);
    result.setDescription(data.description);
    result.setPrimaryMajorityElectionId(data.primaryMajorityElection!.id);
    return result;
  }
}
