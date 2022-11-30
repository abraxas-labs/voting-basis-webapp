/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionBallotGroupService } from '../../../core/majority-election-ballot-group.service';
import { MajorityElectionService } from '../../../core/majority-election.service';
import {
  MajorityElectionBallotGroup,
  MajorityElectionBallotGroupCandidates,
  MajorityElectionBallotGroupEntry,
  updateMajorityElectionBallotGroupCandidateCountOk,
  updateMajorityElectionBallotGroupEntryCandidateCountOk,
} from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection, MajorityElectionCandidate } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../../core/secondary-majority-election.service';
import { groupBySingle } from '../../../core/utils/array.utils';

@Component({
  selector: 'app-majority-election-ballot-group-assign-candidates-dialog',
  templateUrl: './majority-election-ballot-group-assign-candidates-dialog.component.html',
  styleUrls: ['./majority-election-ballot-group-assign-candidates-dialog.component.scss'],
})
export class MajorityElectionBallotGroupAssignCandidatesDialogComponent implements OnInit {
  public ballotGroup: MajorityElectionBallotGroup;
  public ballotGroupEntries: BallotGroupUiEntry[];

  public saving: boolean = false;
  public loading: boolean = true;
  private readonly elections: (MajorityElection | SecondaryMajorityElection)[];

  constructor(
    private readonly dialogRef: MatDialogRef<MajorityElectionBallotGroupAssignCandidatesDialogComponent>,
    private readonly ballotGroupService: MajorityElectionBallotGroupService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    @Inject(MAT_DIALOG_DATA) dialogData: MajorityElectionBallotGroupAssignCandidatesDialogData,
  ) {
    this.ballotGroup = dialogData.ballotGroup;

    this.elections = [...dialogData.secondaryElections];
    if (!!dialogData.majorityElection) {
      this.elections.push(dialogData.majorityElection);
    }

    const electionsById = groupBySingle(
      this.elections,
      x => x.id,
      x => x,
    );
    const ballotGroupCandidates = groupBySingle(
      dialogData.ballotGroupCandidates.entryCandidates,
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

  public async ngOnInit(): Promise<void> {
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
    } finally {
      this.loading = false;
    }
  }

  public async save(): Promise<void> {
    try {
      this.saving = true;

      const updatedCandidates = this.buildUpdatedBallotGroupCandidates();
      await this.ballotGroupService.updateCandidates(updatedCandidates);

      updateMajorityElectionBallotGroupCandidateCountOk(this.ballotGroup, this.elections);
      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: MajorityElectionBallotGroupAssignCandidatesDialogResult = {
        ballotGroupCandidates: updatedCandidates,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private buildUpdatedBallotGroupCandidates(): MajorityElectionBallotGroupCandidates {
    return {
      ballotGroupId: this.ballotGroup.id,
      entryCandidates: this.ballotGroupEntries.map(x => ({
        candidateIdsList: x.selectedCandidateIds,
        ballotGroupEntryId: x.entry.id,
        individualCandidatesVoteCount: x.entry.individualCandidatesVoteCount,
      })),
    };
  }
}

export interface BallotGroupUiEntry {
  election: MajorityElection | SecondaryMajorityElection;
  candidates: MajorityElectionCandidate[];
  selectedCandidateIds: string[];
  entry: MajorityElectionBallotGroupEntry;
}

export interface MajorityElectionBallotGroupAssignCandidatesDialogData {
  ballotGroup: MajorityElectionBallotGroup;
  ballotGroupCandidates: MajorityElectionBallotGroupCandidates;
  majorityElection?: MajorityElection;
  secondaryElections: SecondaryMajorityElection[];
}

export interface MajorityElectionBallotGroupAssignCandidatesDialogResult {
  ballotGroupCandidates: MajorityElectionBallotGroupCandidates;
}
