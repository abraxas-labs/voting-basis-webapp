/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LanguageService } from '../../../core/language.service';
import { MajorityElectionBallotGroupService } from '../../../core/majority-election-ballot-group.service';
import {
  MajorityElectionBallotGroup,
  MajorityElectionBallotGroupCandidates,
  MajorityElectionBallotGroupEntry,
  MajorityElectionBallotGroupEntryCandidates,
  updateMajorityElectionBallotGroupCandidateCountOk,
} from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';
import { groupBySingle } from '../../../core/utils/array.utils';
import {
  MajorityElectionBallotGroupAssignCandidatesDialogComponent,
  MajorityElectionBallotGroupAssignCandidatesDialogData,
  MajorityElectionBallotGroupAssignCandidatesDialogResult,
} from '../majority-election-ballot-group-assign-candidates-dialog/majority-election-ballot-group-assign-candidates-dialog.component';

interface BallotGroupUiEntry<TElection extends MajorityElection | SecondaryMajorityElection> {
  election: TElection;
  entry: MajorityElectionBallotGroupEntry;
  candidates: MajorityElectionBallotGroupEntryCandidates;
}

@Component({
  selector: 'app-majority-election-ballot-group-detail',
  templateUrl: './majority-election-ballot-group-detail.component.html',
  styleUrls: ['./majority-election-ballot-group-detail.component.scss'],
})
export class MajorityElectionBallotGroupDetailComponent {
  @Input()
  public majorityElection!: MajorityElection;

  @Input()
  public secondaryMajorityElections: SecondaryMajorityElection[] = [];

  @Input()
  public readonly: boolean = true;

  // indicates that this component should mainly focus on this secondary election
  @Input()
  public forSecondaryElection?: SecondaryMajorityElection;

  @Output()
  public candidatesAssigned: EventEmitter<void> = new EventEmitter<void>();

  public ballotGroupValue?: MajorityElectionBallotGroup;

  public primaryBallotGroupEntry?: BallotGroupUiEntry<MajorityElection>;
  public secondaryBallotGroupEntries: BallotGroupUiEntry<SecondaryMajorityElection>[] = [];

  public loading: boolean = false;
  public invalidBallotGroupEntriesError?: string;
  private ballotGroupCandidates?: MajorityElectionBallotGroupCandidates;

  constructor(
    private readonly dialogService: DialogService,
    private readonly ballotGroupService: MajorityElectionBallotGroupService,
    private readonly languageService: LanguageService,
  ) {}

  @Input()
  public set ballotGroup(bg: MajorityElectionBallotGroup | undefined) {
    if (!bg) {
      delete this.ballotGroupValue;
      return;
    }

    this.loadBallotGroup(bg);
  }

  public async assignCandidatesForNewBallotGroup(g: MajorityElectionBallotGroup): Promise<void> {
    await this.loadBallotGroup(g);
    await this.assignCandidates();
  }

  public async assignCandidates(): Promise<void> {
    if (!this.ballotGroupValue || !this.ballotGroupCandidates) {
      return;
    }

    const data: MajorityElectionBallotGroupAssignCandidatesDialogData = {
      ballotGroup: this.ballotGroupValue,
      ballotGroupCandidates: this.ballotGroupCandidates,
      majorityElection: this.forSecondaryElection ? undefined : this.majorityElection,
      secondaryElections: this.forSecondaryElection ? [this.forSecondaryElection] : this.secondaryMajorityElections,
    };
    const result = await this.dialogService.openForResult<
      MajorityElectionBallotGroupAssignCandidatesDialogComponent,
      MajorityElectionBallotGroupAssignCandidatesDialogResult
    >(MajorityElectionBallotGroupAssignCandidatesDialogComponent, data);

    if (result) {
      this.ballotGroupCandidates = result.ballotGroupCandidates;
      this.updateCandidates();
      this.refreshInvalidBallotGroupEntriesError();
      this.candidatesAssigned.emit();
    }
  }

  private async loadBallotGroup(ballotGroup: MajorityElectionBallotGroup): Promise<void> {
    if (this.ballotGroupValue?.id === ballotGroup.id) {
      return;
    }

    this.loading = true;

    try {
      this.ballotGroupValue = ballotGroup;
      this.ballotGroupCandidates = await this.ballotGroupService.listCandidates(ballotGroup.id);
      this.buildBallotGroupEntries();
      this.refreshInvalidBallotGroupEntriesError();
    } finally {
      this.loading = false;
    }
  }

  private refreshInvalidBallotGroupEntriesError(): void {
    this.invalidBallotGroupEntriesError = [this.primaryBallotGroupEntry, ...this.secondaryBallotGroupEntries]
      .filter(
        x =>
          x !== undefined &&
          !x.entry.candidateCountOk &&
          (this.forSecondaryElection === undefined || x.election.id === this.forSecondaryElection.id),
      )
      .map(x => this.languageService.getTranslationForCurrentLang(x?.election.shortDescription))
      .join(', ');
  }

  private buildBallotGroupEntries(): void {
    if (!this.ballotGroupValue || !this.ballotGroupCandidates) {
      return;
    }

    updateMajorityElectionBallotGroupCandidateCountOk(this.ballotGroupValue, [this.majorityElection, ...this.secondaryMajorityElections]);

    const candidatesByEntryId = groupBySingle(
      this.ballotGroupCandidates.entryCandidates,
      x => x.ballotGroupEntryId,
      x => x,
    );
    const secondaryElectionsById = groupBySingle(
      this.secondaryMajorityElections,
      x => x.id,
      x => x,
    );

    const secondaryEntries: BallotGroupUiEntry<SecondaryMajorityElection>[] = [];
    for (const entry of this.ballotGroupValue.entries) {
      if (entry.electionId === this.majorityElection.id) {
        this.primaryBallotGroupEntry = {
          candidates: candidatesByEntryId[entry.id],
          election: this.majorityElection,
          entry,
        };
        continue;
      }

      secondaryEntries.push({
        entry,
        election: secondaryElectionsById[entry.electionId],
        candidates: candidatesByEntryId[entry.id],
      });
    }

    this.secondaryBallotGroupEntries = secondaryEntries;
  }

  private updateCandidates(): void {
    if (!this.ballotGroupCandidates || !this.ballotGroupValue) {
      return;
    }

    const entriesById = groupBySingle(
      [this.primaryBallotGroupEntry!, ...this.secondaryBallotGroupEntries],
      x => x.entry.id,
      x => x,
    );
    for (const candidates of this.ballotGroupCandidates.entryCandidates) {
      const entry = entriesById[candidates.ballotGroupEntryId];
      entry.entry.individualCandidatesVoteCount = candidates.individualCandidatesVoteCount;
      entry.candidates = candidates;
    }
  }
}
