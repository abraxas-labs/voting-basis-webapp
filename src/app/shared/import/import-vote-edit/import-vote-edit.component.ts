/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { DomainOfInfluenceReportLevelService } from '../../../core/domain-of-influence-report-level.service';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { VoteImport } from '../../../core/models/import.model';
import { Vote, VoteResultAlgorithm } from '../../../core/models/vote.model';
import { VoteService } from '../../../core/vote.service';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';
import { PermissionService } from '../../../core/permission.service';

@Component({
  selector: 'app-import-vote-edit',
  templateUrl: './import-vote-edit.component.html',
  styleUrls: ['./import-vote-edit.component.scss'],
  standalone: false,
})
export class ImportVoteEditComponent extends ImportPoliticalBusinessEditComponent<Vote> {
  public resultAlgorithms: EnumItemDescription<VoteResultAlgorithm>[] = [];
  private voteImport?: VoteImport;

  constructor(
    enumUtil: EnumUtil,
    doiReportLevelService: DomainOfInfluenceReportLevelService,
    domainOfInfluenceService: DomainOfInfluenceService,
    permissionService: PermissionService,
  ) {
    super(enumUtil, doiReportLevelService, domainOfInfluenceService, permissionService);
    this.resultAlgorithms = enumUtil.getArrayWithDescriptions<VoteResultAlgorithm>(VoteResultAlgorithm, 'VOTE.RESULT_ALGORITHM.TYPES.');
  }

  @Input()
  public set vote(vote: VoteImport) {
    this.voteImport = vote;
    this.data = VoteService.mapToVote(vote.getVote()!);
  }

  public apply(): void {
    const vote = this.voteImport!.getVote()!;
    vote.setPoliticalBusinessNumber(this.data.politicalBusinessNumber);
    vote.setDomainOfInfluenceId(this.data.domainOfInfluenceId);
    vote.setReportDomainOfInfluenceLevel(this.data.reportDomainOfInfluenceLevel);
    vote.setResultAlgorithm(this.data.resultAlgorithm);
    this.setIsApplied();
  }
}
