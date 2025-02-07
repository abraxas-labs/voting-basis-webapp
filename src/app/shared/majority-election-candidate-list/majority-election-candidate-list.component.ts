/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MajorityElectionCandidate } from '../../core/models/majority-election.model';

@Component({
  selector: 'app-majority-election-candidate-list',
  templateUrl: './majority-election-candidate-list.component.html',
  styleUrls: ['./majority-election-candidate-list.component.scss'],
})
export class MajorityElectionCandidateListComponent {
  public readonly columns = [
    'position',
    'number',
    'lastName',
    'firstName',
    'dateOfBirth',
    'sex',
    'title',
    'party',
    'incumbent',
    'zipCode',
    'locality',
    'actions',
  ];

  @Input()
  public candidates: MajorityElectionCandidate[] = [];

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public reordering: boolean = false;

  @Input()
  public readonly: boolean = false;

  @Output()
  public edit: EventEmitter<MajorityElectionCandidate> = new EventEmitter<MajorityElectionCandidate>();

  @Output()
  public delete: EventEmitter<MajorityElectionCandidate> = new EventEmitter<MajorityElectionCandidate>();

  @Output()
  public candidatesReordered: EventEmitter<MajorityElectionCandidate[]> = new EventEmitter<MajorityElectionCandidate[]>();

  public async moveCandidate(previousIndex: number, newIndex: number): Promise<void> {
    if (previousIndex === newIndex || this.reordering) {
      return;
    }

    const removedCandidate = this.candidates.splice(previousIndex, 1)[0];
    this.candidates.splice(newIndex, 0, removedCandidate);
    this.candidates = [...this.candidates];
    this.candidatesReordered.emit(this.candidates);
  }
}
