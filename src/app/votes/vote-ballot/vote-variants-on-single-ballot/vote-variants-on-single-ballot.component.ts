/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EnumItemDescription } from '@abraxas/voting-lib';
import { BallotQuestionType, BallotSubType, BallotType, VoteType } from '@abraxas/voting-basis-service-proto/grpc/shared/vote_pb';
import { Ballot, BallotQuestion, newBallot, Vote } from '../../../core/models/vote.model';
import { LanguageService } from '../../../core/language.service';
import { DomainOfInfluenceType } from '../../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-vote-variants-on-single-ballot',
  templateUrl: './vote-variants-on-single-ballot.component.html',
  styleUrl: './vote-variants-on-single-ballot.component.scss',
})
export class VoteVariantsOnSingleBallotComponent implements OnInit {
  public readonly domainOfInfluenceTypes: typeof DomainOfInfluenceType = DomainOfInfluenceType;
  public readonly maxVariantBallotQuestions: number = 3;
  public readonly federalIdentificationMaxValue: number = 2147483647;

  public ballotQuestionType: typeof BallotQuestionType = BallotQuestionType;
  public mainBallotQuestionTypes: EnumItemDescription<BallotQuestionType>[] = [];

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public readonly: boolean = false;

  @Input()
  public domainOfInfluenceType?: DomainOfInfluenceType;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  public ballot?: Ballot;
  private _eVoting?: boolean;

  constructor(
    private readonly i18n: TranslateService,
    private readonly languageService: LanguageService,
  ) {}

  @Input()
  public set vote(value: Vote) {
    if (
      value.type !== VoteType.VOTE_TYPE_QUESTIONS_ON_SINGLE_BALLOT ||
      !value.ballots ||
      value.ballots.length !== 1 ||
      value.ballots[0].ballotQuestions.length < 2 ||
      value.ballots[0].subType !== BallotSubType.BALLOT_SUB_TYPE_UNSPECIFIED
    ) {
      value.type = VoteType.VOTE_TYPE_QUESTIONS_ON_SINGLE_BALLOT;
      value.ballots = [newBallot(0)];
      const ballot = value.ballots[0];
      ballot.ballotType = BallotType.BALLOT_TYPE_VARIANTS_BALLOT;
      ballot.ballotQuestions.push({
        number: 2,
        question: new Map<string, string>(),
        type: BallotQuestionType.BALLOT_QUESTION_TYPE_COUNTER_PROPOSAL,
      });
      this.contentChanged.emit();
    }

    this.ballot = value.ballots[0];
    this.tryPrefillQuestions();
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
      !!this.ballot &&
      this.ballot.ballotQuestions.every(bq => LanguageService.allLanguagesPresent(bq.question)) &&
      this.ballot.tieBreakQuestions.every(tbq => LanguageService.allLanguagesPresent(tbq.question))
    );
  }

  public ngOnInit(): void {
    this.mainBallotQuestionTypes = [
      {
        value: BallotQuestionType.BALLOT_QUESTION_TYPE_MAIN_BALLOT,
        description: this.i18n.instant('VOTE.BALLOT_QUESTION_TYPE.TYPES.' + BallotQuestionType.BALLOT_QUESTION_TYPE_MAIN_BALLOT),
      },
    ];
  }

  public addQuestion(ballot: Ballot): void {
    const nextQuestionNumber = ballot.ballotQuestions.length + 1;
    ballot.ballotQuestions.push({
      number: nextQuestionNumber,
      question: new Map<string, string>(),
      type:
        nextQuestionNumber === 1
          ? BallotQuestionType.BALLOT_QUESTION_TYPE_MAIN_BALLOT
          : BallotQuestionType.BALLOT_QUESTION_TYPE_COUNTER_PROPOSAL,
    });
    this.updateTieBreakQuestions(ballot);
    this.tryPrefillQuestions();
  }

  public removeQuestion(question: BallotQuestion, ballot: Ballot): void {
    const questionNumber = question.number;
    ballot.ballotQuestions = ballot.ballotQuestions.filter(bq => bq !== question);

    const questionsToRenumber = ballot.ballotQuestions.filter(bq => bq.number > questionNumber);
    for (const q of questionsToRenumber) {
      q.number -= 1;
    }

    this.updateTieBreakQuestions(ballot);
    this.tryPrefillQuestions();
  }

  public updateTieBreakQuestions(ballot: Ballot): void {
    const existingQuestions = ballot.tieBreakQuestions;
    ballot.tieBreakQuestions = [];
    if (!ballot.hasTieBreakQuestions) {
      return;
    }

    let idx = 0;
    for (let i = 0; i < ballot.ballotQuestions.length - 1; i++) {
      for (let j = i + 1; j < ballot.ballotQuestions.length; j++) {
        ballot.tieBreakQuestions.push({
          number: ballot.tieBreakQuestions.length + 1,
          question: existingQuestions.length > idx ? existingQuestions[idx].question : LanguageService.fillAllLanguages(''),
          question1Number: i + 1,
          question2Number: j + 1,
          federalIdentification: existingQuestions.length > idx ? existingQuestions[idx].federalIdentification : undefined,
        });
        idx++;
      }
    }
  }

  public tryPrefillQuestions(): void {
    if (!this.ballot || this._eVoting === undefined || this._eVoting) {
      return;
    }

    const questions = [...this.ballot.ballotQuestions, ...this.ballot.tieBreakQuestions];

    let changed = false;
    for (const ballotQuestion of this.ballot.ballotQuestions) {
      const suffix = this.ballot.ballotQuestions.length > 2 && ballotQuestion.number > 1 ? '_WITH_NUMBER' : '';
      const expectedQuestion = this.i18n.instant('VOTE.BALLOT_QUESTION_TYPE.TYPES.' + ballotQuestion.type + suffix, {
        number: ballotQuestion.number - 1,
      });
      if (
        ballotQuestion.question.size === 0 ||
        this.languageService.getTranslationForCurrentLang(ballotQuestion.question) !== expectedQuestion
      ) {
        ballotQuestion.question = LanguageService.fillAllLanguages(expectedQuestion);
        changed = true;
      }
    }

    for (const tieBreakQuestion of this.ballot.tieBreakQuestions) {
      const suffix = this.ballot.tieBreakQuestions.length > 1 ? '_WITH_NUMBER' : '';
      const expectedQuestion = this.i18n.instant('VOTE.BALLOT_QUESTION_TYPE.TIE_BREAK' + suffix, { number: tieBreakQuestion.number });
      if (
        tieBreakQuestion.question.size === 0 ||
        this.languageService.getTranslationForCurrentLang(tieBreakQuestion.question) !== expectedQuestion
      ) {
        tieBreakQuestion.question = LanguageService.fillAllLanguages(expectedQuestion);
        changed = true;
      }
    }

    if (changed) {
      this.contentChanged.emit();
    }
  }
}
