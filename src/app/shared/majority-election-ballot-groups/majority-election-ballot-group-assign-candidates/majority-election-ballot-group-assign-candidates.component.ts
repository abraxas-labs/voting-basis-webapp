/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MajorityElectionBallotGroup, MajorityElectionBallotGroupEntry } from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection, MajorityElectionCandidate } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';

@Component({
  selector: 'app-majority-election-ballot-group-assign-candidates',
  templateUrl: './majority-election-ballot-group-assign-candidates.component.html',
  styleUrl: './majority-election-ballot-group-assign-candidates.component.scss',
  standalone: false,
})
export class MajorityElectionBallotGroupAssignCandidatesComponent {
  @Input()
  public ballotGroup!: MajorityElectionBallotGroup;

  @Input()
  public ballotGroupEntries: BallotGroupUiEntry[] = [];

  @Output()
  public contentChange: EventEmitter<void> = new EventEmitter();

  public contentChanged(): void {
    this.contentChange.emit();
  }
}

export interface BallotGroupUiEntry {
  election: MajorityElection | SecondaryMajorityElection;
  candidates: MajorityElectionCandidate[];
  selectedCandidateIds: string[];
  entry: MajorityElectionBallotGroupEntry;
}
