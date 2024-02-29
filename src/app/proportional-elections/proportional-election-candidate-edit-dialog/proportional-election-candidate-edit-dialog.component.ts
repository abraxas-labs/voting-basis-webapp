/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { ProportionalElectionCandidate } from '../../core/models/proportional-election.model';
import { SexType } from '../../core/models/sex-type.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';
import { isCommunalDoiType } from '../../core/utils/domain-of-influence.utils';
import { GetTranslationPipe } from '../../shared/get-translation.pipe';

@Component({
  selector: 'app-proportional-election-candidate-edit-dialog',
  templateUrl: './proportional-election-candidate-edit-dialog.component.html',
  styleUrls: ['./proportional-election-candidate-edit-dialog.component.scss'],
  providers: [GetTranslationPipe],
})
export class ProportionalElectionCandidateEditDialogComponent {
  public data: ProportionalElectionCandidate;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public saving: boolean = false;
  public sexTypes: EnumItemDescription<SexType>[] = [];
  public parties: DomainOfInfluencePartyDropdownData[] = [];
  public selectedPartyId?: string;
  public isCommunalDoiType: boolean;

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionCandidateEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly enumUtil: EnumUtil,
    private readonly snackbarService: SnackbarService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly getTranslationPipe: GetTranslationPipe,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionCandidateEditDialogData,
  ) {
    this.data = dialogData.candidate;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.data.id;

    this.sexTypes = this.enumUtil.getArrayWithDescriptions<SexType>(SexType, 'SEX_TYPE.');
    this.initPartiesDropdownData(dialogData.parties);

    this.isCommunalDoiType = isCommunalDoiType(dialogData.doiType);
  }

  public set dateOfBirth(value: string) {
    if (!value) {
      return;
    }

    this.data.dateOfBirth = new Date(value);
  }

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.number &&
      !!this.data.firstName &&
      !!this.data.lastName &&
      this.isDateOfBirthValid() &&
      (this.isCommunalDoiType || !!this.data.locality) &&
      !!this.selectedPartyId &&
      this.data.sex !== undefined &&
      (this.isCommunalDoiType || !!this.data.origin)
    );
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    if (!this.data.politicalFirstName) {
      this.data.politicalFirstName = this.data.firstName;
    }
    if (!this.data.politicalLastName) {
      this.data.politicalLastName = this.data.lastName;
    }

    const selectedParty = this.parties.find(x => x.id === this.selectedPartyId);
    if (!selectedParty) {
      return;
    }

    this.data.party = selectedParty;

    try {
      this.saving = true;

      if (this.isNew) {
        this.data = { ...this.data, ...(await this.proportionalElectionService.createCandidate(this.data)) };
      } else {
        this.data = { ...this.data, ...(await this.proportionalElectionService.updateCandidate(this.data)) };
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: ProportionalElectionCandidateEditDialogResult = {
        candidate: this.data,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public isDateOfBirthValid(): boolean {
    return isValidDateOfBirth(this.data.dateOfBirth);
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private initPartiesDropdownData(parties: DomainOfInfluenceParty[]): void {
    this.parties = parties.map(p => this.mapPartyToDropdownData(p));

    if (!this.data.party?.id) {
      return;
    }

    const candidateParty = this.mapPartyToDropdownData(this.data.party);
    const hasCandidateParty = !!this.parties.find(p => p.id === candidateParty.id);

    this.selectedPartyId = candidateParty.id;

    if (hasCandidateParty) {
      return;
    }

    // it could be that the candidate has a soft deleted party, which isn't included in the default party list
    // but should be updateable as well.
    this.parties = [candidateParty, ...this.parties];
  }

  private mapPartyToDropdownData(party: DomainOfInfluenceParty): DomainOfInfluencePartyDropdownData {
    return {
      ...party,
      shortDescriptionTranslated: this.getTranslationPipe.transform(party.shortDescription),
    };
  }
}

interface DomainOfInfluencePartyDropdownData extends DomainOfInfluenceParty {
  shortDescriptionTranslated: string;
}

export interface ProportionalElectionCandidateEditDialogData {
  candidate: ProportionalElectionCandidate;
  testingPhaseEnded: boolean;
  parties: DomainOfInfluenceParty[];
  doiType: DomainOfInfluenceType;
}

export interface ProportionalElectionCandidateEditDialogResult {
  candidate: ProportionalElectionCandidate;
}
