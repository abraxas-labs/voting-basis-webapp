/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component } from '@angular/core';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceReportLevelService } from '../../core/domain-of-influence-report-level.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { Vote, VoteResultAlgorithm } from '../../core/models/vote.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';
import { PermissionService } from '../../core/permission.service';

@Component({
  selector: 'app-vote-general-informations',
  templateUrl: './vote-general-informations.component.html',
})
export class VoteGeneralInformationsComponent extends PoliticalBusinessGeneralInformationsComponent<Vote> {
  public resultAlgorithms: EnumItemDescription<VoteResultAlgorithm>[] = [];

  constructor(
    domainOfInfluenceService: DomainOfInfluenceService,
    enumUtil: EnumUtil,
    contestService: ContestService,
    doiReportLevelService: DomainOfInfluenceReportLevelService,
    permissionService: PermissionService,
  ) {
    super(enumUtil, domainOfInfluenceService, contestService, doiReportLevelService, permissionService, {} as Vote);
    this.resultAlgorithms = this.enumUtil.getArrayWithDescriptions<VoteResultAlgorithm>(
      VoteResultAlgorithm,
      'VOTE.RESULT_ALGORITHM.TYPES.',
    );
  }

  public get canSave(): boolean {
    return this.isValid && this.data.reportDomainOfInfluenceLevel >= 0;
  }
}
