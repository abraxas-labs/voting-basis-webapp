/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { RadioButton } from '@abraxas/base-components';
import { EnumItemDescription, EnumUtil, NumberUtil } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { newVote, Vote, VoteResultEntry, VoteReviewProcedure } from '../../core/models/vote.model';

@Component({
  selector: 'app-vote-erfassung-informations',
  templateUrl: './vote-erfassung-informations.component.html',
  styleUrls: ['./vote-erfassung-informations.component.scss'],
})
export class VoteErfassungInformationsComponent {
  @Input()
  public data: Vote = newVote();

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public isVariantsBallot: boolean = false;

  public resultEntryChoices: EnumItemDescription<VoteResultEntry>[];
  public resultEntryType: typeof VoteResultEntry = VoteResultEntry;
  public automaticBallotBundleNumberGenerationChoices: RadioButton[];
  public reviewProcedureChoices: RadioButton[];

  constructor(enumUtil: EnumUtil, private readonly i18n: TranslateService) {
    this.resultEntryChoices = enumUtil.getArrayWithDescriptions<VoteResultEntry>(VoteResultEntry, 'VOTE.RESULT_ENTRY.TYPES.');

    this.automaticBallotBundleNumberGenerationChoices = [
      {
        value: true,
        displayText: this.i18n.instant('VOTE.BALLOT_BUNDLE_NUMBER_GENERATION.AUTOMATIC'),
      },
      {
        value: false,
        displayText: this.i18n.instant('VOTE.BALLOT_BUNDLE_NUMBER_GENERATION.MANUAL'),
      },
    ];

    this.reviewProcedureChoices = enumUtil
      .getArrayWithDescriptions<VoteReviewProcedure>(VoteReviewProcedure, 'VOTE.REVIEW_PROCEDURE.TYPES.')
      .map(item => ({
        value: item.value,
        displayText: item.description,
      }));
  }

  public get canSave(): boolean {
    return (
      this.data.resultEntry > VoteResultEntry.VOTE_RESULT_ENTRY_UNSPECIFIED &&
      this.data.ballotBundleSampleSizePercent >= 0 &&
      this.data.reviewProcedure > VoteReviewProcedure.VOTE_REVIEW_PROCEDURE_UNSPECIFIED
    );
  }

  public get ballotBundleSampleSizePercent(): number | undefined {
    return this.data.ballotBundleSampleSizePercent === 0 ? undefined : this.data.ballotBundleSampleSizePercent;
  }

  public set ballotBundleSampleSizePercent(value: number | undefined) {
    this.data.ballotBundleSampleSizePercent = NumberUtil.getNumberOrZero(value);
  }
}
