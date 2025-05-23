/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { PoliticalBusinessUnion } from '../../core/models/political-business-union.model';

@Component({
  selector: 'app-majority-election-union-detail',
  templateUrl: './majority-election-union-detail.component.html',
  standalone: false,
})
export class MajorityElectionUnionDetailComponent {
  @Input()
  public politicalBusinessUnion!: PoliticalBusinessUnion;
}
