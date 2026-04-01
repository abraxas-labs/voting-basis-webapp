/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEqual } from 'lodash';
import { ContestService } from '../../core/contest.service';
import { newSecondaryMajorityElection, SecondaryMajorityElection } from '../../core/models/secondary-majority-election.model';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { MajorityElectionService } from '../../core/majority-election.service';
import { Permissions } from '../../core/models/permissions.model';
import { PermissionService } from '../../core/permission.service';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';

@Component({
  selector: 'app-secondary-majority-election-edit',
  templateUrl: './secondary-majority-election-edit.component.html',
  standalone: false,
})
export class SecondaryMajorityElectionEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslateService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly location = inject(Location);
  private readonly majorityElectionService = inject(MajorityElectionService);
  private readonly secondaryMajorityElectionService = inject(SecondaryMajorityElectionService);
  private readonly contestService = inject(ContestService);
  private readonly doiService = inject(DomainOfInfluenceService);
  private readonly permissionService = inject(PermissionService);

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  public data: SecondaryMajorityElection = newSecondaryMajorityElection();
  public initialLoading: boolean = true;
  public stepLoading: boolean = false;
  public isNew: boolean = false;
  public newlyCreated: boolean = false;
  public testingPhaseEnded: boolean = false;
  public eVoting: boolean = false;
  public locked: boolean = false;
  public eVotingApproved: boolean = false;
  public eVotingEverApproved: boolean = false;
  public contestDomainOfInfluenceDefaults: DomainOfInfluenceCantonDefaults = {} as DomainOfInfluenceCantonDefaults;
  public domainOfInfluence?: DomainOfInfluence;
  public parties: DomainOfInfluenceParty[] = [];
  private persistedData: SecondaryMajorityElection = newSecondaryMajorityElection();
  private readonly dialogService = inject(DialogService);
  public canEdit: boolean = false;

  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params.secondaryMajorityElectionId;
    const contestId = this.route.snapshot.params.contestId;
    this.isNew = !id;

    try {
      if (this.isNew) {
        this.persistedData.primaryMajorityElectionId = this.route.snapshot.queryParams.primaryElectionId;
      } else {
        this.persistedData = await this.secondaryMajorityElectionService.get(id);
      }

      const { testingPhaseEnded, locked, eVoting } = await this.contestService.get(contestId);
      this.testingPhaseEnded = testingPhaseEnded;
      this.eVotingApproved = !!this.persistedData.eVotingApproved;
      this.eVotingEverApproved = this.persistedData.eVotingEverApproved;
      this.locked = locked;
      this.canEdit = await this.permissionService.hasPermission(Permissions.SecondaryMajorityElection.Update);
      this.eVoting = eVoting;

      const primaryMajorityElection = await this.majorityElectionService.get(this.persistedData.primaryMajorityElectionId);
      this.contestDomainOfInfluenceDefaults = await this.doiService.getCantonDefaults(primaryMajorityElection.domainOfInfluenceId);
      this.domainOfInfluence = await this.doiService.get(primaryMajorityElection.domainOfInfluenceId);
      this.parties = this.domainOfInfluence.parties;
      if (this.isNew) {
        this.persistedData.isOnSeparateBallot = this.contestDomainOfInfluenceDefaults.secondaryMajorityElectionOnSeparateBallot;
      }

      this.data = cloneDeep(this.persistedData);
    } finally {
      this.initialLoading = false;
    }
  }

  public async save(): Promise<void> {
    this.stepLoading = true;

    try {
      if (!isEqual(this.data, this.persistedData)) {
        if (this.isNew) {
          this.data.id = await this.secondaryMajorityElectionService.create(this.data);
        } else {
          await this.secondaryMajorityElectionService.update(this.data);
        }

        this.persistedData = { ...this.data };
        // trigger angular change detection
        this.data = { ...this.data };
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      }

      this.newlyCreated = this.isNew;
      this.isNew = false;
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

  public async navigateToContestDetail(): Promise<void> {
    const confirm = await this.dialogService.confirm(
      'MAJORITY_ELECTION.FINISH_CANDIDATE_EDIT_STEP_NOTE.TITLE',
      'MAJORITY_ELECTION.FINISH_CANDIDATE_EDIT_STEP_NOTE.TEXT',
    );
    if (!confirm) {
      return;
    }
    await this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
