/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Page, Pageable } from './models/page.model';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@abraxas/base-components';

// TableDataSource inherits from MatTableDataSource which is used for client side filtering and pagination.
// This class overrides the client side filtering and pagination behavior, so that it can be used with server side pagination.
export class ServerSidePaginationDataSource<T> extends MatTableDataSource<T> {
  private _totalItemsCount: number = 0;
  private _loading: boolean = true;

  public get totalItemsCount(): number {
    return this._totalItemsCount;
  }

  public get loading(): boolean {
    return this._loading;
  }

  public setupPaginator(listFn: (p: Pageable) => Promise<Page<T>>): Observable<void> {
    if (!this.paginator) {
      throw new Error('paginator not set');
    }

    // init data
    const init$ = this.handlePageEvent(
      {
        pageIndex: this.paginator.pageIndex,
        pageSize: this.paginator.pageSize,
        length: this.paginator.length,
      },
      listFn,
    );

    return from(init$).pipe(
      switchMap(() => this.paginator!.page.asObservable()),
      switchMap((e: PageEvent) => this.handlePageEvent(e, listFn)),
    );
  }

  // override the MatTableDataSource method, because it is designed for frontend filtering.
  // always use the backend response items count
  public _updatePaginator(_: number): void {
    super._updatePaginator(this.totalItemsCount);
  }

  // override the MatTableDataSource method, because it is designed for frontend filtering.
  // prevent relying on the current paginator state, only use the backend response as a reference.
  public _pageData(data: T[]): T[] {
    return data;
  }

  private async handlePageEvent(e: PageEvent, listFn: (p: Pageable) => Promise<Page<T>>): Promise<void> {
    if (!this.paginator) {
      throw new Error('paginator not set');
    }

    this._loading = true;

    // mat paginator uses 0-based pageIndex, api uses 1-based pageIndex
    const page = e.pageIndex + 1;

    try {
      const response = await listFn({ page, pageSize: e.pageSize });
      this._totalItemsCount = response.totalItemsCount;
      this.data = response.items;
    } finally {
      this._loading = false;
    }
  }
}
