/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PaginatorComponent, TableDataSource } from '@abraxas/base-components';
import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { AfterViewInit, Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomainOfInfluenceCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { ComparisonCountOfVotersCategory } from '../../core/models/plausibilisation.model';

@Component({
  selector: 'app-comparison-count-of-voters-counting-circle-assign-dialog',
  templateUrl: './comparison-count-of-voters-counting-circle-assign-dialog.component.html',
})
export class ComparisonCountOfVotersCountingCircleAssignDialogComponent implements AfterViewInit {
  public readonly translationPrefix: string = 'DOMAIN_OF_INFLUENCE.AUSMITTLUNG.PLAUSIBILISATION_CONFIGURATION.';
  public readonly dataSource = new TableDataSource<ComparisonCountOfVotersCountingCircleTableItem>();
  public readonly categoryItems: EnumItemDescription<ComparisonCountOfVotersCategory>[] = [];
  public readonly readonly: boolean;
  public readonly columns = ['name', 'category'];

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  public domainOfInfluence!: DomainOfInfluence;

  constructor(
    public readonly dialogRef: MatDialogRef<ComparisonCountOfVotersCountingCircleAssignDialogData>,
    enumUtil: EnumUtil,
    @Inject(MAT_DIALOG_DATA) dialogData: ComparisonCountOfVotersCountingCircleAssignDialogData,
  ) {
    this.domainOfInfluence = dialogData.domainOfInfluence;
    this.readonly = dialogData.readonly;

    const ccCategoryEntries =
      dialogData.domainOfInfluence.plausibilisationConfiguration?.comparisonCountOfVotersCountingCircleEntriesList ?? [];
    this.dataSource.data = (dialogData.domainOfInfluence.countingCircles ?? []).map(cc => ({
      ...cc,
      category: ccCategoryEntries.find(x => x.countingCircleId === cc.id)?.category,
    }));

    this.categoryItems = enumUtil.getArrayWithDescriptions<ComparisonCountOfVotersCategory>(
      ComparisonCountOfVotersCategory,
      this.translationPrefix + 'COMPARISON_COUNT_OF_VOTERS_CONFIGURATION.CATEGORIES.',
    );
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public apply(): void {
    if (!this.readonly && !!this.domainOfInfluence.plausibilisationConfiguration) {
      this.domainOfInfluence.plausibilisationConfiguration.comparisonCountOfVotersCountingCircleEntriesList = this.dataSource.data
        .filter(x => !!x.category)
        .map(x => ({ countingCircleId: x.id, category: x.category! }));
    }

    this.dialogRef.close();
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface ComparisonCountOfVotersCountingCircleAssignDialogData {
  domainOfInfluence: DomainOfInfluence;
  readonly: boolean;
}

interface ComparisonCountOfVotersCountingCircleTableItem extends DomainOfInfluenceCountingCircle {
  category?: ComparisonCountOfVotersCategory;
}
