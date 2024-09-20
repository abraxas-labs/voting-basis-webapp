/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input, QueryList, ViewChildren } from '@angular/core';
import { ContestImport, MajorityElectionImport, ProportionalElectionImport, VoteImport } from '../../../core/models/import.model';
import { ImportPoliticalBusinessEditComponent } from '../import-political-business-edit/import-political-business-edit.component';

@Component({
  selector: 'app-import-political-businesses',
  templateUrl: './import-political-businesses.component.html',
  styleUrls: ['./import-political-businesses.component.scss'],
})
export class ImportPoliticalBusinessesComponent {
  public majorityElections: MajorityElectionImport[] = [];
  public proportionalElections: ProportionalElectionImport[] = [];
  public votes: VoteImport[] = [];
  public allValid: boolean = false;

  @ViewChildren('editComponent')
  public politicalBusinessEditComponents!: QueryList<ImportPoliticalBusinessEditComponent<any>>;

  @Input()
  public contestDomainOfInfluenceId: string = '';

  @Input()
  public set contestImport(contestImport: ContestImport) {
    this.majorityElections = contestImport.getMajorityElectionsList();
    this.proportionalElections = contestImport.getProportionalElectionsList();
    this.votes = contestImport.getVotesList();
  }

  public checkAllValid(): void {
    for (const editComponent of this.politicalBusinessEditComponents.toArray()) {
      if (!editComponent.isValid) {
        return;
      }
    }

    this.allValid = true;
  }
}
