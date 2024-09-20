/**
 * (c) Copyright by Abraxas Informatik AG
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
  private permissionCache?: Set<string>;

  constructor(grpcBackend: GrpcBackendService) {
    super(PermissionServicePromiseClient, environment, grpcBackend);
  }

  public async hasPermission(permission: string): Promise<boolean> {
    await this.ensurePermissionsLoaded();
    return this.permissionCache!.has(permission);
  }

  public async hasAnyPermission(...permissions: string[]): Promise<boolean> {
    await this.ensurePermissionsLoaded();
    for (const permission of permissions) {
      if (this.permissionCache!.has(permission)) {
        return true;
      }
    }

    return false;
  }

  private async ensurePermissionsLoaded(): Promise<void> {
    if (this.permissionCache === undefined) {
      this.permissionCache = new Set<string>(await this.listPermissions());
    }
  }

  private listPermissions(): Promise<string[]> {
    return this.request(
      c => c.list,
      new Empty(),
      r => r.getPermissionList(),
    );
  }
}
