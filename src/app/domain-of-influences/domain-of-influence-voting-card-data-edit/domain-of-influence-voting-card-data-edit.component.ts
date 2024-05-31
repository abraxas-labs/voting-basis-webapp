/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { newDomainOfInfluenceVotingCardReturnAddress } from '../../core/models/domain-of-influence-return-address.model';
import {
  newDomainOfInfluenceVotingCardPrintData,
  VotingCardShippingFranking,
  VotingCardShippingMethod,
} from '../../core/models/domain-of-influence-voting-card-print-data.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { newDomainOfInfluenceVotingCardSwissPostData } from '../../core/models/domain-of-influence-voting-card-swiss-post-data.model';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';
import { VotingCardColor } from '@abraxas/voting-basis-service-proto/grpc/shared/voting_card_color_pb';

@Component({
  selector: 'app-domain-of-influence-voting-card-data-edit',
  templateUrl: './domain-of-influence-voting-card-data-edit.component.html',
})
export class DomainOfInfluenceVotingCardDataEditComponent implements OnInit {
  public shippingAwayItems: EnumItemDescription<VotingCardShippingFranking>[] = [];
  public shippingReturnItems: EnumItemDescription<VotingCardShippingFranking>[] = [];
  public shippingMethodItems: EnumItemDescription<VotingCardShippingMethod>[] = [];
  public votingCardColors: EnumItemDescription<VotingCardColor>[] = [];

  @Input()
  public disabled: boolean = false;

  @Output()
  public logoChanged: EventEmitter<File> = new EventEmitter<File>();

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  public canEditEverything: boolean = false;

  private domainOfInfluenceValue!: DomainOfInfluence;

  constructor(private readonly enumUtil: EnumUtil, private readonly permissionService: PermissionService) {}

  public get domainOfInfluence(): DomainOfInfluence {
    return this.domainOfInfluenceValue;
  }

  @Input()
  public set domainOfInfluence(v: DomainOfInfluence) {
    if (v === this.domainOfInfluenceValue) {
      return;
    }

    if (!v.returnAddress) {
      v.returnAddress = newDomainOfInfluenceVotingCardReturnAddress();
    }

    if (!v.printData) {
      v.printData = newDomainOfInfluenceVotingCardPrintData();
    }

    if (!v.swissPostData) {
      v.swissPostData = newDomainOfInfluenceVotingCardSwissPostData();
    }

    this.domainOfInfluenceValue = v;
  }

  public async ngOnInit(): Promise<void> {
    this.shippingAwayItems = this.enumUtil
      .getArrayWithDescriptions<VotingCardShippingFranking>(
        VotingCardShippingFranking,
        'DOMAIN_OF_INFLUENCE.STIMMUNTERLAGEN.VOTING_CARD_SHIPPING_FRANKING.',
      )
      .filter(
        x =>
          x.value === VotingCardShippingFranking.VOTING_CARD_SHIPPING_FRANKING_B1 ||
          x.value === VotingCardShippingFranking.VOTING_CARD_SHIPPING_FRANKING_B2 ||
          x.value === VotingCardShippingFranking.VOTING_CARD_SHIPPING_FRANKING_A,
      );

    this.shippingReturnItems = this.enumUtil
      .getArrayWithDescriptions<VotingCardShippingFranking>(
        VotingCardShippingFranking,
        'DOMAIN_OF_INFLUENCE.STIMMUNTERLAGEN.VOTING_CARD_SHIPPING_FRANKING.',
      )
      .filter(
        x =>
          x.value === VotingCardShippingFranking.VOTING_CARD_SHIPPING_FRANKING_GAS_A ||
          x.value === VotingCardShippingFranking.VOTING_CARD_SHIPPING_FRANKING_GAS_B ||
          x.value === VotingCardShippingFranking.VOTING_CARD_SHIPPING_FRANKING_WITHOUT_FRANKING,
      );

    this.shippingMethodItems = this.enumUtil.getArrayWithDescriptions<VotingCardShippingMethod>(
      VotingCardShippingMethod,
      'DOMAIN_OF_INFLUENCE.STIMMUNTERLAGEN.VOTING_CARD_SHIPPING_METHOD.',
    );

    this.votingCardColors = this.enumUtil
      .getArrayWithDescriptions<VotingCardColor>(VotingCardColor, 'DOMAIN_OF_INFLUENCE.STIMMUNTERLAGEN.VOTING_CARD_COLORS.')
      .filter(c => c.value !== VotingCardColor.VOTING_CARD_COLOR_UNSPECIFIED);

    this.canEditEverything = await this.permissionService.hasAnyPermission(
      Permissions.DomainOfInfluence.UpdateSameCanton,
      Permissions.DomainOfInfluence.UpdateAll,
    );
  }
}
