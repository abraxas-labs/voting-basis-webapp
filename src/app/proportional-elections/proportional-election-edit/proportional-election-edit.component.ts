/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { Location } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEqual } from 'lodash';
import { ContestService } from '../../core/contest.service';
import { newProportionalElection, ProportionalElection } from '../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { ProportionalElectionGeneralInformationsComponent } from '../proportional-election-general-informations/proportional-election-general-informations.component';
import { ProportionalElectionListsComponent } from '../proportional-election-lists/proportional-election-lists.component';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';

@Component({
  selector: 'app-proportional-election-edit',
  templateUrl: './proportional-election-edit.component.html',
})
export class ProportionalElectionEditComponent implements OnInit, AfterContentChecked {
  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  @ViewChild(ProportionalElectionGeneralInformationsComponent)
  public step1?: ProportionalElectionGeneralInformationsComponent;

  @ViewChild(ProportionalElectionListsComponent)
  public step2?: ProportionalElectionListsComponent;

  public data: ProportionalElection = newProportionalElection();
  public initialLoading: boolean = true;
  public stepLoading: boolean = false;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public locked: boolean = false;
  public contestDomainOfInfluenceDefaults: DomainOfInfluenceCantonDefaults = {} as DomainOfInfluenceCantonDefaults;

  private persistedData: ProportionalElection = newProportionalElection();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cd: ChangeDetectorRef,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly location: Location,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly contestService: ContestService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params.proportionalElectionId;
    this.isNew = !id;

    try {
      this.persistedData = this.isNew ? newProportionalElection() : await this.proportionalElectionService.get(id);
      this.data = cloneDeep(this.persistedData);
      this.data.contestId = this.data.contestId || this.route.snapshot.params.contestId;

      const { testingPhaseEnded, locked, domainOfInfluenceId } = await this.contestService.get(this.data.contestId);
      this.testingPhaseEnded = testingPhaseEnded;
      this.locked = locked;
      this.contestDomainOfInfluenceDefaults = await this.domainOfInfluenceService.getCantonDefaults(domainOfInfluenceId);
    } finally {
      this.initialLoading = false;
    }
  }

  public ngAfterContentChecked(): void {
    // prevent mat-stepper from showing other icon types, which it does by default
    this.stepper._getIndicatorType = () => 'number';
    this.cd.detectChanges();
  }

  public async saveProportionalElection(navigateBack: boolean = false): Promise<void> {
    this.stepLoading = true;

    try {
      if (!isEqual(this.data, this.persistedData)) {
        if (this.isNew) {
          this.data.id = await this.proportionalElectionService.create(this.data);
        } else {
          await this.proportionalElectionService.update(this.data);
        }

        this.persistedData = { ...this.data };
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      }

      const newlyCreated = this.isNew;
      this.isNew = false;

      if (navigateBack) {
        await this.router.navigate(['../../'], { relativeTo: this.route });
        return;
      }

      this.stepper.next();

      // change URL from '/new' to '/{id}' without reloading the view
      if (newlyCreated) {
        const newUrl = this.router.createUrlTree(['..', this.persistedData.id], { relativeTo: this.route });
        this.location.go(newUrl.toString());
      }
    } finally {
      this.stepLoading = false;
    }
  }
}
