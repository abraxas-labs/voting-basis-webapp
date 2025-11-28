/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Vote, VoteResultAlgorithm } from '../../core/models/vote.model';
import { isPoliticalDoiType } from '../../core/utils/domain-of-influence.utils';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-vote-result-algorithm-selection',
  templateUrl: './vote-result-algorithm-selection.component.html',
  standalone: false,
})
export class VoteResultAlgorithmSelectionComponent {
  private domainOfInfluenceTypeValue?: DomainOfInfluenceType;
  private readonly defaultResultAlgorithms: EnumItemDescription<VoteResultAlgorithm>[] = [];

  public resultAlgorithms: EnumItemDescription<VoteResultAlgorithm>[] = [];

  constructor(enumUtil: EnumUtil) {
    this.resultAlgorithms = this.defaultResultAlgorithms = enumUtil.getArrayWithDescriptions<VoteResultAlgorithm>(
      VoteResultAlgorithm,
      'VOTE.RESULT_ALGORITHM.TYPES.',
    );
  }
  @Input()
  public readonly: boolean = false;

  @Input()
  public data!: Vote;

  public get domainOfInfluenceType(): DomainOfInfluenceType | undefined {
    return this.domainOfInfluenceTypeValue;
  }

  @Input()
  public set domainOfInfluenceType(v: DomainOfInfluenceType | undefined) {
    if (this.domainOfInfluenceTypeValue === v) {
      return;
    }

    this.domainOfInfluenceTypeValue = v;
    this.updateResultAlgorithms();
  }

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  private updateResultAlgorithms(): void {
    if (!this.domainOfInfluenceType || this.defaultResultAlgorithms.length === 0) {
      return;
    }

    if (!isPoliticalDoiType(this.domainOfInfluenceType)) {
      this.resultAlgorithms = this.defaultResultAlgorithms;
      return;
    }

    this.resultAlgorithms = this.defaultResultAlgorithms.filter(
      x => x.value === VoteResultAlgorithm.VOTE_RESULT_ALGORITHM_POPULAR_MAJORITY,
    );

    if (
      this.data.resultAlgorithm === VoteResultAlgorithm.VOTE_RESULT_ALGORITHM_UNSPECIFIED ||
      this.resultAlgorithms.some(x => x.value === this.data.resultAlgorithm)
    ) {
      this.trySelectInitialResultAlgorithm();
      return;
    }

    if (!this.readonly) {
      this.data.resultAlgorithm = VoteResultAlgorithm.VOTE_RESULT_ALGORITHM_UNSPECIFIED;
      this.trySelectInitialResultAlgorithm();
      return;
    }

    const resultAlgorithm = this.defaultResultAlgorithms.find(x => x.value === this.data.resultAlgorithm);
    if (!!resultAlgorithm) {
      this.resultAlgorithms = [...this.resultAlgorithms, resultAlgorithm];
    }
    this.trySelectInitialResultAlgorithm();
  }

  private trySelectInitialResultAlgorithm() {
    if (!this.data.resultAlgorithm && this.resultAlgorithms.length === 1) {
      this.data.resultAlgorithm = this.resultAlgorithms[0].value;
    }
  }
}
