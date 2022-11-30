/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AuthorizationService } from '@abraxas/base-components';
import { Injectable } from '@angular/core';
import { Roles } from './models/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private readonly auth: AuthorizationService) {}

  public isAdmin(): Promise<boolean> {
    return this.auth.hasRole(Roles.Admin);
  }
}
