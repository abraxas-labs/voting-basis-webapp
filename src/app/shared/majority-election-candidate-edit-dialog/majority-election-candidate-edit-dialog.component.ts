/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/language.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { MajorityElectionCandidate } from '../../core/models/majority-election.model';
import { SexType } from '../../core/models/sex-type.model';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';
import { isCommunalDoiType } from '../../core/utils/domain-of-influence.utils';

@Component({
  selector: 'app-majority-election-candidate-edit-dialog',
  templateUrl: './majority-election-candidate-edit-dialog.component.html',
  styleUrls: ['./majority-election-candidate-edit-dialog.component.scss'],
})
export class MajorityElectionCandidateEditDialogComponent {
  public data: MajorityElectionCandidate;
  public isNew: boolean = false;
  public saving: boolean = false;
  public testingPhaseEnded: boolean;
  public sexTypes: EnumItemDescription<SexType>[] = [];
  public isCommunalDoiType: boolean;

  constructor(
    private readonly dialogRef: MatDialogRef<MajorityElectionCandidateEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly majorityElectionService: MajorityElectionService,
    @Inject(MAT_DIALOG_DATA) dialogData: MajorityElectionCandidateEditDialogData,
  ) {
    this.data = dialogData.candidate;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.data.id;
    this.isCommunalDoiType = isCommunalDoiType(dialogData.doiType);
  }

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.number &&
      !!this.data.firstName &&
      !!this.data.lastName &&
      isValidDateOfBirth(this.data.dateOfBirth) &&
      (this.isCommunalDoiType || !!this.data.locality) &&
      LanguageService.allLanguagesPresent(this.data.party) &&
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

    try {
      this.saving = true;

      if (this.isNew) {
        this.data.id = await this.majorityElectionService.createCandidate(this.data);
      } else {
        await this.majorityElectionService.updateCandidate(this.data);
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: MajorityElectionCandidateEditDialogResult = {
        candidate: this.data,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface MajorityElectionCandidateEditDialogData {
  candidate: MajorityElectionCandidate;
  testingPhaseEnded: boolean;
  doiType: DomainOfInfluenceType;
}

export interface MajorityElectionCandidateEditDialogResult {
  candidate: MajorityElectionCandidate;
}
