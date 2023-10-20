/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionService } from '../../core/majority-election.service';
import { MajorityElection } from '../../core/models/majority-election.model';
import {
  newSecondaryMajorityElectionCandidate,
  SecondaryMajorityElection,
  SecondaryMajorityElectionCandidate,
} from '../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import { MajorityElectionBallotGroupOverviewComponent } from '../majority-election-ballot-groups/majority-election-ballot-group-overview/majority-election-ballot-group-overview.component';
import {
  SecondaryMajorityElectionCandidateEditDialogComponent,
  SecondaryMajorityElectionCandidateEditDialogData,
  SecondaryMajorityElectionCandidateEditDialogResult,
} from '../secondary-majority-election-candidate-edit-dialog/secondary-majority-election-candidate-edit-dialog.component';

@Component({
  selector: 'app-secondary-majority-election-candidates',
  templateUrl: './secondary-majority-election-candidates.component.html',
  styleUrls: ['./secondary-majority-election-candidates.component.scss'],
})
export class SecondaryMajorityElectionCandidatesComponent {
  @Input()
  public loadCandidates: boolean = true;

  @Input()
  public showBallotGroups: boolean = false;

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @ViewChild(MajorityElectionBallotGroupOverviewComponent, { static: false })
  public ballotGroupOverview?: MajorityElectionBallotGroupOverviewComponent;

  public candidates: SecondaryMajorityElectionCandidate[] = [];
  public expandedCandidates: SecondaryMajorityElectionCandidate[] = [];
  public loading: boolean = false;
  public reordering: boolean = false;
  public currentSecondaryMajorityElection?: SecondaryMajorityElection;
  public majorityElection?: MajorityElection;
  public secondaryMajorityElections: SecondaryMajorityElection[] = [];

  constructor(
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
  ) {}

  public get canSave(): boolean {
    return this.ballotGroupOverview?.canSave ?? false;
  }

  @Input()
  public set secondaryMajorityElection(value: SecondaryMajorityElection) {
    if (!value.id) {
      return;
    }

    this.currentSecondaryMajorityElection = value;
    this.fetchDependencies();
  }

  public async createCandidate(): Promise<void> {
    if (!this.currentSecondaryMajorityElection) {
      return;
    }

    const dialogData: SecondaryMajorityElectionCandidateEditDialogData = {
      candidate: newSecondaryMajorityElectionCandidate(this.candidates.length + 1, this.currentSecondaryMajorityElection.id),
      secondaryMajorityElection: this.currentSecondaryMajorityElection,
      testingPhaseEnded: false,
    };
    const result = await this.dialogService.openForResult(SecondaryMajorityElectionCandidateEditDialogComponent, dialogData);
    this.handleCreateCandidate(result);
  }

  public async editCandidate(candidate: SecondaryMajorityElectionCandidate): Promise<void> {
    const dialogData: SecondaryMajorityElectionCandidateEditDialogData = {
      candidate: { ...candidate },
      secondaryMajorityElection: this.currentSecondaryMajorityElection!,
      testingPhaseEnded: this.testingPhaseEnded,
    };
    const result = await this.dialogService.openForResult(SecondaryMajorityElectionCandidateEditDialogComponent, dialogData);
    this.handleEditCandidate(result);
  }

  public async deleteCandidate(candidate: SecondaryMajorityElectionCandidate): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'MAJORITY_ELECTION.CANDIDATE.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    if (candidate.isReferenced) {
      await this.secondaryMajorityElectionService.deleteCandidateReference(candidate.id);
    } else {
      await this.secondaryMajorityElectionService.deleteCandidate(candidate.id);
    }
    this.candidates = this.candidates.filter(c => c.id !== candidate.id);
    this.refreshExpandedCandidates();
    this.updateCandidatePositions();
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async reorderCandidates(updatedList: SecondaryMajorityElectionCandidate[]): Promise<void> {
    if (!this.currentSecondaryMajorityElection) {
      return;
    }

    // remove the expanded candidate
    this.candidates = updatedList.filter(x => !!x.id);
    this.updateCandidatePositions();

    try {
      this.reordering = true;
      await this.secondaryMajorityElectionService.reorderCandidates(this.currentSecondaryMajorityElection.id, this.candidates);
      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
    } finally {
      this.reordering = false;
    }
  }

  private async fetchDependencies(): Promise<void> {
    if (!this.currentSecondaryMajorityElection) {
      return;
    }
    const secondaryMajorityElection = this.currentSecondaryMajorityElection;

    this.loading = true;
    try {
      if (this.showBallotGroups) {
        const majorityElectionId = secondaryMajorityElection.primaryMajorityElectionId;
        this.majorityElection = await this.majorityElectionService.get(majorityElectionId);
        this.secondaryMajorityElections = await this.secondaryMajorityElectionService.list(majorityElectionId);
      }

      // if a majority election is newly created, we may not want to load the candidates
      // since the creation-event hasn't been processed (there are no candidates anyway)
      if (this.loadCandidates && secondaryMajorityElection.id) {
        this.candidates = await this.secondaryMajorityElectionService.listCandidates(secondaryMajorityElection.id);
      }
      this.refreshExpandedCandidates();
    } finally {
      this.loading = false;
    }
  }

  private handleCreateCandidate(data?: SecondaryMajorityElectionCandidateEditDialogResult): void {
    if (!data) {
      return;
    }

    this.candidates = [...this.candidates, data.candidate];
    this.refreshExpandedCandidates();
  }

  private handleEditCandidate(data?: SecondaryMajorityElectionCandidateEditDialogResult): void {
    if (!data) {
      return;
    }

    const existingCandidateIndex = this.candidates.findIndex(c => c.id === data.candidate.id);
    if (existingCandidateIndex < 0) {
      return;
    }

    this.candidates[existingCandidateIndex] = data.candidate;
    this.refreshExpandedCandidates();
  }

  private refreshExpandedCandidates(): void {
    const candidateList: SecondaryMajorityElectionCandidate[] = [...this.candidates];

    const individualPlaceholderCandidate: SecondaryMajorityElectionCandidate = newSecondaryMajorityElectionCandidate(999, '');
    individualPlaceholderCandidate.lastName = this.i18n.instant('MAJORITY_ELECTION.CANDIDATE.INDIVIDUAL_PLACEHOLDER');
    candidateList.push(individualPlaceholderCandidate);
    candidateList.sort((a, b) => a.position - b.position);
    this.expandedCandidates = candidateList;
  }

  private updateCandidatePositions(): void {
    for (let i = 1; i <= this.candidates.length; i++) {
      this.candidates[i - 1].position = i;
    }
  }
}
