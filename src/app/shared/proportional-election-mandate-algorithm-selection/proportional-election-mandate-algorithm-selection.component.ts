/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProportionalElection, ProportionalElectionMandateAlgorithm } from '../../core/models/proportional-election.model';
import { DomainOfInfluenceCanton, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-proportional-election-mandate-algorithm-selection',
  templateUrl: './proportional-election-mandate-algorithm-selection.component.html',
  styleUrl: './proportional-election-mandate-algorithm-selection.component.scss',
  standalone: false,
})
export class ProportionalElectionMandateAlgorithmSelectionComponent implements OnInit {
  private domainOfInfluenceTypeValue?: DomainOfInfluenceType;

  private defaultMandateAlgorithms: EnumItemDescription<ProportionalElectionMandateAlgorithm>[] = [];

  public mandateAlgorithms: EnumItemDescription<ProportionalElectionMandateAlgorithm>[] = [];

  @Input()
  public proportionalElectionMandateAlgorithmsList: ProportionalElectionMandateAlgorithm[] = [];

  @Input()
  public canton?: DomainOfInfluenceCanton;

  @Input()
  public readonly: boolean = false;

  public get domainOfInfluenceType(): DomainOfInfluenceType | undefined {
    return this.domainOfInfluenceTypeValue;
  }

  @Input()
  public set domainOfInfluenceType(v: DomainOfInfluenceType | undefined) {
    if (this.domainOfInfluenceTypeValue === v) {
      return;
    }

    this.domainOfInfluenceTypeValue = v;
    this.updateMandateAlgorithms();
  }

  @Input()
  public data!: ProportionalElection;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  constructor(private readonly enumUtil: EnumUtil) {}

  public ngOnInit(): void {
    this.defaultMandateAlgorithms = this.mandateAlgorithms = this.enumUtil
      .getArrayWithDescriptions<ProportionalElectionMandateAlgorithm>(
        ProportionalElectionMandateAlgorithm,
        'PROPORTIONAL_ELECTION.MANDATE_ALGORITHM.TYPES.',
      )
      .filter(i => this.proportionalElectionMandateAlgorithmsList.includes(i.value) || this.data.mandateAlgorithm === i.value);

    this.updateMandateAlgorithms();
    this.trySelectInitialMandateAlgorithm();
  }

  private updateMandateAlgorithms(): void {
    if (
      !this.canton ||
      this.canton !== DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_ZH ||
      !this.domainOfInfluenceType ||
      this.defaultMandateAlgorithms.length === 0
    ) {
      return;
    }

    // The mandate algorithms which are provided per canton settings are not technically wrong,
    // but to reduce business errors we display specific mandate algorithms per domain of influence type.
    switch (this.domainOfInfluenceType) {
      case DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_CH:
      case DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_CT:
        this.mandateAlgorithms = this.defaultMandateAlgorithms.filter(
          x =>
            x.value === ProportionalElectionMandateAlgorithm.PROPORTIONAL_ELECTION_MANDATE_ALGORITHM_HAGENBACH_BISCHOFF ||
            x.value ===
              ProportionalElectionMandateAlgorithm.PROPORTIONAL_ELECTION_MANDATE_ALGORITHM_DOUBLE_PROPORTIONAL_N_DOIS_5_DOI_OR_3_TOT_QUORUM,
        );
        break;
      case DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SK:
        this.mandateAlgorithms = this.defaultMandateAlgorithms.filter(
          x =>
            x.value ===
            ProportionalElectionMandateAlgorithm.PROPORTIONAL_ELECTION_MANDATE_ALGORITHM_DOUBLE_PROPORTIONAL_N_DOIS_5_DOI_QUORUM,
        );
        break;
      case DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU:
      case DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_BZ:
        this.mandateAlgorithms = this.defaultMandateAlgorithms.filter(
          x =>
            x.value === ProportionalElectionMandateAlgorithm.PROPORTIONAL_ELECTION_MANDATE_ALGORITHM_DOUBLE_PROPORTIONAL_1_DOI_0_DOI_QUORUM,
        );
        break;
      default:
        this.mandateAlgorithms = this.defaultMandateAlgorithms;
    }

    if (!this.data.mandateAlgorithm || this.mandateAlgorithms.some(x => x.value === this.data.mandateAlgorithm)) {
      this.trySelectInitialMandateAlgorithm();
      return;
    }

    if (!this.readonly) {
      this.data.mandateAlgorithm = ProportionalElectionMandateAlgorithm.PROPORTIONAL_ELECTION_MANDATE_ALGORITHM_UNSPECIFIED;
      this.trySelectInitialMandateAlgorithm();
      return;
    }

    const mandateAlgorithm = this.defaultMandateAlgorithms.find(m => m.value === this.data.mandateAlgorithm);
    if (!!mandateAlgorithm) {
      this.mandateAlgorithms = [...this.mandateAlgorithms, mandateAlgorithm];
    }
    this.trySelectInitialMandateAlgorithm();
  }

  private trySelectInitialMandateAlgorithm() {
    if (!this.data.mandateAlgorithm && this.mandateAlgorithms.length === 1) {
      this.data.mandateAlgorithm = this.mandateAlgorithms[0].value;
    }
  }
}
