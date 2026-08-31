/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { MajorityElectionService } from '../../../core/majority-election.service';
import { MajorityElectionImport, SecondaryMajorityElectionImport } from '../../../core/models/import.model';
import {
  MajorityElection,
  MajorityElectionCandidate,
  MajorityElectionMandateAlgorithm,
} from '../../../core/models/majority-election.model';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';
import { SecondaryMajorityElection } from '../../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../../core/secondary-majority-election.service';
import { groupBySingle } from '../../../core/utils/array.utils';

@Component({
  selector: 'app-import-majority-election-edit',
  templateUrl: './import-majority-election-edit.component.html',
  styleUrls: ['./import-majority-election-edit.component.scss'],
  standalone: false,
})
export class ImportMajorityElectionEditComponent extends ImportPoliticalBusinessEditComponent<MajorityElection> {
  public mandateAlgorithms: EnumItemDescription<MajorityElectionMandateAlgorithm>[] = [];
  public candidates: MajorityElectionCandidate[] = [];
  protected secondaryMajorityElectionList: SecondaryMajorityElection[] = [];
  protected secondaryMajorityElectionCandidatesByElectionId: Record<string, MajorityElectionCandidate[]> = {};
  private majorityElectionImport?: MajorityElectionImport;
  private secondaryMajorityElectionImports: SecondaryMajorityElectionImport[] = [];

  constructor() {
    super();
    this.mandateAlgorithms = this.enumUtil.getArrayWithDescriptions<MajorityElectionMandateAlgorithm>(
      MajorityElectionMandateAlgorithm,
      'MAJORITY_ELECTION.MANDATE_ALGORITHM.TYPES.',
    );
  }

  @Input()
  public set majorityElection(majorityElection: MajorityElectionImport) {
    this.majorityElectionImport = majorityElection;
    this.data = MajorityElectionService.mapToMajorityElection(majorityElection.getElection()!);
    this.candidates = majorityElection.getCandidatesList()!.map(MajorityElectionService.mapToMajorityElectionCandidate);

    // trigger an initial reorder which sets the position to a non-zero distinct integer.
    this.reorderCandidates(this.candidates);
  }

  @Input()
  public set secondaryMajorityElections(secondaryMajorityElections: SecondaryMajorityElectionImport[]) {
    this.secondaryMajorityElectionImports = secondaryMajorityElections;
    this.secondaryMajorityElectionList = secondaryMajorityElections.map(x =>
      SecondaryMajorityElectionService.mapToSecondaryMajorityElection(x.getElection()!),
    );
    this.secondaryMajorityElectionCandidatesByElectionId = groupBySingle(
      secondaryMajorityElections,
      x => x.getElection()!.getId(),
      x => x.getCandidatesList()!.map(MajorityElectionService.mapToMajorityElectionCandidate),
    );
  }

  public reorderCandidates(candidates: MajorityElectionCandidate[]) {
    for (let i = 1; i <= this.candidates.length; i++) {
      candidates[i - 1].position = i;

      // add leading zeros if they exist
      candidates[i - 1].number = String(i).padStart(candidates[i - 1].number.length, '0');
    }

    const importCandidates = this.majorityElectionImport!.getCandidatesList()!;

    for (const importCandidate of importCandidates) {
      const dataCandidate = this.candidates.find(c => c.id === importCandidate.getId())!;
      importCandidate.setPosition(dataCandidate.position);
      importCandidate.setNumber(dataCandidate.number);
    }

    importCandidates.sort((a, b) => a.getPosition() - b.getPosition());
    this.majorityElectionImport!.setCandidatesList(importCandidates);
    this.setIsApplied(false);
  }

  public reorderSecondaryElectionCandidates(candidates: MajorityElectionCandidate[], secondaryElectionId: string) {
    for (let i = 1; i <= candidates.length; i++) {
      candidates[i - 1].position = i;

      // add leading zeros if they exist
      candidates[i - 1].number = String(i).padStart(candidates[i - 1].number.length, '0');
    }

    const secondaryElection = this.secondaryMajorityElectionImports.find(x => x.getElection()!.getId() === secondaryElectionId);
    if (!secondaryElection) {
      return;
    }

    const importCandidates = secondaryElection.getCandidatesList();
    for (const importCandidate of importCandidates) {
      const dataCandidate = candidates.find(c => c.id === importCandidate.getId())!;
      importCandidate.setPosition(dataCandidate.position);
      importCandidate.setNumber(dataCandidate.number);
    }

    importCandidates.sort((a, b) => a.getPosition() - b.getPosition());
    secondaryElection.setCandidatesList(importCandidates);
    this.setIsApplied(false);
  }

  public apply(): void {
    const majorityElection = this.majorityElectionImport!.getElection()!;
    majorityElection.setPoliticalBusinessNumber(this.data.politicalBusinessNumber);
    majorityElection.setDomainOfInfluenceId(this.data.domainOfInfluenceId);
    majorityElection.setReportDomainOfInfluenceLevel(this.data.reportDomainOfInfluenceLevel);
    majorityElection.setMandateAlgorithm(this.data.mandateAlgorithm);
    majorityElection.setIndividualCandidatesDisabled(this.data.individualCandidatesDisabled);

    for (const secondaryMajorityElectionImport of this.secondaryMajorityElectionImports) {
      const secondaryMajorityElection = secondaryMajorityElectionImport.getElection()!;
      const secondaryMajorityElectionData = this.secondaryMajorityElectionList.find(x => x.id === secondaryMajorityElection.getId());
      if (!secondaryMajorityElectionData) {
        continue;
      }

      secondaryMajorityElection.setPoliticalBusinessNumber(secondaryMajorityElectionData.politicalBusinessNumber);
      secondaryMajorityElection.setIndividualCandidatesDisabled(secondaryMajorityElectionData.individualCandidatesDisabled);
    }

    this.setIsApplied();
  }
}
