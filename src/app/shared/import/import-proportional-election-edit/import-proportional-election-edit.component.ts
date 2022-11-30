/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { DomainOfInfluenceLevelService } from '../../../core/domain-of-influence-level.service';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { ProportionalElectionImport } from '../../../core/models/import.model';
import { ProportionalElection, ProportionalElectionMandateAlgorithm } from '../../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../../core/proportional-election.service';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';

@Component({
  selector: 'app-import-proportional-election-edit',
  templateUrl: './import-proportional-election-edit.component.html',
  styleUrls: ['./import-proportional-election-edit.component.scss'],
})
export class ImportProportionalElectionEditComponent extends ImportPoliticalBusinessEditComponent<ProportionalElection> {
  public mandateAlgorithms: EnumItemDescription<ProportionalElectionMandateAlgorithm>[] = [];

  private proportionalElectionImport?: ProportionalElectionImport;

  constructor(enumUtil: EnumUtil, doiLevelService: DomainOfInfluenceLevelService, domainOfInfluenceService: DomainOfInfluenceService) {
    super(enumUtil, doiLevelService, domainOfInfluenceService);
  }

  @Input()
  public set proportionalElection(proportionalElection: ProportionalElectionImport) {
    this.proportionalElectionImport = proportionalElection;
    this.data = ProportionalElectionService.mapToProportionalElection(proportionalElection.getElection()!);
  }

  public apply(): void {
    const proportionalElection = this.proportionalElectionImport!.getElection()!;
    proportionalElection.setPoliticalBusinessNumber(this.data.politicalBusinessNumber);
    proportionalElection.setDomainOfInfluenceId(this.data.domainOfInfluenceId);
    proportionalElection.setMandateAlgorithm(this.data.mandateAlgorithm);
    this.setValid();
  }

  public override handleDomainOfInfluenceDefaultsChange(): void {
    if (!this.domainOfInfluenceDefaults) {
      this.mandateAlgorithms = [];
      return;
    }

    this.mandateAlgorithms = this.enumUtil
      .getArrayWithDescriptions<ProportionalElectionMandateAlgorithm>(
        ProportionalElectionMandateAlgorithm,
        'PROPORTIONAL_ELECTION.MANDATE_ALGORITHM.TYPES.',
      )
      .filter(
        i =>
          this.domainOfInfluenceDefaults!.proportionalElectionMandateAlgorithmsList.includes(i.value) ||
          this.data.mandateAlgorithm === i.value,
      );
  }
}
