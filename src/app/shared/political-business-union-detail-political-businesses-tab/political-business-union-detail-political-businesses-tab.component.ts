/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MajorityElectionUnionService } from '../../core/majority-election-union.service';
import { PoliticalBusinessUnion, PoliticalBusinessUnionType } from '../../core/models/political-business-union.model';
import { PoliticalBusiness } from '../../core/models/political-business.model';
import { ProportionalElectionUnionService } from '../../core/proportional-election-union.service';
import { PaginatorComponent, TableDataSource } from '@abraxas/base-components';

@Component({
  selector: 'app-political-business-union-detail-political-businesses-tab',
  templateUrl: './political-business-union-detail-political-businesses-tab.component.html',
})
export class PoliticalBusinessUnionDetailPoliticalBusinessesTabComponent implements AfterViewInit {
  public readonly columns = ['politicalBusinessNumber', 'shortDescription', 'domainOfInfluenceName'];

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  public loading: boolean = false;
  public dataSource = new TableDataSource<PoliticalBusiness>();

  private politicalBusinessUnionValue!: PoliticalBusinessUnion;

  constructor(
    private readonly proportionalElectionUnionService: ProportionalElectionUnionService,
    private readonly majorityElectionUnionService: MajorityElectionUnionService,
  ) {}

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
    if (!!this.politicalBusinessUnion.politicalBusinesses) {
      this.dataSource.data = this.politicalBusinessUnion.politicalBusinesses;
      return;
    }

    this.loading = true;
    try {
      this.politicalBusinessUnion.politicalBusinesses =
        this.politicalBusinessUnion.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION
          ? await this.proportionalElectionUnionService.getPoliticalBusinesses(this.politicalBusinessUnion.id)
          : await this.majorityElectionUnionService.getPoliticalBusinesses(this.politicalBusinessUnion.id);
      this.dataSource.data = this.politicalBusinessUnion.politicalBusinesses;
    } finally {
      this.loading = false;
    }
  }
}
