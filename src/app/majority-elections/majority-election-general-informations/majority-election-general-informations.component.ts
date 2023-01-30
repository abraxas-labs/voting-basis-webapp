/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, OnInit } from '@angular/core';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceLevelService } from '../../core/domain-of-influence-level.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { MajorityElection, MajorityElectionMandateAlgorithm, newMajorityElection } from '../../core/models/majority-election.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';

@Component({
  selector: 'app-majority-election-general-informations',
  templateUrl: './majority-election-general-informations.component.html',
  styleUrls: ['./majority-election-general-informations.component.scss'],
})
export class MajorityElectionGeneralInformationsComponent
  extends PoliticalBusinessGeneralInformationsComponent<MajorityElection>
  implements OnInit
{
  public mandateAlgorithms: EnumItemDescription<MajorityElectionMandateAlgorithm>[] = [];

  constructor(
    domainOfInfluenceService: DomainOfInfluenceService,
    enumUtil: EnumUtil,
    contestService: ContestService,
    doiLevelService: DomainOfInfluenceLevelService,
  ) {
    super(enumUtil, domainOfInfluenceService, contestService, doiLevelService, newMajorityElection());
  }

  public get canSave(): boolean {
    return this.isValid && this.data.numberOfMandates > 0 && this.data.mandateAlgorithm !== undefined;
  }

  public async ngOnInit(): Promise<void> {
    await super.ngOnInit();

    this.mandateAlgorithms = this.enumUtil.getArrayWithDescriptions<MajorityElectionMandateAlgorithm>(
      MajorityElectionMandateAlgorithm,
      'MAJORITY_ELECTION.MANDATE_ALGORITHM.TYPES.',
    );
  }
}
