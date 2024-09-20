/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PaginatorComponent, TableDataSource } from '@abraxas/base-components';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MajorityElectionUnionService } from '../../core/majority-election-union.service';
import { ElectionCandidate } from '../../core/models/election-candidate.model';
import { PoliticalBusinessUnion, PoliticalBusinessUnionType } from '../../core/models/political-business-union.model';
import { ProportionalElectionUnionService } from '../../core/proportional-election-union.service';

@Component({
  selector: 'app-political-business-union-detail-candidates-tab',
  templateUrl: './political-business-union-detail-candidates-tab.component.html',
  styleUrls: ['./political-business-union-detail-candidates-tab.component.scss'],
})
export class PoliticalBusinessUnionDetailCandidatesTabComponent implements AfterViewInit {
  public readonly columns = ['number', 'lastName', 'firstName', 'dateOfBirth', 'sex', 'title', 'incumbent', 'zipCode', 'locality'];

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  public loading: boolean = false;
  public dataSource = new TableDataSource<ElectionCandidate>();

  private politicalBusinessUnionValue!: PoliticalBusinessUnion;

  constructor(
    private readonly proportionalElectionUnionService: ProportionalElectionUnionService,
    private readonly majorityElectionUnionService: MajorityElectionUnionService,
  ) {}

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  @Input()
  public set politicalBusinessUnion(v: PoliticalBusinessUnion) {
    this.politicalBusinessUnionValue = v;
    this.loadData();
  }

  public async loadData(): Promise<void> {
    if (!!this.politicalBusinessUnionValue.candidates) {
      return;
    }

    this.loading = true;
    try {
      this.dataSource.data =
        this.politicalBusinessUnionValue.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION
          ? await this.proportionalElectionUnionService.getCandidates(this.politicalBusinessUnionValue.id)
          : await this.majorityElectionUnionService.getCandidates(this.politicalBusinessUnionValue.id);
    } finally {
      this.loading = false;
    }
  }
}
