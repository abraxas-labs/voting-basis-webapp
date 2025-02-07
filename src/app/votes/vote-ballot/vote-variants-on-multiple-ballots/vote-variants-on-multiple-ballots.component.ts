/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { BallotQuestionType, BallotSubType, BallotType, VoteType } from '@abraxas/voting-basis-service-proto/grpc/shared/vote_pb';
import { Ballot, newBallot, Vote } from '../../../core/models/vote.model';
import { LanguageService } from '../../../core/language.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vote-variants-on-multiple-ballots',
  templateUrl: './vote-variants-on-multiple-ballots.component.html',
  styleUrl: './vote-variants-on-multiple-ballots.component.scss',
})
export class VoteVariantsOnMultipleBallotsComponent {
  public readonly maxBallotQuestions: number = 3;

  public ballotSubTypeDescriptions: EnumItemDescription<BallotSubType>[] = [];

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public readonly: boolean = false;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  public tieBreakQuestionCount: number = 0;
  public tieBreakQuestionCountDescriptions: EnumItemDescription<number>[] = [];

  private _vote?: Vote;
  private _eVoting?: boolean;

  constructor(
    private readonly enumUtil: EnumUtil,
    private readonly i18n: TranslateService,
    private readonly languageService: LanguageService,
  ) {
    this.ballotSubTypeDescriptions = this.enumUtil.getArrayWithDescriptions<BallotSubType>(BallotSubType, 'VOTE.BALLOT_SUB_TYPE.TYPES.');
    this.tieBreakQuestionCountDescriptions = [
      { value: 0, description: this.i18n.instant('VOTE.TIE_BREAK_QUESTION_COUNT.0') },
      { value: 1, description: this.i18n.instant('VOTE.TIE_BREAK_QUESTION_COUNT.1') },
      { value: 3, description: this.i18n.instant('VOTE.TIE_BREAK_QUESTION_COUNT.3') },
    ];
  }

  @Input()
  public set vote(value: Vote) {
    this._vote = value;

    if (
      value.type !== VoteType.VOTE_TYPE_VARIANT_QUESTIONS_ON_MULTIPLE_BALLOTS ||
      !value.ballots ||
      value.ballots.length < 2 ||
      value.ballots.some(x => x.subType === BallotSubType.BALLOT_SUB_TYPE_UNSPECIFIED || x.ballotQuestions.length > 1)
    ) {
      value.type = VoteType.VOTE_TYPE_VARIANT_QUESTIONS_ON_MULTIPLE_BALLOTS;

      if (value.ballots.length === 0) {
        this.addBallot();
      }

      if (value.ballots.length === 1) {
        this.addBallot();
      }

      for (let i = 0; i < value.ballots.length; i++) {
        const ballot = value.ballots[i];
        this.setDefaultBallotFields(ballot);
      }

      this.contentChanged.emit();
    }

    this.tieBreakQuestionCount = value.ballots.filter(b => b.subType >= BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_1).length;
    this.tryPrefillQuestions();
  }

  public get vote(): Vote | undefined {
    return this._vote;
  }

  @Input()
  public set eVoting(value: boolean | undefined) {
    this._eVoting = value;
    this.tryPrefillQuestions();
  }

  public get eVoting(): boolean | undefined {
    return this._eVoting;
  }

  public get canSave(): boolean {
    return (
      !!this.vote?.ballots &&
      this.vote.ballots.every(
        b =>
          b.ballotQuestions.every(bq => LanguageService.allLanguagesPresent(bq.question)) &&
          LanguageService.allLanguagesPresent(b.shortDescription) &&
          LanguageService.allLanguagesPresent(b.officialDescription),
      )
    );
  }

  public addBallot(): void {
    const ballot = newBallot(this.filterBallots(false).length);
    this.setDefaultBallotFields(ballot);
    this._vote!.ballots.splice(ballot.position - 1, 0, ballot);

    const tieBreaksToReposition = this.filterBallots(true).filter(b => b.position >= ballot.position);

    for (const b of tieBreaksToReposition) {
      b.position += 1;
    }

    this.updateTieBreakBallots();
    this.tryPrefillQuestions();
    this.contentChanged.emit();
  }

  public canAddBallot(): boolean {
    return !!this._vote && this.filterBallots(false).length < this.maxBallotQuestions;
  }

  public updateTieBreakBallots(): void {
    if (this.tieBreakQuestionCount === 0) {
      this._vote!.ballots = this.filterBallots(false);
      return;
    }

    const normalQuestionCount = this.filterBallots(false).length;
    if (normalQuestionCount < this.tieBreakQuestionCount) {
      this.tieBreakQuestionCount = 1;
    }
    const tieBreakQuestions = this.filterBallots(true);

    for (let i = 0; i < this.tieBreakQuestionCount; i++) {
      const type: BallotSubType = BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_1 + i;
      if (!tieBreakQuestions.some(x => x.subType === type)) {
        const ballot = newBallot(this._vote!.ballots.length);
        ballot.subType = type;
        this._vote!.ballots.push(ballot);
      }
    }

    // Remove tie break ballots that are no longer needed
    const highestType = BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_1 + this.tieBreakQuestionCount - 1;
    this._vote!.ballots = this._vote!.ballots.filter(x => x.subType <= highestType);
  }

  public removeBallot(ballot: Ballot): void {
    const ballotPosition = ballot.position;
    this.vote!.ballots.splice(ballotPosition - 1, 1);

    const ballotsToReposition = this.vote!.ballots.filter(b => b.position > ballotPosition);

    for (const b of ballotsToReposition) {
      b.position -= 1;
    }

    this.updateTieBreakBallots();
    this.tryPrefillQuestions();
    this.contentChanged.emit();
  }

  public filterBallots(tieBreakQuestions: boolean): Ballot[] {
    return this._vote!.ballots.filter(x =>
      tieBreakQuestions ? x.subType >= BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_1 : x.subType < BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_1,
    );
  }

  public getPossibleSubTypes(ballot: Ballot): EnumItemDescription<BallotSubType>[] {
    switch (ballot.subType) {
      case BallotSubType.BALLOT_SUB_TYPE_MAIN_BALLOT:
      case BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_1:
      case BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_2:
      case BallotSubType.BALLOT_SUB_TYPE_TIE_BREAK_3:
        // Not possible to choose something else
        return this.ballotSubTypeDescriptions.filter(x => x.value === ballot.subType);
      case BallotSubType.BALLOT_SUB_TYPE_VARIANT_1:
      case BallotSubType.BALLOT_SUB_TYPE_COUNTER_PROPOSAL_1:
        return this.ballotSubTypeDescriptions.filter(
          x => x.value === BallotSubType.BALLOT_SUB_TYPE_VARIANT_1 || x.value === BallotSubType.BALLOT_SUB_TYPE_COUNTER_PROPOSAL_1,
        );
      case BallotSubType.BALLOT_SUB_TYPE_VARIANT_2:
      case BallotSubType.BALLOT_SUB_TYPE_COUNTER_PROPOSAL_2:
        return this.ballotSubTypeDescriptions.filter(
          x => x.value === BallotSubType.BALLOT_SUB_TYPE_VARIANT_2 || x.value === BallotSubType.BALLOT_SUB_TYPE_COUNTER_PROPOSAL_2,
        );
    }

    return [];
  }

  public getPossibleTieBreakQuestionCount(): EnumItemDescription<number>[] {
    const normalQuestionCount = this.filterBallots(false).length;

    return this.tieBreakQuestionCountDescriptions.filter(x => x.value <= normalQuestionCount);
  }

  public tryPrefillQuestions(): void {
    if (!this._vote?.ballots || this._eVoting === undefined || this._eVoting) {
      return;
    }

    let changed = false;
    for (const ballot of this.vote!.ballots) {
      const question = this.i18n.instant('VOTE.BALLOT_SUB_TYPE.TYPES.' + ballot.subType);
      const ballotQuestion = ballot.ballotQuestions[0].question;
      if (ballotQuestion.size === 0 || this.languageService.getTranslationForCurrentLang(ballotQuestion) !== question) {
        ballot.ballotQuestions[0].question = LanguageService.fillAllLanguages(question);
        changed = true;
      }
    }

    if (changed) {
      this.contentChanged.emit();
    }
  }

  private setDefaultBallotFields(ballot: Ballot): void {
    ballot.ballotType = BallotType.BALLOT_TYPE_STANDARD_BALLOT;
    ballot.ballotQuestions = ballot.ballotQuestions.filter(bq => bq.number === 1);
    ballot.ballotQuestions[0].type = BallotQuestionType.BALLOT_QUESTION_TYPE_MAIN_BALLOT;
    ballot.tieBreakQuestions = [];
    ballot.hasTieBreakQuestions = false;

    switch (ballot.position) {
      case 1:
        ballot.subType = BallotSubType.BALLOT_SUB_TYPE_MAIN_BALLOT;
        break;
      case 2:
        if (ballot.subType !== BallotSubType.BALLOT_SUB_TYPE_VARIANT_1) {
          ballot.subType = BallotSubType.BALLOT_SUB_TYPE_COUNTER_PROPOSAL_1;
        }
        break;
      case 3:
        if (ballot.subType !== BallotSubType.BALLOT_SUB_TYPE_VARIANT_2) {
          ballot.subType = BallotSubType.BALLOT_SUB_TYPE_COUNTER_PROPOSAL_2;
        }
        break;
    }
  }
}
