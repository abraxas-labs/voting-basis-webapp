/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { PoliticalBusinessUnion } from '../../core/models/political-business-union.model';

@Component({
  selector: 'app-proportional-election-union-detail',
  templateUrl: './proportional-election-union-detail.component.html',
  standalone: false,
})
export class ProportionalElectionUnionDetailComponent {
  @Input()
  public politicalBusinessUnion!: PoliticalBusinessUnion;
}
