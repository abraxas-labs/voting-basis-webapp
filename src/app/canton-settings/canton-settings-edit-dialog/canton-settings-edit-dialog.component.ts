/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { RadioButton, Tenant } from '@abraxas/base-components';
import { VotingChannel } from '@abraxas/voting-basis-service-proto/grpc/shared/voting_channel_pb';
import { EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CantonSettingsService } from '../../core/canton-settings.service';
import {
  CantonMajorityElectionAbsoluteMajorityAlgorithm,
  CantonSettings,
  CantonSettingsVotingCardChannel,
  ProtocolCountingCircleSortType,
  ProtocolDomainOfInfluenceSortType,
  SwissAbroadVotingRight,
} from '../../core/models/canton-settings.model';
import { CheckableItems } from '../../core/models/checkable-item.model';
import { DomainOfInfluenceCanton, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { PoliticalBusinessUnionType } from '../../core/models/political-business-union.model';
import { ProportionalElectionMandateAlgorithm } from '../../core/models/proportional-election.model';
import { TranslateService } from '../../core/translate.service';

const availableVotingCardChannels: CantonSettingsVotingCardChannel[] = [
  { votingChannel: VotingChannel.VOTING_CHANNEL_BY_MAIL, valid: true },
  { votingChannel: VotingChannel.VOTING_CHANNEL_BY_MAIL, valid: false },
  { votingChannel: VotingChannel.VOTING_CHANNEL_BALLOT_BOX, valid: true },
  { votingChannel: VotingChannel.VOTING_CHANNEL_PAPER, valid: true },
];

@Component({
  selector: 'app-canton-settings-edit-dialog',
  templateUrl: './canton-settings-edit-dialog.component.html',
  styleUrls: ['./canton-settings-edit-dialog.component.scss'],
})
export class CantonSettingsEditDialogComponent implements OnInit {
  public data: CantonSettings;
  public cantons: EnumItemDescription<DomainOfInfluenceCanton>[] = [];
  public majorityElectionAbsoluteMajorityAlgorithms: EnumItemDescription<CantonMajorityElectionAbsoluteMajorityAlgorithm>[] = [];
  public proportionalElectionMandateAlgorithms: CheckableItems<EnumItemDescription<ProportionalElectionMandateAlgorithm>> = {} as any;
  public swissAbroadVotingRightDomainOfInfluenceTypes: CheckableItems<EnumItemDescription<DomainOfInfluenceType>> = {} as any;
  public swissAbroadVotingRights: EnumItemDescription<SwissAbroadVotingRight>[] = [];
  public politicalBusinessUnionTypes: CheckableItems<EnumItemDescription<PoliticalBusinessUnionType>> = {} as any;
  public votingCardChannels: CheckableItems<EnumItemDescription<CantonSettingsVotingCardChannel>> = {} as any;
  public protocolDomainOfInfluenceSortTypeChoices: RadioButton[] = [];
  public protocolCountingCircleSortTypeChoices: RadioButton[] = [];
  public readonly: boolean = true;
  public isNew: boolean = true;
  public selectedTenant?: Tenant;
  public saving: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<CantonSettingsEditDialogData>,
    private readonly cantonSettingsService: CantonSettingsService,
    private readonly i18n: TranslateService,
    private readonly enumUtil: EnumUtil,
    private readonly snackbarService: SnackbarService,
    @Inject(MAT_DIALOG_DATA) dialogData: CantonSettingsEditDialogData,
  ) {
    this.data = dialogData.cantonSettings;
    this.cantons = dialogData.cantons;
    this.readonly = dialogData.readonly;

    this.protocolDomainOfInfluenceSortTypeChoices = enumUtil
      .getArrayWithDescriptions<ProtocolDomainOfInfluenceSortType>(
        ProtocolDomainOfInfluenceSortType,
        'CANTON_SETTINGS.DOMAIN_OF_INFLUENCE.PROTOCOL_SORT.TYPES.',
      )
      .map(item => ({
        value: item.value,
        displayText: item.description,
      }));

    this.protocolCountingCircleSortTypeChoices = enumUtil
      .getArrayWithDescriptions<ProtocolCountingCircleSortType>(
        ProtocolCountingCircleSortType,
        'CANTON_SETTINGS.COUNTING_CIRCLE.PROTOCOL_SORT.TYPES.',
      )
      .map(item => ({
        value: item.value,
        displayText: item.description,
      }));
  }

  public get canSave(): boolean {
    return (
      this.proportionalElectionMandateAlgorithms.atLeastOneChecked &&
      this.data.canton !== DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED &&
      !!this.selectedTenant &&
      this.votingCardChannels.atLeastOneChecked &&
      !!this.data.votingDocumentsEVotingEaiMessageType
    );
  }

  public async ngOnInit(): Promise<void> {
    this.isNew = !this.data.id;
    this.initEnums();

    if (this.data.secureConnectId) {
      this.selectedTenant = { id: this.data.secureConnectId, name: this.data.authorityName } as Tenant;
    }
  }

  public async save(): Promise<void> {
    if (!this.data || !this.selectedTenant) {
      return;
    }

    try {
      this.saving = true;
      this.data.secureConnectId = this.selectedTenant.id;
      this.data.authorityName = this.selectedTenant.name;
      this.data.proportionalElectionMandateAlgorithmsList = this.proportionalElectionMandateAlgorithms.checkedItems.map(i => i.item.value);
      this.data.swissAbroadVotingRightDomainOfInfluenceTypesList = this.swissAbroadVotingRightDomainOfInfluenceTypes.checkedItems.map(
        i => i.item.value,
      );
      this.data.enabledPoliticalBusinessUnionTypesList = this.politicalBusinessUnionTypes.checkedItems.map(i => i.item.value);
      this.data.enabledVotingCardChannelsList = this.votingCardChannels.checkedItems.map(x => x.item.value);

      if (this.isNew) {
        this.data.id = await this.cantonSettingsService.create(this.data);
      } else {
        await this.cantonSettingsService.update(this.data);
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.dialogRef.close({
        cantonSettings: this.data,
      } as CantonSettingsEditDialogResult);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  private initEnums(): void {
    this.majorityElectionAbsoluteMajorityAlgorithms =
      this.enumUtil.getArrayWithDescriptions<CantonMajorityElectionAbsoluteMajorityAlgorithm>(
        CantonMajorityElectionAbsoluteMajorityAlgorithm,
        'CANTON_SETTINGS.MAJORITY_ELECTION.ABSOLUTE_MAJORITY_ALGORITHMS.',
      );

    this.proportionalElectionMandateAlgorithms = new CheckableItems(
      this.enumUtil
        .getArrayWithDescriptions<ProportionalElectionMandateAlgorithm>(
          ProportionalElectionMandateAlgorithm,
          'PROPORTIONAL_ELECTION.MANDATE_ALGORITHM.TYPES.',
        )
        .map(p => ({
          checked: this.data.proportionalElectionMandateAlgorithmsList.includes(p.value),
          item: p,
        })),
    );

    this.swissAbroadVotingRightDomainOfInfluenceTypes = new CheckableItems(
      this.enumUtil.getArrayWithDescriptions<DomainOfInfluenceType>(DomainOfInfluenceType, 'DOMAIN_OF_INFLUENCE.TYPES.').map(doit => ({
        checked: this.data.swissAbroadVotingRightDomainOfInfluenceTypesList.includes(doit.value),
        item: doit,
      })),
    );

    this.swissAbroadVotingRights = this.enumUtil.getArrayWithDescriptions<SwissAbroadVotingRight>(
      SwissAbroadVotingRight,
      'POLITICAL_BUSINESS.SWISS_ABROAD_VOTING_RIGHT.TYPES.',
    );

    this.politicalBusinessUnionTypes = new CheckableItems(
      this.enumUtil
        .getArrayWithDescriptions<PoliticalBusinessUnionType>(PoliticalBusinessUnionType, 'POLITICAL_BUSINESS_UNION.TYPES.')
        .map(p => ({
          checked: this.data.enabledPoliticalBusinessUnionTypesList.includes(p.value),
          item: p,
        })),
    );

    this.votingCardChannels = new CheckableItems(
      availableVotingCardChannels.map(x => ({
        checked: this.data.enabledVotingCardChannelsList.some(l => l.valid === x.valid && l.votingChannel === x.votingChannel),
        item: {
          value: x,
          description: this.i18n.instantOrFallback(
            `VOTING_CHANNELS.${x.votingChannel}_${x.valid ? 'VALID' : 'INVALID'}`,
            `VOTING_CHANNELS.${x.votingChannel}`,
          ),
        },
      })),
    );
  }
}

export interface CantonSettingsEditDialogData {
  cantons: EnumItemDescription<DomainOfInfluenceCanton>[];
  cantonSettings: CantonSettings;
  readonly: boolean;
}

export interface CantonSettingsEditDialogResult {
  cantonSettings: CantonSettings;
}
