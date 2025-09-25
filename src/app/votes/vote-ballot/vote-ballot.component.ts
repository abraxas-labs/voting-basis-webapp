/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Vote } from '../../core/models/vote.model';
import { BallotType, VoteType } from '@abraxas/voting-basis-service-proto/grpc/shared/vote_pb';
import { VoteStandardBallotComponent } from './vote-standard-ballot/vote-standard-ballot.component';
import { VoteVariantsOnSingleBallotComponent } from './vote-variants-on-single-ballot/vote-variants-on-single-ballot.component';
import { VoteVariantsOnMultipleBallotsComponent } from './vote-variants-on-multiple-ballots/vote-variants-on-multiple-ballots.component';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-vote-ballot',
  templateUrl: './vote-ballot.component.html',
  standalone: false,
})
export class VoteBallotComponent {
  public userVoteTypeDescriptions: EnumItemDescription<UserVoteType>[] = [];
  public userVoteTypes: typeof UserVoteType = UserVoteType;

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public readonly: boolean = false;

  @Input()
  public eVoting?: boolean;

  @Input()
  public domainOfInfluenceType?: DomainOfInfluenceType;

  @Input()
  public voteTypeImmutable: boolean = false;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(VoteStandardBallotComponent)
  public standardBallotComponent?: VoteStandardBallotComponent;

  @ViewChild(VoteVariantsOnSingleBallotComponent)
  public variantsOnSingleBallotComponent?: VoteVariantsOnSingleBallotComponent;

  @ViewChild(VoteVariantsOnMultipleBallotsComponent)
  public variantsOnMultipleBallotComponent?: VoteVariantsOnMultipleBallotsComponent;

  public userVoteType?: UserVoteType;
  private _vote?: Vote;
  private readonly allUserVoteTypeDescriptions: EnumItemDescription<UserVoteType>[];

  constructor(private readonly enumUtil: EnumUtil) {
    this.allUserVoteTypeDescriptions = this.enumUtil.getArrayWithDescriptions<UserVoteType>(UserVoteType, 'VOTE.USER_VOTE_TYPE.TYPES.');
    this.userVoteTypeDescriptions = [...this.allUserVoteTypeDescriptions];
  }

  @Input()
  public set vote(value: Vote) {
    if (value.ballots === undefined) {
      return;
    }

    this._vote = value;
    if (value.type === VoteType.VOTE_TYPE_VARIANT_QUESTIONS_ON_MULTIPLE_BALLOTS) {
      this.userVoteType = UserVoteType.VariantQuestionsOnMultipleBallots;
    } else if (value.ballots.length > 0 && value.ballots[0].ballotType == BallotType.BALLOT_TYPE_VARIANTS_BALLOT) {
      this.userVoteType = UserVoteType.VariantQuestionsOnSingleBallot;
    } else {
      this.userVoteType = UserVoteType.StandardVote;
    }
  }

  public get vote(): Vote | undefined {
    return this._vote;
  }

  @Input()
  public set multipleVoteBallotsEnabled(value: boolean) {
    if (value === undefined) {
      return;
    }

    this.userVoteTypeDescriptions = [...this.allUserVoteTypeDescriptions];

    if (!value && this.userVoteType !== UserVoteType.VariantQuestionsOnMultipleBallots) {
      this.userVoteTypeDescriptions = this.userVoteTypeDescriptions.filter(x => x.value !== UserVoteType.VariantQuestionsOnMultipleBallots);
    }
  }

  public get canSave(): boolean {
    return (
      !!this.standardBallotComponent?.canSave ||
      !!this.variantsOnSingleBallotComponent?.canSave ||
      !!this.variantsOnMultipleBallotComponent?.canSave
    );
  }
}

enum UserVoteType {
  StandardVote = 'standard-vote',
  VariantQuestionsOnSingleBallot = 'variant-questions-on-single-ballot',
  VariantQuestionsOnMultipleBallots = 'variant-questions-on-multiple-ballots',
}
