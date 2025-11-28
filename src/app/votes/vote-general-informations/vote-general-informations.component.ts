/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumUtil } from '@abraxas/voting-lib';
import { Component } from '@angular/core';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceReportLevelService } from '../../core/domain-of-influence-report-level.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { Vote } from '../../core/models/vote.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';
import { PermissionService } from '../../core/permission.service';
import { DialogService } from '@abraxas/base-components';

@Component({
  selector: 'app-vote-general-informations',
  templateUrl: './vote-general-informations.component.html',
  styleUrls: ['./vote-general-informations.component.scss'],
  standalone: false,
})
export class VoteGeneralInformationsComponent extends PoliticalBusinessGeneralInformationsComponent<Vote> {
  constructor(
    domainOfInfluenceService: DomainOfInfluenceService,
    enumUtil: EnumUtil,
    contestService: ContestService,
    doiReportLevelService: DomainOfInfluenceReportLevelService,
    permissionService: PermissionService,
    dialogService: DialogService,
  ) {
    super(enumUtil, domainOfInfluenceService, contestService, doiReportLevelService, permissionService, dialogService, {} as Vote);
  }

  public get canSave(): boolean {
    return this.isValid && this.data.reportDomainOfInfluenceLevel >= 0 && !!this.data.resultAlgorithm;
  }
}
