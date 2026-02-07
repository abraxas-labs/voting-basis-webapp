/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { VoteImport } from '../../../core/models/import.model';
import { Vote } from '../../../core/models/vote.model';
import { VoteService } from '../../../core/vote.service';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';

@Component({
  selector: 'app-import-vote-edit',
  templateUrl: './import-vote-edit.component.html',
  styleUrls: ['./import-vote-edit.component.scss'],
  standalone: false,
})
export class ImportVoteEditComponent extends ImportPoliticalBusinessEditComponent<Vote> {
  private voteImport?: VoteImport;

  constructor() {
    super();
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
