/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription } from '@abraxas/voting-lib';
import { Component, OnInit } from '@angular/core';
import { MajorityElection, MajorityElectionMandateAlgorithm, newMajorityElection } from '../../core/models/majority-election.model';
import { PoliticalBusinessGeneralInformationsComponent } from '../../shared/political-business-general-information/political-business-general-informations.component';

@Component({
  selector: 'app-majority-election-general-informations',
  templateUrl: './majority-election-general-informations.component.html',
  styleUrls: ['./majority-election-general-informations.component.scss'],
  standalone: false,
})
export class MajorityElectionGeneralInformationsComponent
  extends PoliticalBusinessGeneralInformationsComponent<MajorityElection>
  implements OnInit
{
  public mandateAlgorithms: EnumItemDescription<MajorityElectionMandateAlgorithm>[] = [];

  constructor() {
    super(newMajorityElection());
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
