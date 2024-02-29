/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { AfterContentChecked, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash';
import { CountingCircleService } from '../../core/counting-circle.service';
import { CountingCircle, CountingCirclesMerger, newCountingCirclesMerger } from '../../core/models/counting-circle.model';

@Component({
  selector: 'app-counting-circle-merger-dialog',
  templateUrl: './counting-circle-merger-dialog.component.html',
})
export class CountingCircleMergerDialogComponent implements OnInit, AfterContentChecked {
  public loading: boolean = true;
  public saving: boolean = false;
  public selectableCountingCircles: CountingCircle[] = [];
  public readonly merger: CountingCirclesMerger;
  public readonly isNew: boolean;
  public status: 'open' | 'progress' | 'complete' | 'error' = 'open';

  public currentStepSaveLabels: string[] = ['APP.NEXT', 'COMMON.SAVE'];

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  constructor(
    private readonly countingCircleService: CountingCircleService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly dialogRef: MatDialogRef<CountingCirclesMergerDialogData>,
    private readonly cd: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) data: CountingCirclesMergerDialogData,
  ) {
    if (data.entry === undefined) {
      this.isNew = true;
      this.merger = newCountingCirclesMerger();
    } else {
      this.isNew = false;
      this.merger = cloneDeep(data.entry);
    }
    this.updateStatus();
  }

  public get canSave(): boolean {
    return (
      !!this.merger.activeFrom &&
      !!this.merger.copyFromCountingCircleId &&
      !!this.merger.newCountingCircle.name &&
      !!this.merger.newCountingCircle.bfs &&
      !!this.merger.newCountingCircle.responsibleAuthority &&
      !!this.merger.newCountingCircle.responsibleAuthority.secureConnectId
    );
  }

  public get currentStepCanSave(): boolean {
    return (this.stepper?.selectedIndex ?? 0) === 0 ? this.merger.mergedCountingCircles.length >= 2 : this.canSave;
  }

  public async ngOnInit(): Promise<void> {
    try {
      this.selectableCountingCircles = await this.countingCircleService.list();
    } finally {
      this.loading = false;
    }
  }

  public ngAfterContentChecked(): void {
    // prevent mat-stepper from showing other icon types, which it does by default
    this.stepper._getIndicatorType = () => 'number';
    this.cd.detectChanges();
  }

  public async completeCurrentStep(): Promise<void> {
    const selectedStepIndex = this.stepper.selectedIndex ?? 0;
    if (selectedStepIndex === 0) {
      if (
        this.merger.copyFromCountingCircleId &&
        !this.merger.mergedCountingCircles.map(x => x.id).includes(this.merger.copyFromCountingCircleId)
      ) {
        this.merger.copyFromCountingCircleId = '';
      }

      this.stepper.next();
      return;
    }

    await this.completeGeneralInformationsStep();
  }

  public async completeGeneralInformationsStep(): Promise<void> {
    try {
      this.saving = true;

      if (this.isNew) {
        this.merger.newCountingCircle.id = await this.countingCircleService.scheduleMerger(this.merger);
      } else {
        await this.countingCircleService.updateScheduledMerger(this.merger);
      }

      this.merger.merged = this.merger.activeFrom < new Date();
      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      this.dialogRef.close(this.merger);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public updateStatus(): void {
    if (this.currentStepCanSave) {
      this.status = 'complete';
      return;
    }

    if (this.merger.mergedCountingCircles.length > 0) {
      this.status = 'progress';
      return;
    }

    this.status = 'open';
  }
}

export interface CountingCirclesMergerDialogData {
  entry?: CountingCirclesMerger;
}
