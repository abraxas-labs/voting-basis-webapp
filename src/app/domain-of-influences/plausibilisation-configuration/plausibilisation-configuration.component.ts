/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomainOfInfluenceCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import {
  ComparisonCountOfVotersCategory,
  ComparisonVoterParticipationConfiguration,
  newComparisonCountOfVotersConfiguration,
  newPlausibilisationConfiguration,
  PlausibilisationConfiguration,
} from '../../core/models/plausibilisation.model';
import { groupBy } from '../../core/utils/array.utils';
import {
  ComparisonCountOfVotersCountingCircleAssignDialogComponent,
  ComparisonCountOfVotersCountingCircleAssignDialogData,
} from '../comparison-count-of-voters-counting-circle-assign-dialog/comparison-count-of-voters-counting-circle-assign-dialog.component';

@Component({
  selector: 'app-plausibilisation-configuration',
  templateUrl: './plausibilisation-configuration.component.html',
  styleUrls: ['./plausibilisation-configuration.component.scss'],
})
export class PlausibilisationConfigurationComponent {
  public readonly translationPrefix: string = 'DOMAIN_OF_INFLUENCE.AUSMITTLUNG.PLAUSIBILISATION_CONFIGURATION.';
  public plausiConfig!: PlausibilisationConfiguration;
  public domainOfInfluenceTypeItems: EnumItemDescription<DomainOfInfluenceType>[] = [];
  public countingCirclesByCategory: Partial<Record<any, ComparisonCountOfVotersCountingCircle[]>> = {};

  @Input()
  public disabled: boolean = false;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  private domainOfInfluenceValue!: DomainOfInfluence;
  private domainOfInfluenceTypeValue!: DomainOfInfluenceType;

  constructor(
    private readonly enumUtil: EnumUtil,
    public readonly dialogService: DialogService,
  ) {}

  public get domainOfInfluence(): DomainOfInfluence {
    return this.domainOfInfluenceValue;
  }

  @Input()
  public set domainOfInfluence(v: DomainOfInfluence) {
    if (v === this.domainOfInfluenceValue) {
      return;
    }

    v.plausibilisationConfiguration = v.plausibilisationConfiguration ?? newPlausibilisationConfiguration();
    this.domainOfInfluenceValue = v;
    this.plausiConfig = v.plausibilisationConfiguration;
    this.updateCountingCirclesByCategory();
  }

  @Input()
  public set domainOfInfluenceType(v: DomainOfInfluenceType) {
    if (this.domainOfInfluenceTypeValue === v) {
      return;
    }

    this.domainOfInfluenceTypeItems = this.enumUtil.getArrayWithDescriptions<DomainOfInfluenceType>(
      DomainOfInfluenceType,
      'DOMAIN_OF_INFLUENCE.TYPES.',
    );

    this.domainOfInfluenceTypeValue = v;
  }

  public addVoterParticipationConfiguration(): void {
    this.plausiConfig.comparisonVoterParticipationConfigurationsList = [
      ...this.plausiConfig.comparisonVoterParticipationConfigurationsList,
      newComparisonCountOfVotersConfiguration(),
    ];
  }

  public removeVoterParticipationConfiguration(config: ComparisonVoterParticipationConfiguration): void {
    this.plausiConfig.comparisonVoterParticipationConfigurationsList =
      this.plausiConfig.comparisonVoterParticipationConfigurationsList.filter(x => x !== config);
  }

  public async openAssignCountOfVoterCountingCirclesDialog(): Promise<void> {
    const data: ComparisonCountOfVotersCountingCircleAssignDialogData = {
      domainOfInfluence: this.domainOfInfluence,
      disabled: this.disabled,
    };

    await this.dialogService.openForResult(ComparisonCountOfVotersCountingCircleAssignDialogComponent, data);
    this.updateCountingCirclesByCategory();
    this.contentChanged.emit();
  }

  private updateCountingCirclesByCategory(): void {
    if (!this.domainOfInfluence.countingCircles) {
      this.countingCirclesByCategory = {};
      return;
    }

    const comparisonCcs = this.domainOfInfluence.countingCircles.map(cc => ({
      ...cc,
      category:
        this.plausiConfig.comparisonCountOfVotersCountingCircleEntriesList.find(x => x.countingCircleId === cc.id)?.category ??
        ComparisonCountOfVotersCategory.COMPARISON_COUNT_OF_VOTERS_CATEGORY_UNSPECIFIED,
    }));

    this.countingCirclesByCategory = groupBy(
      comparisonCcs,
      x => x.category,
      x => x,
    );
  }
}

interface ComparisonCountOfVotersCountingCircle extends DomainOfInfluenceCountingCircle {
  category: ComparisonCountOfVotersCategory;
}
