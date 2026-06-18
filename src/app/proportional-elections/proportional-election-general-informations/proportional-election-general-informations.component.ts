/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input, OnInit } from '@angular/core';
import {
  newProportionalElection,
  ProportionalElection,
  ProportionalElectionMandateAlgorithm,
} from '../../core/models/proportional-election.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';
import { DomainOfInfluenceCanton, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-proportional-election-general-informations',
  templateUrl: './proportional-election-general-informations.component.html',
  styleUrls: ['./proportional-election-general-informations.component.scss'],
  standalone: false,
})
export class ProportionalElectionGeneralInformationsComponent
  extends PoliticalBusinessGeneralInformationsComponent<ProportionalElection>
  implements OnInit
{
  @Input()
  public proportionalElectionMandateAlgorithmsList: ProportionalElectionMandateAlgorithm[] = [];

  @Input()
  public canton: DomainOfInfluenceCanton = DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED;

  constructor() {
    super(newProportionalElection());
  }

  public get canSave(): boolean {
    return this.isValid && this.data.numberOfMandates > 0 && !!this.data.mandateAlgorithm;
  }

  protected domainOfInfluenceTypeChange(domainOfInfluenceType: DomainOfInfluenceType): void {
    if (domainOfInfluenceType === DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU) {
      this.data.federalIdentification = '';
    }

    this.selectedDomainOfInfluenceType = domainOfInfluenceType;
    this.contentChanged.emit();
  }
}
