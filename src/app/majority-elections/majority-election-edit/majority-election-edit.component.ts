/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { Location } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEqual } from 'lodash';
import { ContestService } from '../../core/contest.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { MajorityElection, newMajorityElection } from '../../core/models/majority-election.model';
import { MajorityElectionCandidatesComponent } from '../majority-election-candidates/majority-election-candidates.component';
import { MajorityElectionGeneralInformationsComponent } from '../majority-election-general-informations/majority-election-general-informations.component';

@Component({
  selector: 'app-majority-election-edit',
  templateUrl: './majority-election-edit.component.html',
})
export class MajorityElectionEditComponent implements OnInit, AfterContentChecked {
  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  @ViewChild(MajorityElectionGeneralInformationsComponent)
  public step1?: MajorityElectionGeneralInformationsComponent;

  @ViewChild(MajorityElectionCandidatesComponent)
  public step2?: MajorityElectionCandidatesComponent;

  public data: MajorityElection = newMajorityElection();
  public initialLoading: boolean = true;
  public stepLoading: boolean = false;
  public isNew: boolean = false;
  public newlyCreated: boolean = false;
  public testingPhaseEnded: boolean = false;
  public locked: boolean = false;

  private persistedData: MajorityElection = newMajorityElection();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cd: ChangeDetectorRef,
    private readonly location: Location,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly contestService: ContestService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params.majorityElectionId;
    this.isNew = !id;

    try {
      this.persistedData = this.isNew ? newMajorityElection() : await this.majorityElectionService.get(id);
      this.data = cloneDeep(this.persistedData);
      this.data.contestId = this.data.contestId || this.route.snapshot.params.contestId;

      if (!this.isNew) {
        const { testingPhaseEnded, locked } = await this.contestService.get(this.data.contestId);
        this.testingPhaseEnded = testingPhaseEnded;
        this.locked = locked;
      }
    } finally {
      this.initialLoading = false;
    }
  }

  public ngAfterContentChecked(): void {
    // prevent mat-stepper from showing other icon types, which it does by default
    this.stepper._getIndicatorType = () => 'number';
    this.cd.detectChanges();
  }

  public async saveMajorityElection(navigateBack: boolean = false): Promise<void> {
    this.stepLoading = true;

    try {
      if (!isEqual(this.data, this.persistedData)) {
        if (this.isNew) {
          this.data.id = await this.majorityElectionService.create(this.data);
        } else {
          await this.majorityElectionService.update(this.data);
        }

        this.persistedData = { ...this.data };
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      }

      this.newlyCreated = this.isNew;
      this.isNew = false;

      if (navigateBack) {
        await this.router.navigate(['../../'], { relativeTo: this.route });
        return;
      }

      this.stepper.next();

      // change URL from '/new' to '/{id}' without reloading the view
      if (this.newlyCreated) {
        const newUrl = this.router.createUrlTree(['..', this.persistedData.id], { relativeTo: this.route });
        this.location.go(newUrl.toString());
      }
    } finally {
      this.stepLoading = false;
    }
  }
}
