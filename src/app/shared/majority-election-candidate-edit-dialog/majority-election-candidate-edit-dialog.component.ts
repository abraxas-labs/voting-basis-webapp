/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, HostListener, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/language.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { MajorityElectionCandidate } from '../../core/models/majority-election.model';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';
import { isCommunalDoiType } from '../../core/utils/domain-of-influence.utils';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';

@Component({
  selector: 'app-majority-election-candidate-edit-dialog',
  templateUrl: './majority-election-candidate-edit-dialog.component.html',
  styleUrls: ['./majority-election-candidate-edit-dialog.component.scss'],
})
export class MajorityElectionCandidateEditDialogComponent implements OnDestroy {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  public data: MajorityElectionCandidate;
  public isNew: boolean = false;
  public saving: boolean = false;
  public testingPhaseEnded: boolean;
  public isCandidateLocalityRequired: boolean;
  public isCandidateOriginRequired: boolean;

  public hasChanges: boolean = false;
  public originalCandidate: MajorityElectionCandidate;
  public readonly backdropClickSubscription: Subscription;

  constructor(
    private readonly dialogRef: MatDialogRef<MajorityElectionCandidateEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly dialogService: DialogService,
    @Inject(MAT_DIALOG_DATA) dialogData: MajorityElectionCandidateEditDialogData,
  ) {
    this.data = dialogData.candidate;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.data.id;
    this.isCandidateLocalityRequired = dialogData.candidateLocalityRequired && !isCommunalDoiType(dialogData.doiType);
    this.isCandidateOriginRequired = dialogData.candidateOriginRequired && !isCommunalDoiType(dialogData.doiType);
    this.originalCandidate = cloneDeep(this.data);

    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
  }

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.number &&
      !!this.data.firstName &&
      !!this.data.lastName &&
      isValidDateOfBirth(this.data.dateOfBirth) &&
      (!this.isCandidateLocalityRequired || !!this.data.locality) &&
      LanguageService.allLanguagesPresent(this.data.party) &&
      this.data.sex !== undefined &&
      (!this.isCandidateOriginRequired || !!this.data.origin)
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
      this.hasChanges = false;
      const result: MajorityElectionCandidateEditDialogResult = {
        candidate: this.data,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public async closeWithUnsavedChangesCheck(): Promise<void> {
    if (await this.leaveDialogOpen()) {
      return;
    }

    this.dialogRef.close();
  }

  public contentChanged(): void {
    this.hasChanges = !isEqual(this.data, this.originalCandidate);
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }
}

export interface MajorityElectionCandidateEditDialogData {
  candidate: MajorityElectionCandidate;
  testingPhaseEnded: boolean;
  doiType: DomainOfInfluenceType;
  candidateLocalityRequired: boolean;
  candidateOriginRequired: boolean;
}

export interface MajorityElectionCandidateEditDialogResult {
  candidate: MajorityElectionCandidate;
}
