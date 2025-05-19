/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, HostListener, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionBallotGroupService } from '../../../core/majority-election-ballot-group.service';
import {
  MajorityElectionBallotGroup,
  MajorityElectionBallotGroupCandidates,
  MajorityElectionBallotGroupEntry,
  updateMajorityElectionBallotGroupCandidateCountOk,
  updateMajorityElectionBallotGroupEntryCandidateCountOk,
} from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection, MajorityElectionCandidate } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';
import { groupBySingle } from '../../../core/utils/array.utils';
import { SimpleStepperComponent } from '@abraxas/base-components';
import { SelectionModel } from '@angular/cdk/collections';
import { SecondaryMajorityElectionService } from '../../../core/secondary-majority-election.service';
import { MajorityElectionService } from '../../../core/majority-election.service';

@Component({
  selector: 'app-majority-election-ballot-group-create-dialog',
  templateUrl: './majority-election-ballot-group-edit-dialog.component.html',
  styleUrls: ['./majority-election-ballot-group-edit-dialog.component.scss'],
  standalone: false,
})
export class MajorityElectionBallotGroupEditDialogComponent implements OnDestroy {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  public step: number = 1;
  public ballotGroup: MajorityElectionBallotGroup;
  public isNew: boolean;
  public elections: (MajorityElection | SecondaryMajorityElection)[] = [];
  public saving: boolean = false;
  public hasChanges: boolean = false;
  public originalBallotGroup!: MajorityElectionBallotGroup;
  public readonly backdropClickSubscription: Subscription;
  public ballotGroupEntries: BallotGroupUiEntry[] = [];
  public originalBallotGroupEntries?: BallotGroupUiEntry[];
  public loading = false;
  public updatedBallotGroupCandidates?: MajorityElectionBallotGroupCandidates;
  public resultHasChanges = false;

  constructor(
    private readonly dialogRef: MatDialogRef<MajorityElectionBallotGroupEditDialogComponent>,
    private readonly ballotGroupService: MajorityElectionBallotGroupService,
    private readonly i18n: TranslateService,
    private readonly dialogService: DialogService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: MajorityElectionBallotGroupEditDialogData,
  ) {
    this.ballotGroup = dialogData.ballotGroup;
    this.isNew = !this.ballotGroup.id;

    if (dialogData.majorityElection) {
      this.elections.push(dialogData.majorityElection);
    }
    this.elections = [...this.elections, ...dialogData.secondaryElections];
    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
    this.initStep();
  }

  public async initStep(): Promise<void> {
    if (this.step === 1) {
      this.originalBallotGroup = cloneDeep(this.ballotGroup);
      return;
    }

    this.loading = true;
    await this.initBallotGroupEntries();

    try {
      const allCandidatesRequests = this.ballotGroupEntries.map(({ election: { id } }) => {
        if (id === this.ballotGroup.majorityElectionId) {
          return this.majorityElectionService.listCandidates(id);
        }
        return this.secondaryMajorityElectionService.listCandidates(id);
      });
      const allCandidates = await Promise.all(allCandidatesRequests);

      for (const [i, candidates] of allCandidates.entries()) {
        const entry = this.ballotGroupEntries[i];
        entry.candidates = candidates;
        updateMajorityElectionBallotGroupEntryCandidateCountOk(entry.entry, entry.election.numberOfMandates);
      }

      this.originalBallotGroupEntries = cloneDeep(this.ballotGroupEntries);
    } finally {
      this.loading = false;
    }
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
  }

  public async handleStepperIndexUpdate(stepIndex: number): Promise<void> {
    const newStep = stepIndex + 1;

    if (this.step === newStep) {
      return;
    }

    if (newStep > this.step) {
      await this.save();
    }

    this.step = newStep;
    await this.initStep();
  }

  public get canSave(): boolean {
    if (this.step === 1) {
      const ballotGroupEntryElectionIds = this.ballotGroup.entries.map(e => e.electionId);

      return (
        !!this.ballotGroup.description &&
        !!this.ballotGroup.shortDescription &&
        !!this.ballotGroup.majorityElectionId &&
        this.elections.every(election => ballotGroupEntryElectionIds.includes(election.id))
      );
    }

    return (
      this.ballotGroup.entries.every(x => {
        const election = this.elections.find(pb => pb.id == x.electionId);
        return !election || election.numberOfMandates === x.countOfCandidates + x.blankRowCount + x.individualCandidatesVoteCount;
      }) && this.ballotGroup.entries.some(e => e.individualCandidatesVoteCount + e.countOfCandidates > 0)
    );
  }

  public async save(): Promise<void> {
    if (this.step === 1 && !this.hasChanges && this.stepper.selectedIndex === 0) {
      this.stepper.next();
      return;
    }

    try {
      this.saving = true;

      if (this.step === 1) {
        if (!this.hasChanges) {
          return;
        }

        const response = this.isNew
          ? await this.ballotGroupService.create(this.ballotGroup)
          : await this.ballotGroupService.update(this.ballotGroup);

        this.ballotGroup.id = response.id;

        this.hasChanges = false;

        for (const entry of this.ballotGroup.entries) {
          entry.id = response.entries.find(e => e.electionId === entry.electionId)!.id;
        }

        this.ballotGroup = {
          ...this.ballotGroup,
        };

        updateMajorityElectionBallotGroupCandidateCountOk(this.ballotGroup, this.elections);
        this.originalBallotGroup = cloneDeep(this.ballotGroup);
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
        this.resultHasChanges = true;

        if (this.stepper.selectedIndex === 0) {
          this.stepper.next();
        }
        return;
      }

      if (!this.hasChanges) {
        this.close();
        return;
      }

      const updatedCandidates = this.buildUpdatedBallotGroupCandidates();
      await this.ballotGroupService.updateCandidates(updatedCandidates);
      this.updatedBallotGroupCandidates = updatedCandidates;
      updateMajorityElectionBallotGroupCandidateCountOk(this.ballotGroup, this.elections);

      this.originalBallotGroupEntries = cloneDeep(this.ballotGroupEntries);
      this.originalBallotGroup = cloneDeep(this.ballotGroup);
      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.resultHasChanges = true;
      this.close();
    } finally {
      this.saving = false;
    }
  }

  public contentChanged(): void {
    this.hasChanges =
      this.step === 1
        ? !isEqual(this.ballotGroup, this.originalBallotGroup)
        : !isEqual(this.ballotGroupEntries, this.originalBallotGroupEntries);
  }

  public async closeWithUnsavedChangesCheck(): Promise<void> {
    if (await this.leaveDialogOpen()) {
      return;
    }

    this.close();
  }

  public close(): void {
    const result: MajorityElectionBallotGroupEditDialogResult | undefined = this.resultHasChanges
      ? {
          isNew: this.isNew,
          ballotGroup: this.originalBallotGroup,
          updatedBallotGroupCandidates: this.updatedBallotGroupCandidates,
        }
      : undefined;

    this.dialogRef.close(result);
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }

  private async initBallotGroupEntries(): Promise<void> {
    let candidates: MajorityElectionBallotGroupCandidates = {
      ballotGroupId: this.ballotGroup.id,
      entryCandidates: this.ballotGroup.entries.map(e => ({
        ballotGroupEntryId: e.id,
        individualCandidatesVoteCount: 0,
        candidateIdsList: [],
        blankRowCount: 0,
      })),
    };

    if (!this.isNew) {
      candidates = await this.ballotGroupService.listCandidates(this.ballotGroup.id);
    }

    const electionsById = groupBySingle(
      this.elections,
      x => x.id,
      x => x,
    );
    const ballotGroupCandidates = groupBySingle(
      candidates.entryCandidates,
      x => x.ballotGroupEntryId,
      x => x,
    );

    this.ballotGroupEntries = this.ballotGroup.entries
      .map(e => ({
        entry: e,
        election: electionsById[e.electionId],
        individualVoteCount: ballotGroupCandidates[e.id]?.individualCandidatesVoteCount ?? 0,
        selectedCandidateIds: ballotGroupCandidates[e.id]?.candidateIdsList ?? [],
        candidates: [],
        selection: new SelectionModel<MajorityElectionCandidate>(),
      }))
      .filter(x => x.election !== undefined);
  }

  private buildUpdatedBallotGroupCandidates(): MajorityElectionBallotGroupCandidates {
    return {
      ballotGroupId: this.ballotGroup.id,
      entryCandidates: this.ballotGroupEntries.map(x => ({
        candidateIdsList: x.selectedCandidateIds,
        ballotGroupEntryId: x.entry.id,
        individualCandidatesVoteCount: x.entry.individualCandidatesVoteCount,
        blankRowCount: x.entry.blankRowCount,
      })),
    };
  }
}

export interface MajorityElectionBallotGroupEditDialogData {
  ballotGroup: MajorityElectionBallotGroup;
  majorityElection?: MajorityElection;
  secondaryElections: SecondaryMajorityElection[];
}

export interface MajorityElectionBallotGroupEditDialogResult {
  ballotGroup: MajorityElectionBallotGroup;
  isNew: boolean;
  updatedBallotGroupCandidates?: MajorityElectionBallotGroupCandidates;
}

export interface BallotGroupUiEntry {
  election: MajorityElection | SecondaryMajorityElection;
  candidates: MajorityElectionCandidate[];
  selectedCandidateIds: string[];
  entry: MajorityElectionBallotGroupEntry;
}
