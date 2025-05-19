/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { ProportionalElectionCandidate } from '../../core/models/proportional-election.model';
import { SexType } from '../../core/models/sex-type.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';
import { isCommunalDoiType } from '../../core/utils/domain-of-influence.utils';
import { GetTranslationPipe } from '../../shared/get-translation.pipe';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';
import { Country } from '../../core/models/country.model';
import { CountryService } from '../../core/country.service';

@Component({
  selector: 'app-proportional-election-candidate-edit-dialog',
  templateUrl: './proportional-election-candidate-edit-dialog.component.html',
  styleUrls: ['./proportional-election-candidate-edit-dialog.component.scss'],
  providers: [GetTranslationPipe],
  standalone: false,
})
export class ProportionalElectionCandidateEditDialogComponent implements OnInit, OnDestroy {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  public data: ProportionalElectionCandidate;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public saving: boolean = false;
  public sexTypes: EnumItemDescription<SexType>[] = [];
  public parties: DomainOfInfluencePartyDropdownData[] = [];
  public selectedPartyId?: string;
  public isCandidateLocalityRequired: boolean = false;
  public isCandidateOriginRequired: boolean = false;
  public hideOccupationTitle: boolean = false;
  public countries: Country[] = [];

  public hasChanges: boolean = false;
  public originalCandidate: ProportionalElectionCandidate;
  public readonly backdropClickSubscription: Subscription;

  constructor(
    private readonly dialogRef: MatDialogRef<ProportionalElectionCandidateEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly enumUtil: EnumUtil,
    private readonly snackbarService: SnackbarService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly getTranslationPipe: GetTranslationPipe,
    private readonly dialogService: DialogService,
    private readonly countryService: CountryService,
    @Inject(MAT_DIALOG_DATA) dialogData: ProportionalElectionCandidateEditDialogData,
  ) {
    this.data = dialogData.candidate;
    this.testingPhaseEnded = dialogData.testingPhaseEnded;
    this.isNew = !this.data.id;

    this.sexTypes = this.enumUtil.getArrayWithDescriptions<SexType>(SexType, 'SEX_TYPE.').filter(
      // deprecated values
      p => p.value !== SexType.SEX_TYPE_UNDEFINED,
    );
    this.initPartiesDropdownData(dialogData.parties, dialogData.listParty);

    this.isCandidateLocalityRequired = dialogData.candidateLocalityRequired && !isCommunalDoiType(dialogData.doiType);
    this.isCandidateOriginRequired = dialogData.candidateOriginRequired && !isCommunalDoiType(dialogData.doiType);
    this.hideOccupationTitle = dialogData.hideOccupationTitle;
    this.originalCandidate = cloneDeep(this.data);

    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
  }

  public async ngOnInit(): Promise<void> {
    this.countries = await this.countryService.list();
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
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
      (!this.isCandidateLocalityRequired || !!this.data.locality) &&
      !!this.selectedPartyId &&
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
      this.hasChanges = false;
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

  private initPartiesDropdownData(parties: DomainOfInfluenceParty[], listParty?: DomainOfInfluenceParty): void {
    this.parties = parties.map(p => this.mapPartyToDropdownData(p));

    if (this.isNew && listParty) {
      this.selectedPartyId = listParty.id;
    }

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
  listParty?: DomainOfInfluenceParty;
  candidateLocalityRequired: boolean;
  candidateOriginRequired: boolean;
  hideOccupationTitle: boolean;
}

export interface ProportionalElectionCandidateEditDialogResult {
  candidate: ProportionalElectionCandidate;
}
