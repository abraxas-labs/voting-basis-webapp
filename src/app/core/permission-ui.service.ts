/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService } from '@abraxas/base-components';
import { inject, Injectable } from '@angular/core';
import { Permissions } from './models/permissions.model';
import { PermissionService } from './permission.service';
import { DomainOfInfluence } from './models/domain-of-influence.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionUiService {
  private readonly auth = inject(AuthorizationService);
  private readonly permissionService = inject(PermissionService);

  public async hasPoliticalBusinessWritePermissions(domainOfInfluence: DomainOfInfluence | undefined): Promise<boolean> {
    if (!domainOfInfluence) {
      // A new political business does not have a domain of influence yet, and is always writeable.
      return true;
    }

    const tenant = await this.auth.getActiveTenant();
    const canWriteSameTenant = await this.permissionService.hasPermission(Permissions.PoliticalBusiness.WriteActionsSameTenant);
    const canWriteSameCanton = this.permissionService.hasPermission(Permissions.PoliticalBusiness.WriteActionsTenantSameCanton);

    return (canWriteSameTenant && domainOfInfluence.secureConnectId === tenant.id) || canWriteSameCanton;
  }
}
