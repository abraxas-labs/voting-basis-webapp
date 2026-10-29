/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DestroyRef, Directive, inject, Input, OnInit } from '@angular/core';
import { FilterDirective } from '@abraxas/base-components';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { StorageService } from '../../core/storage.service';

@Directive({
  selector: '[appStoreActiveFilter]',
  standalone: false,
})
export class StoreActiveFiltersDirective implements OnInit {
  private readonly table = inject(FilterDirective, { self: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);

  @Input({ alias: 'appStoreActiveFilter', required: true })
  public tableName: string = '';

  public ngOnInit(): void {
    this.table.filterActive = this.storageService.getActiveFilters(this.buildStorageKey());

    this.table.filterChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(activeFilters => this.storageService.storeActiveFilters(this.buildStorageKey(), activeFilters));
  }

  private buildStorageKey(): string {
    return `${this.tableName}-${this.router.url}`;
  }
}
