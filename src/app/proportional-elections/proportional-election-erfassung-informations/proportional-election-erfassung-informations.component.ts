/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { RadioButton } from '@abraxas/base-components';
import { EnumUtil, NumberUtil } from '@abraxas/voting-lib';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BallotNumberGeneration } from '../../core/models/ballot-number-generation.model';
import {
  newProportionalElection,
  ProportionalElection,
  ProportionalElectionReviewProcedure,
} from '../../core/models/proportional-election.model';

@Component({
  selector: 'app-proportional-election-erfassung-informations',
  templateUrl: './proportional-election-erfassung-informations.component.html',
  styleUrls: ['./proportional-election-erfassung-informations.component.scss'],
})
export class ProportionalElectionErfassungInformationsComponent implements OnInit {
  @Input()
  public data: ProportionalElection = newProportionalElection();

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public useCandidateCheckDigit: boolean = false;

  public ballotNumberGenerationChoices: RadioButton[];
  public automaticEmptyVoteCountingChoices: RadioButton[];
  public reviewProcedureChoices: RadioButton[];

  constructor(enumUtil: EnumUtil, private readonly i18n: TranslateService) {
    this.ballotNumberGenerationChoices = enumUtil
      .getArrayWithDescriptions<BallotNumberGeneration>(BallotNumberGeneration, 'PROPORTIONAL_ELECTION.BALLOT_NUMBER_GENERATION.TYPES.')
      .map(item => ({
        value: item.value,
        displayText: item.description,
      }));
    this.automaticEmptyVoteCountingChoices = [
      {
        value: true,
        displayText: this.i18n.instant('PROPORTIONAL_ELECTION.AUTOMATIC_EMPTY_VOTE_COUNTING.AUTOMATIC'),
      },
      {
        value: false,
        displayText: this.i18n.instant('PROPORTIONAL_ELECTION.AUTOMATIC_EMPTY_VOTE_COUNTING.MANUAL'),
      },
    ];
    this.reviewProcedureChoices = enumUtil
      .getArrayWithDescriptions<ProportionalElectionReviewProcedure>(
        ProportionalElectionReviewProcedure,
        'PROPORTIONAL_ELECTION.REVIEW_PROCEDURE.TYPES.',
      )
      .map(item => ({
        value: item.value,
        displayText: item.description,
      }));
  }

  public get canSave(): boolean {
    return (
      this.data.ballotNumberGeneration !== undefined &&
      this.data.ballotBundleSize >= 0 &&
      this.data.ballotBundleSampleSize >= 0 &&
      this.data.ballotBundleSampleSize <= this.data.ballotBundleSize &&
      this.data.reviewProcedure > ProportionalElectionReviewProcedure.PROPORTIONAL_ELECTION_REVIEW_PROCEDURE_UNSPECIFIED
    );
  }

  public get ballotBundleSize(): number | undefined {
    return this.data.ballotBundleSize === 0 ? undefined : this.data.ballotBundleSize;
  }

  public set ballotBundleSize(value: number | undefined) {
    this.data.ballotBundleSize = NumberUtil.getNumberOrZero(value);
  }

  public get ballotBundleSampleSize(): number | undefined {
    return this.data.ballotBundleSampleSize === 0 ? undefined : this.data.ballotBundleSampleSize;
  }

  public set ballotBundleSampleSize(value: number | undefined) {
    this.data.ballotBundleSampleSize = NumberUtil.getNumberOrZero(value);
  }

  public ngOnInit(): void {
    this.refreshBallotNumberGenerationChoices();
  }

  public refreshBallotNumberGenerationChoices(): void {
    for (const choice of this.ballotNumberGenerationChoices) {
      choice.disabled = !this.data.automaticBallotBundleNumberGeneration || this.testingPhaseEnded;
    }

    if (!this.data.automaticBallotBundleNumberGeneration) {
      this.data.ballotNumberGeneration = BallotNumberGeneration.BALLOT_NUMBER_GENERATION_RESTART_FOR_EACH_BUNDLE;
    }
  }
}
