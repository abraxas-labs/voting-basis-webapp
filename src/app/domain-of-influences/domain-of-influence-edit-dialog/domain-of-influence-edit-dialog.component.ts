/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Tenant } from '@abraxas/base-components';
import { AsyncInputValidators, DialogService, EnumItemDescription, EnumUtil, InputValidators, SnackbarService } from '@abraxas/voting-lib';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluence, DomainOfInfluenceCanton, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { PermissionService } from '../../core/permission.service';
import { isDistinct } from '../../core/utils/array.utils';
import { Permissions } from '../../core/models/permissions.model';
import { Subscription } from 'rxjs';
import { cloneDeep, isEqual } from 'lodash';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { isCommunalDoiType } from '../../core/utils/domain-of-influence.utils';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ContactPersonForm } from '../../shared/contact-person-edit/contact-person-edit.component';
import { CantonSettingsService } from '../../core/canton-settings.service';

@Component({
  selector: 'app-domain-of-influence-edit-dialog',
  templateUrl: './domain-of-influence-edit-dialog.component.html',
  styleUrls: ['./domain-of-influence-edit-dialog.component.scss'],
  standalone: false,
})
export class DomainOfInfluenceEditDialogComponent implements OnInit, OnDestroy {
  public readonly knownDomainOfInfluenceTypes: typeof DomainOfInfluenceType = DomainOfInfluenceType;

  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }
  @HostListener('window:keyup.esc')
  public async keyUpEscape(): Promise<void> {
    await this.closeWithUnsavedChangesCheck();
  }

  public data: DomainOfInfluence;
  public parentType?: DomainOfInfluenceType;
  public isNew: boolean = false;

  public domainOfInfluenceTypes: EnumItemDescription<DomainOfInfluenceType>[] = [];
  public domainOfInfluenceCantons: EnumItemDescription<DomainOfInfluenceCanton>[] = [];

  public logoChanged: boolean = false;
  public updatedLogo?: File;
  public selectedTenant?: Tenant;
  public saving: boolean = false;
  public canEditEverything: boolean = false;
  public readonly readonly: boolean;

  public hasChanges: boolean = false;
  public originalDomainOfInfluence: DomainOfInfluence;
  public originalSecureConnectId?: string;
  public readonly backdropClickSubscription: Subscription;
  public showInternalPlausibilisation: boolean = false;
  public hasOtherSuperiorAuthorityDomainOfInfluence: boolean = false;
  public availableSuperiorAuthorityDomainOfInfluences: DomainOfInfluence[] = [];
  public domainOfInfluencePublishResultsOptionEnabled: boolean = false;
  public showPublishResults: boolean = false;
  public form!: FormGroup<Form>;

  constructor(
    private readonly dialogRef: MatDialogRef<DomainOfInfluenceEditDialogData>,
    private readonly permissionService: PermissionService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly i18n: TranslateService,
    private readonly enumUtil: EnumUtil,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
    private readonly formBuilder: NonNullableFormBuilder,
    private readonly cantonSettingsService: CantonSettingsService,
    @Inject(MAT_DIALOG_DATA) dialogData: DomainOfInfluenceEditDialogData,
  ) {
    this.data = dialogData.domainOfInfluence;
    this.data.parentId = dialogData.parent?.id || '';
    this.parentType = dialogData.parent?.type;
    this.readonly = dialogData.readonly;
    this.availableSuperiorAuthorityDomainOfInfluences = dialogData.availableSuperiorAuthorityDomainOfInfluences;

    // Set superior authority before cloning, so that hasChanges won't show a false positive when saving unchanged.
    if (this.data.superiorAuthorityDomainOfInfluence) {
      this.data.superiorAuthorityDomainOfInfluence =
        this.availableSuperiorAuthorityDomainOfInfluences.find(doi => doi.id == this.data.superiorAuthorityDomainOfInfluence?.id) ||
        this.data.superiorAuthorityDomainOfInfluence;
    }

    this.originalDomainOfInfluence = cloneDeep(this.data);
    this.hasOtherSuperiorAuthorityDomainOfInfluence = !!this.data.superiorAuthorityDomainOfInfluence;

    this.dialogRef.disableClose = true;
    this.backdropClickSubscription = this.dialogRef.backdropClick().subscribe(async () => this.closeWithUnsavedChangesCheck());
    this.buildForm();
  }

  public ngOnDestroy(): void {
    this.backdropClickSubscription.unsubscribe();
  }

  public get canSave(): boolean {
    return (
      this.form.valid &&
      !!this.data &&
      !!this.data.name &&
      !!this.data.type &&
      (this.data.type !== DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU || !!this.data.bfs) &&
      !!this.selectedTenant &&
      !!this.selectedTenant.id &&
      (!!this.data.parentId || !!this.data.canton) &&
      this.data.exportConfigurationsList.every(e => !!e.description && !!e.eaiMessageType && !!e.provider) &&
      (!this.hasOtherSuperiorAuthorityDomainOfInfluence || !!this.data.superiorAuthorityDomainOfInfluence) &&
      (!this.data.responsibleForVotingCards ||
        (!!this.data.printData &&
          !!this.data.printData.shippingAway &&
          !!this.data.printData.shippingMethod &&
          !!this.data.printData.shippingReturn &&
          !!this.data.returnAddress &&
          !!this.data.returnAddress.addressLine1 &&
          !!this.data.returnAddress.street &&
          !!this.data.returnAddress.city &&
          !!this.data.returnAddress.country &&
          !!this.data.returnAddress.zipCode &&
          !!this.data.swissPostData &&
          !!this.data.swissPostData.invoiceReferenceNumber &&
          !!this.data.swissPostData.frankingLicenceAwayNumber &&
          !!this.data.swissPostData.frankingLicenceReturnNumber)) &&
      !(!this.data.responsibleForVotingCards && this.data.electoralRegistrationEnabled) &&
      !(!this.data.electoralRegistrationEnabled && this.data.electoralRegisterMultipleEnabled) &&
      (!this.showInternalPlausibilisation ||
        (!!this.data.plausibilisationConfiguration &&
          this.data.plausibilisationConfiguration.comparisonVoterParticipationConfigurationsList.every(
            x =>
              (!x.thresholdPercent || x.thresholdPercent >= 0) &&
              x.mainLevel > DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_UNSPECIFIED &&
              x.comparisonLevel > DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_UNSPECIFIED,
          ) &&
          isDistinct(
            this.data.plausibilisationConfiguration.comparisonVoterParticipationConfigurationsList,
            x => +x.mainLevel + ':' + x.comparisonLevel,
          ) &&
          this.data.plausibilisationConfiguration.comparisonCountOfVotersConfigurationsList.every(
            x => !x.thresholdPercent || x.thresholdPercent >= 0,
          ) &&
          this.data.plausibilisationConfiguration.comparisonVotingChannelConfigurationsList.every(
            x => !x.thresholdPercent || x.thresholdPercent >= 0,
          ) &&
          (!this.data.plausibilisationConfiguration.comparisonValidVotingCardsWithAccountedBallotsThresholdPercent ||
            this.data.plausibilisationConfiguration.comparisonValidVotingCardsWithAccountedBallotsThresholdPercent >= 0)))
    );
  }

  public async ngOnInit(): Promise<void> {
    this.isNew = !this.data.id;
    this.canEditEverything = await this.permissionService.hasPermission(Permissions.DomainOfInfluence.UpdateSameCanton);
    this.initDomainOfInfluenceTypes();
    this.initDomainOfInfluenceCantons();

    if (this.data.secureConnectId) {
      this.selectedTenant = { id: this.data.secureConnectId, name: this.data.authorityName } as Tenant;
      this.originalSecureConnectId = this.data.secureConnectId;
    }

    if (!!this.data.parentId) {
      this.data.virtualTopLevel = false;
    }

    await this.loadCantonDefaults();
    this.resetInternalPlausibilisation();
    this.refreshShowPublishResults();
  }

  public updateDomainOfInfluenceType(type: DomainOfInfluenceType): void {
    this.data.type = type;
    this.refreshShowPublishResults();
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave || !this.selectedTenant) {
      return;
    }

    if (
      this.data.type < this.knownDomainOfInfluenceTypes.DOMAIN_OF_INFLUENCE_TYPE_MU ||
      !this.domainOfInfluencePublishResultsOptionEnabled
    ) {
      this.data.publishResultsDisabled = false;
    }

    if (!this.canEditEverything) {
      await this.updateAsElectionAdmin();
      return;
    }

    try {
      this.saving = true;
      this.data.secureConnectId = this.selectedTenant.id;
      this.data.authorityName = this.selectedTenant.name;

      const requestData: DomainOfInfluence = {
        ...this.data,
        printData: this.data.responsibleForVotingCards ? this.data.printData : undefined,
        returnAddress: this.data.responsibleForVotingCards ? this.data.returnAddress : undefined,
        swissPostData: this.data.responsibleForVotingCards ? this.data.swissPostData : undefined,
      };

      if (this.isNew) {
        this.data.id = await this.domainOfInfluenceService.create(requestData);
      } else {
        await this.domainOfInfluenceService.updateForAdmin(requestData);
      }

      if (this.logoChanged) {
        await this.updateLogo();
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.hasChanges = false;
      this.dialogRef.close({
        domainOfInfluence: this.data,
      } as DomainOfInfluenceEditDialogResult);
    } finally {
      this.saving = false;
      this.logoChanged = false;
      delete this.updatedLogo;
    }
  }

  public async closeWithUnsavedChangesCheck(): Promise<void> {
    if (await this.leaveDialogOpen()) {
      return;
    }

    this.dialogRef.close();
  }

  public contentChanged(): void {
    this.hasChanges =
      !isEqual(this.data, this.originalDomainOfInfluence) ||
      !isEqual(this.selectedTenant?.id, this.originalSecureConnectId) ||
      this.logoChanged;
  }

  public updateHasOtherSuperiorAuthorityDomainOfInfluence(checked: boolean) {
    this.hasOtherSuperiorAuthorityDomainOfInfluence = checked;

    if (!checked) {
      this.data.superiorAuthorityDomainOfInfluence = undefined;
    }
  }

  // currently necessary since not all values are in the reactive form
  public updateContactPerson(): void {
    this.data.contactPerson = this.form.getRawValue().contactPerson;
  }

  private async leaveDialogOpen(): Promise<boolean> {
    return this.hasChanges && !(await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES'));
  }

  private async updateAsElectionAdmin(): Promise<void> {
    try {
      this.saving = true;

      await this.domainOfInfluenceService.updateForElectionAdmin(this.data);

      if (this.logoChanged) {
        await this.updateLogo();
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.dialogRef.close({
        domainOfInfluence: this.data,
      } as DomainOfInfluenceEditDialogResult);
    } finally {
      this.saving = false;
    }
  }

  private initDomainOfInfluenceTypes(): void {
    const parentType = this.parentType;
    const domainOfInfluenceTypes = this.enumUtil.getArrayWithDescriptions<DomainOfInfluenceType>(
      DomainOfInfluenceType,
      'DOMAIN_OF_INFLUENCE.SHORT_TYPES.',
    );

    // If no parent or parent isn't political, we do not restrict anything
    if (!parentType || parentType >= DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SC) {
      this.domainOfInfluenceTypes = domainOfInfluenceTypes;
      return;
    }

    this.domainOfInfluenceTypes = domainOfInfluenceTypes.filter(dit => dit.value >= parentType);
  }

  private initDomainOfInfluenceCantons(): void {
    if (!!this.data.parentId) {
      return;
    }

    this.domainOfInfluenceCantons = this.enumUtil.getArrayWithDescriptions<DomainOfInfluenceCanton>(
      DomainOfInfluenceCanton,
      'DOMAIN_OF_INFLUENCE_CANTONS.',
    );
  }

  private async updateLogo(): Promise<void> {
    if (!this.updatedLogo) {
      await this.domainOfInfluenceService.deleteLogo(this.data.id);
      return;
    }

    try {
      await this.domainOfInfluenceService.updateLogo(this.data.id, this.updatedLogo);
    } finally {
      this.logoChanged = false;
      delete this.updatedLogo;
    }
  }

  private async loadCantonDefaults(): Promise<void> {
    if (this.data.id) {
      const cantonDefaults = await this.domainOfInfluenceService.getCantonDefaults(this.data.id);
      this.setCantonDefaults(cantonDefaults);
    } else {
      const domainOfInfluences = await this.domainOfInfluenceService.listForCurrentTenant();

      // take first domain of influence since all domain of influences of a tenant should be in the same canton.
      // if no domain of influence exists, we take the first accessible canton settings as reference.
      const cantonDefaults =
        domainOfInfluences.length > 0
          ? await this.domainOfInfluenceService.getCantonDefaults(domainOfInfluences[0].id)
          : await this.cantonSettingsService.getCantonDefaults();

      if (!cantonDefaults) {
        return;
      }

      this.setCantonDefaults(cantonDefaults);
    }
  }

  private setCantonDefaults(cantonDefaults: DomainOfInfluenceCantonDefaults) {
    this.showInternalPlausibilisation = !cantonDefaults.internalPlausibilisationDisabled;
    this.domainOfInfluencePublishResultsOptionEnabled = cantonDefaults.domainOfInfluencePublishResultsOptionEnabled;
  }

  private resetInternalPlausibilisation(): void {
    if (this.showInternalPlausibilisation) {
      return;
    }

    this.data.plausibilisationConfiguration = undefined;
  }

  private refreshShowPublishResults(): void {
    this.showPublishResults = this.domainOfInfluencePublishResultsOptionEnabled && isCommunalDoiType(this.data.type);
  }

  private buildForm(): void {
    this.form = this.formBuilder.group<Form>({
      name: this.formBuilder.control(this.data.name, {
        validators: [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
        asyncValidators: [AsyncInputValidators.simpleSlText],
      }),
      shortName: this.formBuilder.control(this.data.shortName, {
        validators: [Validators.minLength(1), Validators.maxLength(50)],
        asyncValidators: [AsyncInputValidators.simpleSlText],
      }),
      nameForProtocol: this.formBuilder.control(this.data.nameForProtocol, {
        validators: [Validators.maxLength(100)],
        asyncValidators: [AsyncInputValidators.complexSlText],
      }),
      bfs: this.formBuilder.control(this.data.bfs, {
        validators: [Validators.minLength(1), Validators.maxLength(8), InputValidators.alphaNumWhite],
      }),
      code: this.formBuilder.control(this.data.code, {
        validators: [Validators.minLength(1), Validators.maxLength(20)],
        asyncValidators: [AsyncInputValidators.simpleSlText],
      }),
      sortNumber: this.formBuilder.control(this.data.sortNumber, {
        validators: [Validators.min(0), Validators.max(1000)],
      }),
      contactPerson: this.formBuilder.group({
        familyName: this.formBuilder.control(this.data.contactPerson!.familyName, {
          validators: [Validators.minLength(1), Validators.maxLength(50)],
          asyncValidators: [AsyncInputValidators.complexSlText],
        }),
        firstName: this.formBuilder.control(this.data.contactPerson!.firstName, {
          validators: [Validators.minLength(1), Validators.maxLength(50)],
          asyncValidators: [AsyncInputValidators.complexSlText],
        }),
        phone: this.formBuilder.control(this.data.contactPerson!.phone, {
          validators: [InputValidators.phone],
        }),
        mobilePhone: this.formBuilder.control(this.data.contactPerson!.mobilePhone, {
          validators: [InputValidators.phone],
        }),
        email: this.formBuilder.control(this.data.contactPerson!.email, {
          validators: [Validators.email],
        }),
      }),
      eCollectingMinSignatureCount: this.formBuilder.control(this.data.eCollectingMinSignatureCount, {
        validators: [Validators.min(0), Validators.max(100000)],
      }),
      eCollectingMaxElectronicSignaturePercent: this.formBuilder.control(this.data.eCollectingMaxElectronicSignaturePercent, {
        validators: [Validators.min(0), Validators.max(100)],
      }),
    });
  }
}

export interface DomainOfInfluenceEditDialogData {
  domainOfInfluence: DomainOfInfluence;
  parent?: DomainOfInfluence;
  readonly: boolean;
  availableSuperiorAuthorityDomainOfInfluences: DomainOfInfluence[];
}

export interface DomainOfInfluenceEditDialogResult {
  domainOfInfluence: DomainOfInfluence;
}

export interface Form {
  name: FormControl<string>;
  shortName: FormControl<string>;
  nameForProtocol: FormControl<string>;
  bfs: FormControl<string>;
  code: FormControl<string>;
  sortNumber: FormControl<number>;
  contactPerson: FormGroup<ContactPersonForm>;
  eCollectingMinSignatureCount: FormControl<number>;
  eCollectingMaxElectronicSignaturePercent: FormControl<number>;
}
