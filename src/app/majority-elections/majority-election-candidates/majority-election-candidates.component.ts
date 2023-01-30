/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, Input, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { MajorityElection, MajorityElectionCandidate, newMajorityElectionCandidate } from '../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import {
  MajorityElectionCandidatesImportDialogComponent,
  MajorityElectionCandidatesImportDialogData,
} from '../../shared/import/majority-election-candidates-import-dialog/majority-election-candidates-import-dialog.component';
import { MajorityElectionBallotGroupOverviewComponent } from '../../shared/majority-election-ballot-groups/majority-election-ballot-group-overview/majority-election-ballot-group-overview.component';
import {
  MajorityElectionCandidateEditDialogComponent,
  MajorityElectionCandidateEditDialogData,
  MajorityElectionCandidateEditDialogResult,
} from '../../shared/majority-election-candidate-edit-dialog/majority-election-candidate-edit-dialog.component';

@Component({
  selector: 'app-majority-election-candidates',
  templateUrl: './majority-election-candidates.component.html',
  styleUrls: ['./majority-election-candidates.component.scss'],
})
export class MajorityElectionCandidatesComponent {
  @Input()
  public loadDependencies: boolean = false;

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @ViewChild(MajorityElectionBallotGroupOverviewComponent, { static: false })
  public ballotGroupOverview?: MajorityElectionBallotGroupOverviewComponent;

  public candidates: MajorityElectionCandidate[] = [];
  public expandedCandidates: MajorityElectionCandidate[] = [];
  public loading: boolean = false;
  public currentMajorityElection?: MajorityElection;
  public secondaryElections: SecondaryMajorityElection[] = [];
  public currentDomainOfInfluence?: DomainOfInfluence;

  constructor(
    private readonly majorityElectionService: MajorityElectionService,
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
  ) {}

  @Input()
  public set majorityElection(value: MajorityElection) {
    this.currentMajorityElection = value;
    this.loadDomainOfInfluence(value.domainOfInfluenceId);
    this.fetchDependencies();
  }

  public get canSave(): boolean {
    return this.ballotGroupOverview?.canSave ?? false;
  }

  public async createCandidate(): Promise<void> {
    if (!this.currentMajorityElection || !this.currentDomainOfInfluence) {
      return;
    }

    const dialogData: MajorityElectionCandidateEditDialogData = {
      candidate: newMajorityElectionCandidate(this.candidates.length + 1, this.currentMajorityElection.id),
      testingPhaseEnded: false,
      doiType: this.currentDomainOfInfluence.type,
    };
    const result = await this.dialogService.openForResult(MajorityElectionCandidateEditDialogComponent, dialogData);
    this.handleCreateCandidate(result);
  }

  public async editCandidate(candidate: MajorityElectionCandidate): Promise<void> {
    if (!this.currentDomainOfInfluence) {
      return;
    }

    const dialogData: MajorityElectionCandidateEditDialogData = {
      candidate: { ...candidate },
      testingPhaseEnded: this.testingPhaseEnded,
      doiType: this.currentDomainOfInfluence.type,
    };
    const result = await this.dialogService.openForResult(MajorityElectionCandidateEditDialogComponent, dialogData);
    this.handleEditCandidate(result);
  }

  public async deleteCandidate(candidate: MajorityElectionCandidate): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'MAJORITY_ELECTION.CANDIDATE.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    await this.majorityElectionService.deleteCandidate(candidate.id);
    this.candidates = this.candidates.filter(c => c.id !== candidate.id);
    this.refreshExpandedCandidates();
    this.updateCandidatePositions();
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async reorderCandidates(updatedList: MajorityElectionCandidate[]): Promise<void> {
    if (!this.currentMajorityElection) {
      return;
    }

    // remove the expanded candidate
    this.candidates = updatedList.filter(x => !!x.id);
    this.updateCandidatePositions();
    this.refreshExpandedCandidates();

    await this.majorityElectionService.reorderCandidates(this.currentMajorityElection.id, this.candidates);
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
  }

  public importCandidates(): void {
    if (!this.currentMajorityElection) {
      return;
    }

    const dialogData: MajorityElectionCandidatesImportDialogData = {
      majorityElection: this.currentMajorityElection,
    };

    this.dialogService.open(MajorityElectionCandidatesImportDialogComponent, dialogData);
  }

  private async fetchDependencies(): Promise<void> {
    if (!this.currentMajorityElection) {
      return;
    }

    this.loading = true;
    try {
      if (this.loadDependencies) {
        // if a majority election is newly created, we may not want to load the candidates/secondary elections
        // since the creation-event hasn't been processed (there are no candidates anyway)
        const majorityElectionId = this.currentMajorityElection.id;
        [this.candidates, this.secondaryElections] = await Promise.all([
          this.majorityElectionService.listCandidates(majorityElectionId),
          this.secondaryMajorityElectionService.list(majorityElectionId),
        ]);
      }
      this.refreshExpandedCandidates();
    } finally {
      this.loading = false;
    }
  }

  private handleCreateCandidate(data?: MajorityElectionCandidateEditDialogResult): void {
    if (!data) {
      return;
    }

    this.candidates = [...this.candidates, data.candidate];
    this.refreshExpandedCandidates();
  }

  private handleEditCandidate(data?: MajorityElectionCandidateEditDialogResult): void {
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
    const candidateList: MajorityElectionCandidate[] = [...this.candidates];

    const individualPlaceholderCandidate = newMajorityElectionCandidate(999, '');
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

  private async loadDomainOfInfluence(domainOfInfluenceId: string): Promise<void> {
    this.currentDomainOfInfluence = await this.domainOfInfluenceService.get(domainOfInfluenceId);
  }
}
