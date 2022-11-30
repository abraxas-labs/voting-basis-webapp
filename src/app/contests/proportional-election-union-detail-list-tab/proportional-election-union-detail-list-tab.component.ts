/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PoliticalBusinessUnion } from '../../core/models/political-business-union.model';
import { ProportionalElectionUnionList } from '../../core/models/proportional-election-union.model';
import { ProportionalElectionUnionService } from '../../core/proportional-election-union.service';

@Component({
  selector: 'app-proportional-election-union-detail-list-tab',
  templateUrl: './proportional-election-union-detail-list-tab.component.html',
})
export class ProportionalElectionUnionDetailListTabComponent implements AfterViewInit {
  public readonly columns = ['orderNumber', 'shortDescription', 'politicalBusinessNumbers', 'listCount'];

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public loading: boolean = false;
  public dataSource: MatTableDataSource<ProportionalElectionUnionList> = new MatTableDataSource<ProportionalElectionUnionList>();

  private politicalBusinessUnionValue!: PoliticalBusinessUnion;

  constructor(private readonly proportionalElectionUnionService: ProportionalElectionUnionService) {}

  public get politicalBusinessUnion(): PoliticalBusinessUnion {
    return this.politicalBusinessUnionValue;
  }

  @Input()
  public set politicalBusinessUnion(v: PoliticalBusinessUnion) {
    this.politicalBusinessUnionValue = v;
    this.loadData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async loadData(): Promise<void> {
    this.loading = true;
    try {
      this.dataSource.data = await this.proportionalElectionUnionService.getProportionalElectionUnionLists(this.politicalBusinessUnion.id);
    } finally {
      this.loading = false;
    }
  }
}
