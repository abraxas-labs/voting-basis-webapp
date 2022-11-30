/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AfterContentInit, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionService } from '../../../core/majority-election.service';
import { MajorityElectionBallotGroupEntryCandidates } from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection, MajorityElectionCandidate } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../../core/secondary-majority-election.service';
import { groupBySingle } from '../../../core/utils/array.utils';

@Component({
  selector: 'app-majority-election-ballot-group-candidates',
  templateUrl: './majority-election-ballot-group-candidates.component.html',
})
export class MajorityElectionBallotGroupCandidatesComponent implements AfterContentInit {
  public readonly columns = ['number', 'lastName', 'firstName'];

  @Input()
  public majorityElection?: MajorityElection;

  @Input()
  public secondaryMajorityElection?: SecondaryMajorityElection;

  public loading: boolean = false;
  public selectedCandidates: MajorityElectionCandidate[] = [];
  public individualCandidatesVoteCount: number = 0;

  public allCandidates: MajorityElectionCandidate[] = [];
  public allCandidatesById: Record<string, MajorityElectionCandidate> = {};

  private selectedCandidateIds: Record<string, boolean> = {};

  constructor(
    private readonly majorityElectionService: MajorityElectionService,
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    readonly i18n: TranslateService,
  ) {}

  @Input()
  public set candidateEntry(entryCandidates: MajorityElectionBallotGroupEntryCandidates | undefined) {
    this.selectedCandidateIds = groupBySingle(
      entryCandidates?.candidateIdsList ?? [],
      x => x,
      x => true,
    );
    this.individualCandidatesVoteCount = entryCandidates?.individualCandidatesVoteCount ?? 0;
    this.loadCandidates();
  }

  public async ngAfterContentInit(): Promise<void> {
    await this.loadCandidates();
  }

  private async loadCandidates(): Promise<void> {
    if (!this.majorityElection && !this.secondaryMajorityElection) {
      return;
    }

    if (Object.keys(this.selectedCandidateIds).every(id => this.allCandidatesById[id] !== undefined)) {
      this.updateSelectedCandidates();
      return;
    }

    this.loading = true;
    try {
      this.allCandidates = !!this.majorityElection
        ? await this.majorityElectionService.listCandidates(this.majorityElection.id)
        : await this.secondaryMajorityElectionService.listCandidates(this.secondaryMajorityElection!.id);
      this.allCandidatesById = groupBySingle(
        this.allCandidates,
        x => x.id,
        x => x,
      );
      this.updateSelectedCandidates();
    } finally {
      this.loading = false;
    }
  }

  private updateSelectedCandidates(): void {
    this.selectedCandidates = this.allCandidates.filter(c => this.selectedCandidateIds[c.id] !== undefined);
  }
}
