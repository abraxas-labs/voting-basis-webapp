/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService } from '@abraxas/voting-lib';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MajorityElectionBallotGroupService } from '../../../core/majority-election-ballot-group.service';
import { MajorityElectionBallotGroup, newMajorityElectionBallotGroup } from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection, newMajorityElection } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';
import { MajorityElectionBallotGroupDetailComponent } from '../majority-election-ballot-group-detail/majority-election-ballot-group-detail.component';
import {
  MajorityElectionBallotGroupEditDialogComponent,
  MajorityElectionBallotGroupEditDialogData,
  MajorityElectionBallotGroupEditDialogResult,
} from '../majority-election-ballot-group-edit-dialog/majority-election-ballot-group-edit-dialog.component';

@Component({
  selector: 'app-majority-election-ballot-group-overview',
  templateUrl: './majority-election-ballot-group-overview.component.html',
  styleUrls: ['./majority-election-ballot-group-overview.component.scss'],
  standalone: false,
})
export class MajorityElectionBallotGroupOverviewComponent implements OnInit {
  public readonly columns = ['position', 'shortDescription', 'description', 'actions'];

  @Input()
  public majorityElection: MajorityElection = newMajorityElection();

  @Input()
  public secondaryMajorityElections: SecondaryMajorityElection[] = [];

  @Input()
  public loadBallotGroupsInitially: boolean = true;

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public readonly: boolean = false;

  // indicates that this component should mainly focus on this secondary election
  @Input()
  public forSecondaryElection?: SecondaryMajorityElection;

  @ViewChild(MajorityElectionBallotGroupDetailComponent, { static: true })
  public detail?: MajorityElectionBallotGroupDetailComponent;

  public loading: boolean = true;
  public canSave: boolean = false;

  public ballotGroups: MajorityElectionBallotGroup[] = [];

  public ballotGroupsWithMissingSecondaryElection: MajorityElectionBallotGroup[] = [];
  public ballotGroupsWithMissingSecondaryElectionDescription?: string;

  public selectedBallotGroup?: MajorityElectionBallotGroup;

  private get secondaryMajorityElectionsOnSameBallot(): SecondaryMajorityElection[] {
    return this.secondaryMajorityElections.filter(x => !x.isOnSeparateBallot);
  }

  constructor(
    private readonly ballotGroupService: MajorityElectionBallotGroupService,
    private readonly dialogService: DialogService,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      if (this.loadBallotGroupsInitially) {
        this.ballotGroups = await this.ballotGroupService.list(this.majorityElection.id);
      }
      this.refreshBallotGroupsWithMissingSecondaryElections();
      this.updateCanSave();
    } finally {
      this.loading = false;
    }
  }

  public async create(): Promise<void> {
    const data: MajorityElectionBallotGroupEditDialogData = {
      ballotGroup: newMajorityElectionBallotGroup(this.majorityElection.id, this.ballotGroups.length + 1),
      majorityElection: this.majorityElection,
      secondaryElections: this.secondaryMajorityElectionsOnSameBallot,
    };

    const result = await this.dialogService.openForResult<
      MajorityElectionBallotGroupEditDialogComponent,
      MajorityElectionBallotGroupEditDialogResult
    >(MajorityElectionBallotGroupEditDialogComponent, data);
    this.handleEditBallotGroup(result);
  }

  public async edit(ballotGroup: MajorityElectionBallotGroup): Promise<void> {
    const data: MajorityElectionBallotGroupEditDialogData = {
      ballotGroup: { ...ballotGroup },
      majorityElection: this.majorityElection,
      secondaryElections: this.secondaryMajorityElectionsOnSameBallot,
    };

    const result = await this.dialogService.openForResult<
      MajorityElectionBallotGroupEditDialogComponent,
      MajorityElectionBallotGroupEditDialogResult
    >(MajorityElectionBallotGroupEditDialogComponent, data);
    this.handleEditBallotGroup(result);
  }

  public async fillBlankRows(): Promise<void> {
    if (!this.selectedBallotGroup || !this.majorityElection || !this.forSecondaryElection) {
      return;
    }

    const data: MajorityElectionBallotGroupEditDialogData = {
      ballotGroup: { ...this.selectedBallotGroup },
      secondaryElections: [this.forSecondaryElection],
    };

    const result = await this.dialogService.openForResult<
      MajorityElectionBallotGroupEditDialogComponent,
      MajorityElectionBallotGroupEditDialogResult
    >(MajorityElectionBallotGroupEditDialogComponent, data);
    this.handleEditBallotGroup(result);
  }

  public async delete(ballotGroup: MajorityElectionBallotGroup): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'MAJORITY_ELECTION.BALLOT_GROUP.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    await this.ballotGroupService.delete(ballotGroup.id);
    for (const bg of this.ballotGroups.filter(b => b.position > ballotGroup.position)) {
      bg.position--;
    }

    this.ballotGroups = this.ballotGroups.filter(b => b.id !== ballotGroup.id);
    delete this.selectedBallotGroup;
    this.updateCanSave();
  }

  public updateCanSave(): void {
    this.canSave =
      this.ballotGroupsWithMissingSecondaryElection.length === 0 &&
      this.ballotGroups.every(bg =>
        bg.entries.every(
          e => e.candidateCountOk || (this.forSecondaryElection !== undefined && e.electionId !== this.forSecondaryElection.id),
        ),
      );
  }

  private handleEditBallotGroup(result?: MajorityElectionBallotGroupEditDialogResult): void {
    if (!result) {
      return;
    }

    if (result.isNew) {
      this.ballotGroups = [...this.ballotGroups, result.ballotGroup];
    } else {
      const existingBallotGroupIndex = this.ballotGroups.findIndex(bg => bg.id === result.ballotGroup.id);
      this.ballotGroups.splice(existingBallotGroupIndex, 1, result.ballotGroup);
      this.ballotGroups = [...this.ballotGroups];
    }

    this.refreshBallotGroupsWithMissingSecondaryElections();

    if (result.updatedBallotGroupCandidates) {
      this.detail?.handleUpdatedBallotGroupCandidatesAssign(result.updatedBallotGroupCandidates);
    }

    this.selectedBallotGroup = undefined;
    this.updateCanSave();
  }

  private refreshBallotGroupsWithMissingSecondaryElections(): void {
    const expectedBallotEntryCount = this.secondaryMajorityElectionsOnSameBallot.length + 1;
    this.ballotGroupsWithMissingSecondaryElection = this.ballotGroups.filter(bg => bg.entries.length !== expectedBallotEntryCount);

    if (this.ballotGroupsWithMissingSecondaryElection.length > 0) {
      this.ballotGroupsWithMissingSecondaryElectionDescription = this.ballotGroupsWithMissingSecondaryElection
        .map(bg => bg.shortDescription)
        .join(', ');
    } else {
      delete this.ballotGroupsWithMissingSecondaryElectionDescription;
    }
  }
}
