/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import { Ballot, BallotQuestion, BallotQuestionType, BallotType, newBallot } from '../../core/models/vote.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vote-ballot',
  templateUrl: './vote-ballot.component.html',
  styleUrls: ['./vote-ballot.component.scss'],
})
export class VoteBallotComponent implements OnInit {
  private static readonly maxVariantBallotQuestions: number = 3;

  public BallotType: typeof BallotType = BallotType;
  public BallotQuestionType: typeof BallotQuestionType = BallotQuestionType;
  public ballotTypes: EnumItemDescription<BallotType>[] = [];
  public mainBallotQuestionTypes: EnumItemDescription<BallotQuestionType>[] = [];

  @Input()
  public data!: Ballot[];

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public eVoting: boolean = false;

  @Input()
  public multipleVoteBallotsEnabled: boolean = false;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly enumUtil: EnumUtil, private readonly i18n: TranslateService) {}

  public get canSave(): boolean {
    return (
      this.data &&
      this.data.every(
        b =>
          b.ballotQuestions.every(bq => LanguageService.allLanguagesPresent(bq.question)) &&
          b.tieBreakQuestions.every(tbq => LanguageService.allLanguagesPresent(tbq.question)),
      )
    );
  }

  public ngOnInit(): void {
    this.ballotTypes = this.enumUtil.getArrayWithDescriptions<BallotType>(BallotType, 'VOTE.BALLOT_TYPE.TYPES.');
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
  }

  public canAddQuestion(ballot: Ballot): boolean {
    return (
      ballot.ballotType === BallotType.BALLOT_TYPE_VARIANTS_BALLOT &&
      ballot.ballotQuestions.length < VoteBallotComponent.maxVariantBallotQuestions
    );
  }

  public ballotTypeChange(ballot: Ballot, ballotType: BallotType): void {
    ballot.ballotType = ballotType;

    if (ballotType === BallotType.BALLOT_TYPE_STANDARD_BALLOT) {
      ballot.ballotQuestions = ballot.ballotQuestions.filter(bq => bq.number === 1);
      ballot.tieBreakQuestions = [];
      ballot.hasTieBreakQuestions = false;
      return;
    }

    if (ballot.ballotQuestions.length > 1) {
      return;
    }

    ballot.ballotQuestions.push({
      number: 2,
      question: new Map<string, string>(),
      type: BallotQuestionType.BALLOT_QUESTION_TYPE_COUNTER_PROPOSAL,
    });
  }

  public removeQuestion(question: BallotQuestion, ballot: Ballot): void {
    const questionNumber = question.number;
    ballot.ballotQuestions = ballot.ballotQuestions.filter(bq => bq !== question);

    const questionsToRenumber = ballot.ballotQuestions.filter(bq => bq.number > questionNumber);
    for (const q of questionsToRenumber) {
      q.number -= 1;
    }

    this.updateTieBreakQuestions(ballot);
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
        });
        idx++;
      }
    }
  }

  public addBallot(): void {
    const ballot = newBallot();
    ballot.position = this.data.length + 1;
    this.data.push(ballot);
  }

  public removeBallot(ballot: Ballot): void {
    const ballotPosition = ballot.position;
    this.data.splice(ballotPosition - 1, 1);

    const ballotsToReposition = this.data.filter(b => b.position > ballotPosition);

    for (const b of ballotsToReposition) {
      b.position -= 1;
    }
  }
}
