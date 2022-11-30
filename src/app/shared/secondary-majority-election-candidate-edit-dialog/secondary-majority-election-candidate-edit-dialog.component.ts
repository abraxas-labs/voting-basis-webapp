/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/language.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { MajorityElectionCandidate, newMajorityElectionCandidate } from '../../core/models/majority-election.model';
import {
  MajorityElectionCandidateReference,
  SecondaryMajorityElection,
  SecondaryMajorityElectionAllowedCandidates,
  SecondaryMajorityElectionCandidate,
} from '../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';

@Component({
  selector: 'app-secondary-majority-election-candidate-edit-dialog',
  templateUrl: './secondary-majority-election-candidate-edit-dialog.component.html',
  styleUrls: ['./secondary-majority-election-candidate-edit-dialog.component.scss'],
})
export class SecondaryMajorityElectionCandidateEditDialogComponent implements OnInit {
  public allowedCandidateTypes: typeof SecondaryMajorityElectionAllowedCandidates = SecondaryMajorityElectionAllowedCandidates;
  public candidate: SecondaryMajorityElectionCandidate;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public saving: boolean = false;
  public loading: boolean = false;
  public selectCandidateFromPrimaryElection: boolean = false;
  public secondaryMajorityElection: SecondaryMajorityElection;
  public majorityElectionCandidates: (MajorityElectionCandidate & { displayName: string })[] = [];
  public selectedMajorityElectionCandidate: MajorityElectionCandidate & { displayName: string };

  constructor(
    private readonly dialogRef: MatDialogRef<SecondaryMajorityElectionCandidateEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    @Inject(MAT_DIALOG_DATA) dialogData: SecondaryMajorityElectionCandidateEditDialogData,
  ) {
    this.candidate = dialogData.candidate;
    this.secondaryMajorityElection = dialogData.secondaryMajorityElection;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.candidate.id;

    if (
      this.secondaryMajorityElection.allowedCandidates ===
        this.allowedCandidateTypes.SECONDARY_MAJORITY_ELECTION_ALLOWED_CANDIDATES_MUST_EXIST_IN_PRIMARY_ELECTION ||
      this.candidate.isReferenced
    ) {
      this.selectCandidateFromPrimaryElection = true;
    }
    this.selectedMajorityElectionCandidate = { ...newMajorityElectionCandidate(-1, ''), displayName: '' };
  }

  public get canSave(): boolean {
    if (
      this.secondaryMajorityElection.allowedCandidates ===
        this.allowedCandidateTypes.SECONDARY_MAJORITY_ELECTION_ALLOWED_CANDIDATES_MUST_NOT_EXIST_IN_PRIMARY_ELECTION &&
      this.majorityElectionCandidates.some(
        c =>
          c.firstName === this.candidate.firstName &&
          c.lastName === this.candidate.lastName &&
          c.dateOfBirth !== undefined &&
          c.dateOfBirth.toDateString() === this.candidate.dateOfBirth?.toDateString(),
      )
    ) {
      return false;
    }

    if (this.selectCandidateFromPrimaryElection && !!this.selectedMajorityElectionCandidate.id) {
      return true;
    }

    return (
      !!this.candidate &&
      !!this.candidate.number &&
      !!this.candidate.firstName &&
      !!this.candidate.lastName &&
      isValidDateOfBirth(this.candidate.dateOfBirth) &&
      !!this.candidate.locality &&
      LanguageService.allLanguagesPresent(this.candidate.party) &&
      this.candidate.sex !== undefined
    );
  }

  public async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      const primaryMajorityElectionId = this.secondaryMajorityElection.primaryMajorityElectionId;
      const majorityElectionCandidates = await this.majorityElectionService.listCandidates(primaryMajorityElectionId);
      this.majorityElectionCandidates = majorityElectionCandidates.map(c => ({
        ...c,
        displayName: `${c.number} - ${c.lastName} ${c.firstName}`,
      }));

      const referencedCandidateId = this.candidate.referencedCandidateId;
      if (!!referencedCandidateId) {
        const referencedCandidate = this.majorityElectionCandidates.find(c => c.id === referencedCandidateId);
        if (referencedCandidate) {
          this.selectedMajorityElectionCandidate = referencedCandidate;
        }
      }

      if (
        this.isNew &&
        this.secondaryMajorityElection.allowedCandidates !==
          this.allowedCandidateTypes.SECONDARY_MAJORITY_ELECTION_ALLOWED_CANDIDATES_MUST_NOT_EXIST_IN_PRIMARY_ELECTION
      ) {
        // already referenced candidates cannot be chosen again, removing them here
        const existingCandidates = await this.secondaryMajorityElectionService.listCandidates(this.secondaryMajorityElection.id);
        this.majorityElectionCandidates = this.majorityElectionCandidates.filter(c =>
          existingCandidates.every(ec => ec.referencedCandidateId !== c.id),
        );
      }
    } finally {
      this.loading = false;
    }
  }

  public async save(): Promise<void> {
    if (!this.canSave) {
      return;
    }

    try {
      this.saving = true;

      if (this.selectCandidateFromPrimaryElection) {
        await this.saveCandidateReference();
      } else {
        await this.saveCandidate();
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: SecondaryMajorityElectionCandidateEditDialogResult = {
        candidate: this.candidate,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private async saveCandidate(): Promise<void> {
    if (!this.candidate.politicalFirstName) {
      this.candidate.politicalFirstName = this.candidate.firstName;
    }
    if (!this.candidate.politicalLastName) {
      this.candidate.politicalLastName = this.candidate.lastName;
    }

    if (this.isNew) {
      this.candidate.id = await this.secondaryMajorityElectionService.createCandidate(this.candidate);
    } else {
      await this.secondaryMajorityElectionService.updateCandidate(this.candidate);
    }
  }

  private async saveCandidateReference(): Promise<void> {
    const candidateReference: MajorityElectionCandidateReference = {
      id: this.candidate.id,
      candidateId: this.selectedMajorityElectionCandidate.id,
      secondaryMajorityElectionId: this.secondaryMajorityElection.id,
      incumbent: this.selectedMajorityElectionCandidate.incumbent,
      position: this.candidate.position,
    };

    if (this.isNew) {
      const createdReferenceId = await this.secondaryMajorityElectionService.createCandidateReference(candidateReference);
      this.candidate = {
        ...this.selectedMajorityElectionCandidate,
        ...candidateReference,
        id: createdReferenceId,
        isReferenced: true,
        referencedCandidateId: this.selectedMajorityElectionCandidate.id,
      };
    } else {
      await this.secondaryMajorityElectionService.updateCandidateReference(candidateReference);
      this.candidate = {
        ...this.selectedMajorityElectionCandidate,
        ...candidateReference,
        isReferenced: true,
        referencedCandidateId: this.selectedMajorityElectionCandidate.id,
      };
    }
  }
}

export interface SecondaryMajorityElectionCandidateEditDialogData {
  candidate: SecondaryMajorityElectionCandidate;
  secondaryMajorityElection: SecondaryMajorityElection;
  testingPhaseEnded: boolean;
}

export interface SecondaryMajorityElectionCandidateEditDialogResult {
  candidate: SecondaryMajorityElectionCandidate;
}
