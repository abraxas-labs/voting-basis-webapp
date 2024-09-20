/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { DomainOfInfluenceLevelService } from '../../../core/domain-of-influence-level.service';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { MajorityElectionService } from '../../../core/majority-election.service';
import { MajorityElectionImport } from '../../../core/models/import.model';
import { MajorityElection, MajorityElectionMandateAlgorithm } from '../../../core/models/majority-election.model';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';

@Component({
  selector: 'app-import-majority-election-edit',
  templateUrl: './import-majority-election-edit.component.html',
  styleUrls: ['./import-majority-election-edit.component.scss'],
})
export class ImportMajorityElectionEditComponent extends ImportPoliticalBusinessEditComponent<MajorityElection> {
  public mandateAlgorithms: EnumItemDescription<MajorityElectionMandateAlgorithm>[] = [];
  private majorityElectionImport?: MajorityElectionImport;

  constructor(enumUtil: EnumUtil, doiLevelService: DomainOfInfluenceLevelService, domainOfInfluenceService: DomainOfInfluenceService) {
    super(enumUtil, doiLevelService, domainOfInfluenceService);
    this.mandateAlgorithms = enumUtil.getArrayWithDescriptions<MajorityElectionMandateAlgorithm>(
      MajorityElectionMandateAlgorithm,
      'MAJORITY_ELECTION.MANDATE_ALGORITHM.TYPES.',
    );
  }

  @Input()
  public set majorityElection(majorityElection: MajorityElectionImport) {
    this.majorityElectionImport = majorityElection;
    this.data = MajorityElectionService.mapToMajorityElection(majorityElection.getElection()!);
  }

  public apply(): void {
    const majorityElection = this.majorityElectionImport!.getElection()!;
    majorityElection.setPoliticalBusinessNumber(this.data.politicalBusinessNumber);
    majorityElection.setDomainOfInfluenceId(this.data.domainOfInfluenceId);
    majorityElection.setReportDomainOfInfluenceLevel(this.data.reportDomainOfInfluenceLevel);
    majorityElection.setMandateAlgorithm(this.data.mandateAlgorithm);
    majorityElection.setIndividualCandidatesDisabled(this.data.individualCandidatesDisabled);
    this.setValid();
  }
}
