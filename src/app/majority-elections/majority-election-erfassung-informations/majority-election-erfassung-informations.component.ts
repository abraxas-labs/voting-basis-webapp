/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { RadioButton } from '@abraxas/base-components';
import { EnumItemDescription, EnumUtil, NumberUtil } from '@abraxas/voting-lib';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BallotNumberGeneration } from '../../core/models/ballot-number-generation.model';
import {
  MajorityElection,
  MajorityElectionResultEntry,
  MajorityElectionReviewProcedure,
  newMajorityElection,
} from '../../core/models/majority-election.model';

@Component({
  selector: 'app-majority-election-erfassung-informations',
  templateUrl: './majority-election-erfassung-informations.component.html',
  styleUrls: ['./majority-election-erfassung-informations.component.scss'],
})
export class MajorityElectionErfassungInformationsComponent implements OnInit {
  @Input()
  public data: MajorityElection = newMajorityElection();

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  public resultEntryChoices: EnumItemDescription<MajorityElectionResultEntry>[];
  public ballotNumberGenerationChoices: RadioButton[];
  public resultEntryType: typeof MajorityElectionResultEntry = MajorityElectionResultEntry;
  public automaticEmptyVoteCountingChoices: RadioButton[];
  public reviewProcedureChoices: RadioButton[];

  constructor(enumUtil: EnumUtil, private readonly i18n: TranslateService) {
    this.resultEntryChoices = enumUtil.getArrayWithDescriptions<MajorityElectionResultEntry>(
      MajorityElectionResultEntry,
      'MAJORITY_ELECTION.RESULT_ENTRY.TYPES.',
    );
    this.ballotNumberGenerationChoices = enumUtil
      .getArrayWithDescriptions<BallotNumberGeneration>(BallotNumberGeneration, 'MAJORITY_ELECTION.BALLOT_NUMBER_GENERATION.TYPES.')
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
      .getArrayWithDescriptions<MajorityElectionReviewProcedure>(
        MajorityElectionReviewProcedure,
        'MAJORITY_ELECTION.REVIEW_PROCEDURE.TYPES.',
      )
      .map(item => ({
        value: item.value,
        displayText: item.description,
      }));
  }

  public get canSave(): boolean {
    return (
      this.data.ballotNumberGeneration !== undefined &&
      this.data.resultEntry > MajorityElectionResultEntry.MAJORITY_ELECTION_RESULT_ENTRY_UNSPECIFIED &&
      this.data.ballotBundleSize >= 0 &&
      this.data.ballotBundleSampleSize >= 0 &&
      this.data.ballotBundleSampleSize <= this.data.ballotBundleSize &&
      this.data.reviewProcedure > MajorityElectionReviewProcedure.MAJORITY_ELECTION_REVIEW_PROCEDURE_UNSPECIFIED
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
