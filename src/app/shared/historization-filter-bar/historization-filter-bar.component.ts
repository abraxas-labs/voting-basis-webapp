/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { RadioButton } from '@abraxas/base-components';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import moment, { Moment } from 'moment';
import { TranslateService } from '../../core/translate.service';

@Component({
  selector: 'app-historization-filter-bar',
  templateUrl: './historization-filter-bar.component.html',
  styleUrls: ['./historization-filter-bar.component.scss'],
})
export class HistorizationFilterBarComponent {
  public date?: Moment;
  public statusChoices: RadioButton[];
  public isCurrentStatus: boolean = true;
  public includeDeleted: boolean = false;

  @Input()
  public includeDeletedLabel: string = 'APP.DELETED';

  @Output()
  public filterChange: EventEmitter<HistorizationFilter> = new EventEmitter<HistorizationFilter>();

  constructor(private readonly i18n: TranslateService) {
    this.statusChoices = [
      {
        value: true,
        displayText: this.i18n.instant('HISTORIZATION.CURRENT_STATUS'),
      },
      {
        value: false,
        displayText: this.i18n.instant('HISTORIZATION.STATUS_PER'),
      },
    ];
  }

  public set dateString(value: string) {
    this.date = !!value ? moment(value, true) : undefined;
    this.emitFilterChange();
  }

  public setCurrentStatus(value: boolean): void {
    this.isCurrentStatus = value;
    delete this.date;
    this.emitFilterChange();
  }

  public emitFilterChange(): void {
    this.filterChange.emit({
      date: this.date?.toDate(),
      includeDeleted: this.includeDeleted,
      useHistorizationRequests: !!this.date || this.includeDeleted,
    });
  }
}

export interface HistorizationFilter {
  date?: Date;
  includeDeleted: boolean;
  useHistorizationRequests: boolean;
}

export function newHistorizationFilter(): HistorizationFilter {
  return { includeDeleted: false, useHistorizationRequests: false };
}
