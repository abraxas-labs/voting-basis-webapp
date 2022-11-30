/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageService } from '../../core/language.service';
import { PoliticalBusiness, PoliticalBusinessType } from '../../core/models/political-business.model';
import { newSecondaryElection, SecondaryElection } from '../../core/models/secondary-election.model';

@Component({
  selector: 'app-secondary-majority-election-create-dialog',
  templateUrl: './secondary-majority-election-create-dialog.component.html',
})
export class SecondaryMajorityElectionCreateDialogComponent {
  public electionTypes: EnumItemDescription<PoliticalBusinessType>[] = [];
  public primaryElections: Map<string, string> = new Map<string, string>();
  public secondaryElection: SecondaryElection = newSecondaryElection();

  constructor(
    private readonly dialogRef: MatDialogRef<SecondaryMajorityElectionCreateDialogComponent>,
    private readonly enumUtil: EnumUtil,
    languageService: LanguageService,
    @Inject(MAT_DIALOG_DATA) dialogData: SecondaryElectionCreateDialogData,
  ) {
    this.electionTypes = this.enumUtil
      .getArrayWithDescriptions<PoliticalBusinessType>(PoliticalBusinessType, 'POLITICAL_BUSINESS.TYPE.')
      .filter(e => e.value === PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION);

    const possiblePrimaryElections = dialogData.possiblePrimaryElections.filter(
      pb => pb.politicalBusinessType === PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION,
    );
    for (const election of possiblePrimaryElections) {
      this.primaryElections.set(election.id, languageService.getTranslationForCurrentLang(election.shortDescription));
    }
  }

  public get canSave(): boolean {
    return !!this.secondaryElection.primaryElectionId && this.secondaryElection.type !== undefined;
  }

  public async save(): Promise<void> {
    const result: SecondaryElectionCreateDialogResult = {
      secondaryElection: this.secondaryElection,
    };
    this.dialogRef.close(result);
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface SecondaryElectionCreateDialogData {
  possiblePrimaryElections: PoliticalBusiness[];
}

export interface SecondaryElectionCreateDialogResult {
  secondaryElection: SecondaryElection;
}
