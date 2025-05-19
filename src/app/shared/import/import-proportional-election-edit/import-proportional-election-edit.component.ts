/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { ProportionalElectionImport } from 'src/app/core/models/import.model';
import { DomainOfInfluenceReportLevelService } from '../../../core/domain-of-influence-report-level.service';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { PartyMappingContainer } from '../../../core/models/domain-of-influence-party.model';
import { ProportionalElection, ProportionalElectionMandateAlgorithm } from '../../../core/models/proportional-election.model';
import { ProportionalElectionPartyMappingService } from '../../../core/proportional-election-party-mapping.service';
import { ProportionalElectionService } from '../../../core/proportional-election.service';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';
import { PermissionService } from '../../../core/permission.service';

@Component({
  selector: 'app-import-proportional-election-edit',
  templateUrl: './import-proportional-election-edit.component.html',
  styleUrls: ['./import-proportional-election-edit.component.scss'],
  standalone: false,
})
export class ImportProportionalElectionEditComponent extends ImportPoliticalBusinessEditComponent<ProportionalElection> {
  public loadingParties: boolean = false;
  public partyMappings?: PartyMappingContainer;
  public mandateAlgorithms: EnumItemDescription<ProportionalElectionMandateAlgorithm>[] = [];

  private proportionalElectionImport?: ProportionalElectionImport;

  constructor(
    enumUtil: EnumUtil,
    doiReportLevelService: DomainOfInfluenceReportLevelService,
    domainOfInfluenceService: DomainOfInfluenceService,
    permissionService: PermissionService,
    private readonly proportionalElectionPartyMappingService: ProportionalElectionPartyMappingService,
  ) {
    super(enumUtil, doiReportLevelService, domainOfInfluenceService, permissionService);
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
    this.proportionalElectionPartyMappingService.applyMappings(this.partyMappings);
    this.setValid();
  }

  protected async handleDomainOfInfluenceChange(): Promise<void> {
    this.setValid(false);
    await super.handleDomainOfInfluenceChange();
    await this.loadPartyMappings();
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

  private async loadPartyMappings(): Promise<void> {
    if (this.selectedDomainOfInfluence === undefined || this.proportionalElectionImport === undefined) {
      delete this.partyMappings;
      return;
    }

    try {
      this.loadingParties = true;
      const parties = await this.domainOfInfluenceService.listParties(this.selectedDomainOfInfluence.id);
      this.partyMappings = this.proportionalElectionPartyMappingService.buildImportPartyMappingGroups(
        this.proportionalElectionImport.getListsList(),
        parties,
      );
    } finally {
      this.loadingParties = false;
    }
  }
}
