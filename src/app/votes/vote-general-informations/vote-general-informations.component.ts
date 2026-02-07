/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component } from '@angular/core';
import { Vote } from '../../core/models/vote.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';

@Component({
  selector: 'app-vote-general-informations',
  templateUrl: './vote-general-informations.component.html',
  styleUrls: ['./vote-general-informations.component.scss'],
  standalone: false,
})
export class VoteGeneralInformationsComponent extends PoliticalBusinessGeneralInformationsComponent<Vote> {
  constructor() {
    super({} as Vote);
  }

  public get canSave(): boolean {
    return this.isValid && this.data.reportDomainOfInfluenceLevel >= 0 && !!this.data.resultAlgorithm;
  }
}
