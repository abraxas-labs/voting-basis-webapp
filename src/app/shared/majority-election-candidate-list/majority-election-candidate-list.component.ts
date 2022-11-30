/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
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

  @Output()
  public edit: EventEmitter<MajorityElectionCandidate> = new EventEmitter<MajorityElectionCandidate>();

  @Output()
  public delete: EventEmitter<MajorityElectionCandidate> = new EventEmitter<MajorityElectionCandidate>();

  @Output()
  public candidatesReordered: EventEmitter<MajorityElectionCandidate[]> = new EventEmitter<MajorityElectionCandidate[]>();
}
