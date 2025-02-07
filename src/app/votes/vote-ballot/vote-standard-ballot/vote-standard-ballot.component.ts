/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BallotSubType, VoteType } from '@abraxas/voting-basis-service-proto/grpc/shared/vote_pb';
import { Ballot, BallotQuestion, newBallot, Vote } from '../../../core/models/vote.model';
import { LanguageService } from '../../../core/language.service';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceType } from '../../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-vote-standard-ballot',
  templateUrl: './vote-standard-ballot.component.html',
})
export class VoteStandardBallotComponent {
  public readonly domainOfInfluenceTypes: typeof DomainOfInfluenceType = DomainOfInfluenceType;
  public readonly federalIdentificationMaxValue: number = 2147483647;

  @Input()
  public locked: boolean = false;

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public readonly: boolean = false;

  @Input()
  public domainOfInfluenceType?: DomainOfInfluenceType;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  public ballotQuestion?: BallotQuestion;
  private _eVoting?: boolean;

  constructor(private readonly i18n: TranslateService) {}

  @Input()
  public set vote(value: Vote) {
    if (
      value.type !== VoteType.VOTE_TYPE_QUESTIONS_ON_SINGLE_BALLOT ||
      !value.ballots ||
      value.ballots.length !== 1 ||
      value.ballots[0].ballotQuestions.length !== 1 ||
      value.ballots[0].tieBreakQuestions.length > 0 ||
      value.ballots[0].subType !== BallotSubType.BALLOT_SUB_TYPE_UNSPECIFIED
    ) {
      value.type = VoteType.VOTE_TYPE_QUESTIONS_ON_SINGLE_BALLOT;
      value.ballots = [newBallot(0)];
      this.contentChanged.emit();
    }

    this.ballotQuestion = value.ballots[0].ballotQuestions[0];
    this.tryPrefillQuestion();
  }

  @Input()
  public set eVoting(value: boolean | undefined) {
    this._eVoting = value;
    this.tryPrefillQuestion();
  }

  public get eVoting(): boolean | undefined {
    return this._eVoting;
  }

  public get canSave(): boolean {
    return !!this.ballotQuestion && LanguageService.allLanguagesPresent(this.ballotQuestion.question);
  }

  private tryPrefillQuestion(): void {
    if (!this.ballotQuestion || this._eVoting === undefined) {
      return;
    }

    if (!this._eVoting && !LanguageService.allLanguagesPresent(this.ballotQuestion.question)) {
      this.ballotQuestion.question = LanguageService.fillAllLanguages(this.i18n.instant('VOTE.QUESTION.TITLE_STANDARD'));
      this.contentChanged.emit();
    }
  }
}
