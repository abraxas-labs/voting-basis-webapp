/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Location } from '@angular/common';
import { AfterContentChecked, ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, isEqual } from 'lodash';
import { ContestService } from '../../core/contest.service';
import { BallotType, newVote, Vote, VoteResultEntry } from '../../core/models/vote.model';
import { VoteService } from '../../core/vote.service';
import { VoteGeneralInformationsComponent } from '../vote-general-informations/vote-general-informations.component';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { HasUnsavedChanges } from '../../core/guards/has-unsaved-changes.guard';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';

@Component({
  selector: 'app-vote-edit',
  templateUrl: './vote-edit.component.html',
  standalone: false,
})
export class VoteEditComponent implements OnInit, AfterContentChecked, HasUnsavedChanges {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  @ViewChild(VoteGeneralInformationsComponent)
  public step1?: VoteGeneralInformationsComponent;

  public data: Vote = {} as Vote;
  public initialLoading: boolean = true;
  public stepLoading: boolean = false;
  public isNew: boolean = false;
  public testingPhaseEnded: boolean = false;
  public locked: boolean = false;
  public eVoting?: boolean;
  public voteTypeImmutable: boolean = false;
  public isVariantsBallot: boolean = false;
  public contestDomainOfInfluenceDefaults: DomainOfInfluenceCantonDefaults = {} as DomainOfInfluenceCantonDefaults;
  public hasChanges: boolean = false;
  public canEdit: boolean = false;

  private persistedData: Vote = {} as Vote;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cd: ChangeDetectorRef,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly location: Location,
    private readonly voteService: VoteService,
    private readonly contestService: ContestService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly dialogService: DialogService,
    private readonly permissionService: PermissionService,
  ) {}

  public async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.params.voteId;
    this.isNew = !id;

    try {
      this.persistedData = this.isNew ? newVote() : await this.voteService.get(id);
      this.data = cloneDeep(this.persistedData);
      this.data.contestId = this.data.contestId || this.route.snapshot.params.contestId;
      this.refreshIsVariantsBallot();

      const { testingPhaseEnded, locked, eVoting, domainOfInfluenceId } = await this.contestService.get(this.data.contestId);
      this.testingPhaseEnded = testingPhaseEnded;
      this.locked = locked || !!this.data.eVotingApproved;
      this.eVoting = eVoting;
      this.voteTypeImmutable = this.data.ballots.length > 0 && this.data.ballots.some(b => !!b.id);
      this.canEdit = await this.permissionService.hasPermission(Permissions.Vote.Update);
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

  public get hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  public async submitVote(): Promise<void> {
    this.stepLoading = true;

    try {
      if (this.hasChanges && this.canEdit) {
        if (this.isNew) {
          this.data.id = await this.voteService.create(this.data);
        } else {
          await this.voteService.update(this.data);
        }
        this.persistedData = cloneDeep(this.data);
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
        this.hasChanges = false;
      }

      const newlyCreated = this.isNew;
      this.isNew = false;
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

  public async submitBallots(): Promise<void> {
    this.stepLoading = true;
    const ballotIds = this.data.ballots.map(b => b.id);
    this.data.ballots = this.data.ballots.map(ballot => {
      return { ...ballot, voteId: this.data.id };
    });

    const ballotsToCreate = this.data.ballots.filter(b => !b.id);
    const ballotsToDelete = this.persistedData.ballots.filter(pb => !ballotIds.includes(pb.id));
    const ballotsToUpdate = this.data.ballots.filter(b => {
      if (!b.id || ballotsToDelete.includes(b)) {
        return false;
      }

      const persistedBallot = this.persistedData.ballots.find(pb => pb.id === b.id);
      return !isEqual(persistedBallot, b);
    });

    try {
      const wasVariantsBallot = this.isVariantsBallot;
      this.refreshIsVariantsBallot();
      const isVariantsBallotChanged = this.isVariantsBallot !== wasVariantsBallot;
      if (isVariantsBallotChanged && !this.isVariantsBallot) {
        await this.setResultEntryToFinalResultsAndUpdateEnforceForCountingCircles();
      }

      if (this.data.type !== this.persistedData.type) {
        await this.voteService.update(this.data);
        this.persistedData = cloneDeep(this.data);
      }

      for (const ballot of ballotsToDelete) {
        await this.voteService.deleteBallot(ballot.id, ballot.voteId);
      }

      for (const ballot of ballotsToUpdate) {
        await this.voteService.updateBallot(ballot);
      }

      for (const ballot of ballotsToCreate) {
        ballot.id = await this.voteService.createBallot(ballot);
        this.voteTypeImmutable = true;
      }

      const deletedBallotIds = ballotsToDelete.map(b => b.id);

      this.data.ballots = this.data.ballots.filter(b => !deletedBallotIds.includes(b.id));
      this.persistedData.ballots = cloneDeep(this.data.ballots);

      // trigger angular change detection
      // since the vote is updated in step 2 in subcomponents
      this.data = { ...this.data };

      if (isVariantsBallotChanged && this.isVariantsBallot) {
        await this.setResultEntryToFinalResultsAndUpdateEnforceForCountingCircles();
      }

      if (ballotsToDelete.length > 0 || ballotsToUpdate.length > 0 || ballotsToCreate.length > 0) {
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
        this.hasChanges = false;
      }

      this.stepper.next();
    } finally {
      this.stepLoading = false;
    }
  }

  public async submitErfassungInformations(): Promise<void> {
    this.stepLoading = true;

    try {
      if (this.hasChanges) {
        await this.voteService.update(this.data);
        this.persistedData = cloneDeep(this.data);
        this.snackbarService.success(this.i18n.instant('APP.SAVED'));
        this.hasChanges = false;
      }

      await this.router.navigate(['../../'], { relativeTo: this.route });
    } finally {
      this.stepLoading = false;
    }
  }

  public contentChanged(): void {
    this.hasChanges = !isEqual(this.data, this.persistedData);
  }

  public async back(): Promise<void> {
    if (this.hasChanges && !(await this.confirmToLeaveWithUnsavedChanges())) {
      return;
    }

    this.stepper.previous();
  }

  private async confirmToLeaveWithUnsavedChanges(): Promise<boolean> {
    return await this.dialogService.confirm('APP.CHANGES.TITLE', this.i18n.instant('APP.CHANGES.MSG'), 'APP.YES');
  }

  private refreshIsVariantsBallot(): void {
    // eslint-disable-next-line
    // according to https://jira.abraxas-tools.ch/jira/browse/VOTING-1169?focusedCommentId=640226&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-640226
    this.isVariantsBallot = this.data.ballots.length === 1 && this.data.ballots[0].ballotType === BallotType.BALLOT_TYPE_VARIANTS_BALLOT;
  }

  private async setResultEntryToFinalResultsAndUpdateEnforceForCountingCircles(): Promise<void> {
    this.data.resultEntry = VoteResultEntry.VOTE_RESULT_ENTRY_FINAL_RESULTS;
    this.data.enforceResultEntryForCountingCircles = !this.isVariantsBallot;

    await this.voteService.update(this.data);
    this.persistedData = cloneDeep(this.data);
  }
}
