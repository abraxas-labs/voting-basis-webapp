/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { Filter } from '@abraxas/base-components';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly tableFilterPrefix: string = 'app:filter:';

  public getActiveFilters(tableName: string): Filter[] {
    const filters = sessionStorage.getItem(this.tableFilterPrefix + tableName);
    return filters ? JSON.parse(filters) : [];
  }

  public storeActiveFilters(tableName: string, activeFilters: Filter[]): void {
    sessionStorage.setItem(this.tableFilterPrefix + tableName, JSON.stringify(activeFilters));
  }
}
