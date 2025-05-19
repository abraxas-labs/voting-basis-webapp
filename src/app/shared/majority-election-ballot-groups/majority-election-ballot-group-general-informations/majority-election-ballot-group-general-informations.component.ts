/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  MajorityElectionBallotGroup,
  newMajorityElectionBallotGroupEntry,
} from '../../../core/models/majority-election-ballot-group.model';
import { MajorityElection } from '../../../core/models/majority-election.model';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';

@Component({
  selector: 'app-majority-election-ballot-group-general-informations',
  templateUrl: './majority-election-ballot-group-general-informations.component.html',
  styleUrl: './majority-election-ballot-group-general-informations.component.scss',
  standalone: false,
})
export class MajorityElectionBallotGroupGeneralInformationsComponent implements OnInit {
  @Input()
  public elections: (MajorityElection | SecondaryMajorityElection)[] = [];

  @Input()
  public ballotGroup!: MajorityElectionBallotGroup;

  @Output()
  public contentChange: EventEmitter<void> = new EventEmitter();

  public ngOnInit(): void {
    for (const election of this.elections) {
      if (!this.ballotGroup.entries.some(e => e.electionId === election.id)) {
        this.ballotGroup.entries.push(newMajorityElectionBallotGroupEntry(election.id));
      }
    }
  }

  public contentChanged(): void {
    if (this.elections) this.contentChange.emit();
  }
}
