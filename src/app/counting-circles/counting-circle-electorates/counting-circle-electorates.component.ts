/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CountingCircleElectorate } from '../../core/models/counting-circle.model';
import { TranslateService } from '../../core/translate.service';
import {
  CountingCircleElectorateAssignDialogComponent,
  CountingCircleElectorateAssignDialogData,
  CountingCircleElectorateAssignDialogResult,
} from '../counting-circle-electorate-assign-dialog/counting-circle-electorate-assign-dialog.component';
import { DialogService } from '@abraxas/voting-lib';
import { flatMap } from '../../core/utils/array.utils';

@Component({
  selector: 'app-counting-circle-electorates',
  templateUrl: './counting-circle-electorates.component.html',
  styleUrls: ['./counting-circle-electorates.component.scss'],
  standalone: false,
})
export class CountingCircleElectoratesComponent {
  private electoratesValue: CountingCircleElectorate[] = [];

  public electorateLabelByIndex: Map<number, string> = new Map<number, string>();

  public get electorates(): CountingCircleElectorate[] {
    return this.electoratesValue;
  }

  @Input()
  public set electorates(v: CountingCircleElectorate[]) {
    if (v === this.electorates) {
      return;
    }

    this.electoratesValue = v;
    this.updateElectorateLabels();
  }

  @Input()
  public disabled: boolean = false;

  @Output()
  public electoratesChange: EventEmitter<CountingCircleElectorate[]> = new EventEmitter<CountingCircleElectorate[]>();

  constructor(
    private readonly i18n: TranslateService,
    private readonly dialogService: DialogService,
  ) {}

  public async assign(electorate: CountingCircleElectorate): Promise<void> {
    const disabledDoiTypes = flatMap(this.electorates.filter(e => e !== electorate).map(e => e.domainOfInfluenceTypesList));

    const data: CountingCircleElectorateAssignDialogData = {
      assignedDomainOfInfluenceTypes: electorate.domainOfInfluenceTypesList,
      disabledDomainOfInfluenceTypes: disabledDoiTypes,
    };
    const result = await this.dialogService.openForResult<
      CountingCircleElectorateAssignDialogComponent,
      CountingCircleElectorateAssignDialogResult
    >(CountingCircleElectorateAssignDialogComponent, data);

    if (!result) {
      return;
    }

    electorate.domainOfInfluenceTypesList = result.assignedDomainOfInfluenceTypes;
    this.updateInternals();
  }

  public remove(index: number): void {
    const updatedElectorates = [...this.electorates];
    updatedElectorates.splice(index, 1);
    this.electorates = updatedElectorates;
    this.updateInternals();
  }

  public add(): void {
    this.electorates = [
      ...this.electorates,
      {
        domainOfInfluenceTypesList: [],
      },
    ];
    this.updateInternals();
  }

  private updateInternals(): void {
    this.updateElectorateLabels();
    this.electoratesChange.emit(this.electorates);
  }

  private updateElectorateLabels(): void {
    this.electorateLabelByIndex = new Map<number, string>();

    for (let i = 0; i < this.electorates.length; i++) {
      const electorateLabel = this.electorates[i].domainOfInfluenceTypesList
        .map(t => this.i18n.instant('DOMAIN_OF_INFLUENCE_TYPES.' + t))
        .join(', ');
      this.electorateLabelByIndex.set(i, electorateLabel);
    }
  }
}
