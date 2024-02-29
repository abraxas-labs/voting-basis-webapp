/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PermissionServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/permission_service_grpc_web_pb';
import { Injectable } from '@angular/core';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { environment } from '../../environments/environment';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';

@Injectable({
  providedIn: 'root',
})
export class PermissionService extends GrpcService<PermissionServicePromiseClient> {
  private permissionCache?: string[];

  constructor(grpcBackend: GrpcBackendService) {
    super(PermissionServicePromiseClient, environment, grpcBackend);
  }

  public async hasPermission(permission: string): Promise<boolean> {
    if (this.permissionCache === undefined) {
      this.permissionCache = await this.listPermissions();
    }

    return this.permissionCache.includes(permission);
  }

  private listPermissions(): Promise<string[]> {
    return this.request(
      c => c.list,
      new Empty(),
      r => r.getPermissionList(),
    );
  }
}
