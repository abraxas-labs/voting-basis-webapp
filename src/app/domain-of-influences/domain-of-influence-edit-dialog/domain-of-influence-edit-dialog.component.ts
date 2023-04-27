/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Tenant } from '@abraxas/base-components';
import { EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluence, DomainOfInfluenceCanton, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { RolesService } from '../../core/roles.service';
import { isDistinct } from '../../core/utils/array.utils';

@Component({
  selector: 'app-domain-of-influence-edit-dialog',
  templateUrl: './domain-of-influence-edit-dialog.component.html',
})
export class DomainOfInfluenceEditDialogComponent implements OnInit {
  public readonly knownDomainOfInfluenceTypes: typeof DomainOfInfluenceType = DomainOfInfluenceType;

  public data: DomainOfInfluence;
  public parentType?: DomainOfInfluenceType;
  public isNew: boolean = false;

  public domainOfInfluenceTypes: EnumItemDescription<DomainOfInfluenceType>[] = [];
  public domainOfInfluenceCantons: EnumItemDescription<DomainOfInfluenceCanton>[] = [];

  public logoChanged: boolean = false;
  public updatedLogo?: File;
  public selectedTenant?: Tenant;
  public saving: boolean = false;
  public isAdmin: boolean = false;
  public readonly readonly: boolean;

  constructor(
    private readonly dialogRef: MatDialogRef<DomainOfInfluenceEditDialogData>,
    private readonly rolesService: RolesService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly i18n: TranslateService,
    private readonly enumUtil: EnumUtil,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: DomainOfInfluenceEditDialogData,
  ) {
    this.data = dialogData.domainOfInfluence;
    this.data.parentId = dialogData.parent?.id || '';
    this.parentType = dialogData.parent?.type;
    this.readonly = dialogData.readonly;
  }

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.name &&
      !!this.data.shortName &&
      !!this.data.type &&
      (this.data.type !== DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU || !!this.data.bfs) &&
      !!this.selectedTenant &&
      !!this.selectedTenant.id &&
      (!!this.data.parentId || !!this.data.canton) &&
      this.data.exportConfigurationsList.every(e => !!e.description && !!e.eaiMessageType && !!e.provider) &&
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
          !!this.data.returnAddress.zipCode)) &&
      !!this.data.plausibilisationConfiguration &&
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
        this.data.plausibilisationConfiguration.comparisonValidVotingCardsWithAccountedBallotsThresholdPercent >= 0)
    );
  }

  public async ngOnInit(): Promise<void> {
    this.isNew = !this.data.id;
    this.isAdmin = await this.rolesService.isAdmin();
    this.initDomainOfInfluenceTypes();
    this.initDomainOfInfluenceCantons();

    if (this.data.secureConnectId) {
      this.selectedTenant = { id: this.data.secureConnectId, name: this.data.authorityName } as Tenant;
    }
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave || !this.selectedTenant) {
      return;
    }

    if (!this.isAdmin) {
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
      this.dialogRef.close({
        domainOfInfluence: this.data,
      } as DomainOfInfluenceEditDialogResult);
    } finally {
      this.saving = false;
      this.logoChanged = false;
      delete this.updatedLogo;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
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

    if (!parentType) {
      this.domainOfInfluenceTypes = domainOfInfluenceTypes;
      return;
    }

    // if non political
    if (parentType >= DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SC) {
      this.domainOfInfluenceTypes = domainOfInfluenceTypes.filter(dit => dit.value >= DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SC);
      return;
    }

    this.domainOfInfluenceTypes = domainOfInfluenceTypes.filter(
      dit => dit.value >= parentType && dit.value < DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SC,
    );
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
}

export interface DomainOfInfluenceEditDialogData {
  domainOfInfluence: DomainOfInfluence;
  parent?: DomainOfInfluence;
  readonly: boolean;
}

export interface DomainOfInfluenceEditDialogResult {
  domainOfInfluence: DomainOfInfluence;
}
