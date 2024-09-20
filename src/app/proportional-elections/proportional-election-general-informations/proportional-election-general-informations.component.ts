/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Input, OnInit } from '@angular/core';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceLevelService } from '../../core/domain-of-influence-level.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import {
  newProportionalElection,
  ProportionalElection,
  ProportionalElectionMandateAlgorithm,
} from '../../core/models/proportional-election.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';

@Component({
  selector: 'app-proportional-election-general-informations',
  templateUrl: './proportional-election-general-informations.component.html',
})
export class ProportionalElectionGeneralInformationsComponent
  extends PoliticalBusinessGeneralInformationsComponent<ProportionalElection>
  implements OnInit
{
  @Input()
  public proportionalElectionMandateAlgorithmsList: ProportionalElectionMandateAlgorithm[] = [];

  public mandateAlgorithms: EnumItemDescription<ProportionalElectionMandateAlgorithm>[] = [];

  constructor(
    domainOfInfluenceService: DomainOfInfluenceService,
    enumUtil: EnumUtil,
    contestService: ContestService,
    doiLevelService: DomainOfInfluenceLevelService,
  ) {
    super(enumUtil, domainOfInfluenceService, contestService, doiLevelService, newProportionalElection());
  }

  public get canSave(): boolean {
    return this.isValid && this.data.numberOfMandates > 0 && this.data.mandateAlgorithm !== undefined;
  }

  public async ngOnInit(): Promise<void> {
    await super.ngOnInit();

    this.mandateAlgorithms = this.enumUtil
      .getArrayWithDescriptions<ProportionalElectionMandateAlgorithm>(
        ProportionalElectionMandateAlgorithm,
        'PROPORTIONAL_ELECTION.MANDATE_ALGORITHM.TYPES.',
      )
      .filter(i => this.proportionalElectionMandateAlgorithmsList.includes(i.value) || this.data.mandateAlgorithm === i.value);
    if (this.mandateAlgorithms.length === 1) {
      this.data.mandateAlgorithm = this.mandateAlgorithms[0].value;
    }
  }
}
