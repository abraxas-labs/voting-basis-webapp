/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';
import {
  newProportionalElectionCandidate,
  ProportionalElectionCandidate,
  ProportionalElectionList,
} from '../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import {
  ProportionalElectionCandidateEditDialogComponent,
  ProportionalElectionCandidateEditDialogData,
  ProportionalElectionCandidateEditDialogResult,
} from '../proportional-election-candidate-edit-dialog/proportional-election-candidate-edit-dialog.component';

export interface CandidateUpdated {
  candidate: ProportionalElectionCandidate;
  wasAccumulated: boolean;
}

@Component({
  selector: 'app-proportional-election-candidates',
  templateUrl: './proportional-election-candidates.component.html',
  styleUrls: ['./proportional-election-candidates.component.scss'],
})
export class ProportionalElectionCandidatesComponent {
  public readonly columns = [
    'position',
    'number',
    'lastName',
    'firstName',
    'dateOfBirth',
    'sex',
    'title',
    'incumbent',
    'zipCode',
    'locality',
    'actions',
  ];

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public parties: DomainOfInfluenceParty[] = [];

  @Input()
  public maxCandidateCount: number = 0;

  @Output()
  public candidateCreated: EventEmitter<ProportionalElectionCandidate> = new EventEmitter<ProportionalElectionCandidate>();

  @Output()
  public candidateUpdated: EventEmitter<CandidateUpdated> = new EventEmitter<CandidateUpdated>();

  @Output()
  public candidateDeleted: EventEmitter<ProportionalElectionCandidate> = new EventEmitter<ProportionalElectionCandidate>();

  public candidates: ProportionalElectionCandidate[] = [];
  public expandedCandidates: ProportionalElectionCandidate[] = [];
  public loading: boolean = false;
  public selectedCandidate?: ProportionalElectionCandidate;
  public savingAccumulation: boolean = false;
  private currentList?: ProportionalElectionList;

  constructor(
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
  ) {}

  @Input()
  public set list(value: ProportionalElectionList) {
    this.currentList = value;
    this.loadCandidates();
    this.selectedCandidate = undefined;
  }

  public async createCandidate(): Promise<void> {
    if (!this.currentList) {
      return;
    }

    const dialogData: ProportionalElectionCandidateEditDialogData = {
      candidate: newProportionalElectionCandidate(this.expandedCandidates.length + 1, this.currentList.id),
      testingPhaseEnded: false,
      parties: this.parties,
    };
    const result = await this.dialogService.openForResult(ProportionalElectionCandidateEditDialogComponent, dialogData);
    this.handleCreateCandidate(result);
  }

  public async editCandidate(expandedCandidate: ProportionalElectionCandidate): Promise<void> {
    const candidate = this.candidates.find(c => c.id === expandedCandidate.id);

    if (!candidate) {
      return;
    }

    const dialogData: ProportionalElectionCandidateEditDialogData = {
      candidate: { ...candidate },
      testingPhaseEnded: this.testingPhaseEnded,
      parties: this.parties,
    };
    const result = await this.dialogService.openForResult(ProportionalElectionCandidateEditDialogComponent, dialogData);
    this.handleEditCandidate(result);
  }

  public async deleteCandidate(candidate: ProportionalElectionCandidate): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'PROPORTIONAL_ELECTION.CANDIDATE.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    await this.proportionalElectionService.deleteCandidate(candidate.id);
    this.candidates = this.candidates.filter(c => c.id !== candidate.id);
    this.refreshExpandedCandidates();
    this.updateCandidatePositions();
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
    this.candidateDeleted.emit(candidate);
  }

  public selectCandidate(expandedCandidate: ProportionalElectionCandidate): void {
    this.selectedCandidate = this.candidates.find(c => c.id === expandedCandidate.id);
  }

  public async removeAccumulation(candidate: ProportionalElectionCandidate): Promise<void> {
    try {
      this.savingAccumulation = true;
      candidate.accumulated = false;
      await this.proportionalElectionService.updateCandidate(candidate);
      this.refreshExpandedCandidates();
      this.candidateUpdated.emit({ candidate, wasAccumulated: true });
    } catch (e) {
      console.error(e);
      candidate.accumulated = true;
    } finally {
      this.savingAccumulation = false;
    }
  }

  public async accumulate(candidate: ProportionalElectionCandidate): Promise<void> {
    try {
      this.savingAccumulation = true;
      candidate.accumulated = true;
      candidate.accumulatedPosition = this.expandedCandidates.length + 1;
      await this.proportionalElectionService.updateCandidate(candidate);
      this.refreshExpandedCandidates();
      this.candidateUpdated.emit({ candidate, wasAccumulated: false });
    } catch (e) {
      console.error(e);
      candidate.accumulated = false;
    } finally {
      this.savingAccumulation = false;
    }
  }

  public async reorderCandidates(updatedList: ProportionalElectionCandidate[]): Promise<void> {
    if (!this.currentList) {
      return;
    }

    this.expandedCandidates = updatedList;
    this.updateCandidatePositions();
    this.refreshExpandedCandidates();

    await this.proportionalElectionService.reorderCandidates(this.currentList.id, this.candidates);
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
  }

  private async loadCandidates(): Promise<void> {
    if (!this.currentList) {
      return;
    }

    this.loading = true;

    try {
      this.candidates = await this.proportionalElectionService.listCandidates(this.currentList.id);
      this.refreshExpandedCandidates();
    } finally {
      this.loading = false;
    }
  }

  private handleCreateCandidate(data?: ProportionalElectionCandidateEditDialogResult): void {
    if (!data) {
      return;
    }

    this.candidates.push(data.candidate);
    this.refreshExpandedCandidates();
    this.candidateCreated.emit(data.candidate);
  }

  private handleEditCandidate(data?: ProportionalElectionCandidateEditDialogResult): void {
    if (!data) {
      return;
    }

    const existingCandidateIndex = this.candidates.findIndex(c => c.id === data.candidate.id);
    if (existingCandidateIndex < 0) {
      return;
    }

    const wasAccumulated = this.candidates[existingCandidateIndex].accumulated;
    this.candidates[existingCandidateIndex] = data.candidate;
    this.refreshExpandedCandidates();
    this.candidateUpdated.emit({ candidate: data.candidate, wasAccumulated });
  }

  private refreshExpandedCandidates(): void {
    const candidateList: ProportionalElectionCandidate[] = [];

    for (const candidate of this.candidates) {
      candidateList.push(candidate);
      if (candidate.accumulated) {
        candidateList.push({ ...candidate, position: candidate.accumulatedPosition });
      }
    }

    candidateList.sort((a, b) => a.position - b.position);
    this.expandedCandidates = candidateList;
  }

  private updateCandidatePositions(): void {
    const processedCandidates = new Set();

    for (let i = 1; i <= this.expandedCandidates.length; i++) {
      const candidate = this.candidates.find(c => c.id === this.expandedCandidates[i - 1].id);
      if (!candidate) {
        continue;
      }
      if (processedCandidates.has(candidate.id)) {
        candidate.accumulatedPosition = i;
      } else {
        candidate.position = i;
        processedCandidates.add(candidate.id);
      }
    }
  }
}
