/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { ElectionCandidate } from '../../core/models/election-candidate.model';
import { PoliticalBusinessUnion } from '../../core/models/political-business-union.model';

@Component({
  selector: 'app-political-business-union-detail',
  templateUrl: './political-business-union-detail.component.html',
})
export class PoliticalBusinessUnionDetailComponent {
  public candidates: ElectionCandidate[] = [];

  @ContentChild('listTab', { static: true })
  public listTab?: TemplateRef<any>;

  @Input()
  public politicalBusinessUnion?: PoliticalBusinessUnion;
}
