/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionBallotGroupService } from '../../../core/majority-election-ballot-group.service';
import {
  MajorityElectionBallotGroup,
  MajorityElectionBallotGroupEntry,
  newMajorityElectionBallotGroupEntry,
  updateMajorityElectionBallotGroupCandidateCountOk,
} from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';

@Component({
  selector: 'app-majority-election-ballot-group-create-dialog',
  templateUrl: './majority-election-ballot-group-edit-dialog.component.html',
  styleUrls: ['./majority-election-ballot-group-edit-dialog.component.scss'],
})
export class MajorityElectionBallotGroupEditDialogComponent {
  public ballotGroup: MajorityElectionBallotGroup;
  public isNew: boolean;
  public elections: (MajorityElection | SecondaryMajorityElection)[] = [];
  public saving: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<MajorityElectionBallotGroupEditDialogComponent>,
    private readonly ballotGroupService: MajorityElectionBallotGroupService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    @Inject(MAT_DIALOG_DATA) dialogData: MajorityElectionBallotGroupEditDialogData,
  ) {
    this.ballotGroup = dialogData.ballotGroup;
    this.isNew = !this.ballotGroup.id;

    if (dialogData.majorityElection) {
      this.elections.push(dialogData.majorityElection);
    }
    this.elections = [...this.elections, ...dialogData.secondaryElections];
  }

  public get canSave(): boolean {
    return (
      !!this.ballotGroup.description &&
      !!this.ballotGroup.shortDescription &&
      !!this.ballotGroup.majorityElectionId &&
      this.ballotGroup.entries.every(e => !!e.electionId && e.blankRowCount >= 0 && this.validBlankRowCount(e))
    );
  }

  public setBlankRows(electionId: string, value: number): void {
    const entry = this.ballotGroup.entries.find(e => e.electionId === electionId);
    if (entry) {
      entry.blankRowCount = value;
    } else {
      const newEntry = newMajorityElectionBallotGroupEntry(electionId);
      newEntry.blankRowCount = value;
      this.ballotGroup.entries.push(newEntry);
    }
  }

  public async save(): Promise<void> {
    try {
      this.saving = true;

      const response = this.isNew
        ? await this.ballotGroupService.create(this.ballotGroup)
        : await this.ballotGroupService.update(this.ballotGroup);
      this.ballotGroup.id = response.id;

      for (const entry of this.ballotGroup.entries) {
        entry.id = response.entries.find(e => e.electionId === entry.electionId)!.id;
      }

      this.ballotGroup = {
        ...this.ballotGroup,
      };

      updateMajorityElectionBallotGroupCandidateCountOk(this.ballotGroup, this.elections);
      const result: MajorityElectionBallotGroupEditDialogResult = {
        ballotGroup: this.ballotGroup,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private validBlankRowCount(entry: MajorityElectionBallotGroupEntry): boolean {
    const election = this.elections.find(e => e.id === entry.electionId);
    return !election || election.numberOfMandates >= entry.blankRowCount;
  }
}

export interface MajorityElectionBallotGroupEditDialogData {
  ballotGroup: MajorityElectionBallotGroup;
  majorityElection?: MajorityElection;
  secondaryElections: SecondaryMajorityElection[];
}

export interface MajorityElectionBallotGroupEditDialogResult {
  ballotGroup: MajorityElectionBallotGroup;
}
