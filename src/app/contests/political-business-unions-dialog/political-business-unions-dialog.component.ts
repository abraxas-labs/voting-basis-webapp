/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService } from '@abraxas/base-components';
import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { MajorityElectionUnionService } from '../../core/majority-election-union.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { Contest } from '../../core/models/contest.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import {
  newPoliticalBusinessUnion,
  PoliticalBusinessUnion,
  PoliticalBusinessUnionType,
} from '../../core/models/political-business-union.model';
import { PoliticalBusiness } from '../../core/models/political-business.model';
import { ProportionalElectionUnionService } from '../../core/proportional-election-union.service';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { sortPoliticalBusinessUnions } from '../../core/utils/political-business-union.utils';
import {
  PoliticalBusinessUnionEditDialogComponent,
  PoliticalBusinessUnionEditDialogData,
  PoliticalBusinessUnionEditDialogResult,
} from '../political-business-union-edit-dialog/political-business-union-edit-dialog.component';
import {
  PoliticalBusinessUnionEntriesEditDialogComponent,
  PoliticalBusinessUnionEntriesEditDialogData,
  PoliticalBusinessUnionEntriesEditDialogResult,
} from '../political-business-union-entries-edit-dialog/political-business-union-entries-edit-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-political-business-unions-dialog',
  templateUrl: './political-business-unions-dialog.component.html',
  styleUrls: ['./political-business-unions-dialog.component.scss'],
})
export class PoliticalBusinessUnionsDialogComponent implements OnInit {
  public readonly columns = ['description', 'type', 'owner', 'actions'];
  public readonly PoliticalBusinessUnionType: typeof PoliticalBusinessUnionType = PoliticalBusinessUnionType;

  public tenantId: string = '';
  public contest: Contest;
  public cantonDefaults: DomainOfInfluenceCantonDefaults;
  public politicalBusinessUnions: PoliticalBusinessUnion[] = [];
  public domainOfInfluences: DomainOfInfluence[] = [];

  public selectedPoliticalBusinessUnion?: PoliticalBusinessUnion;

  public selectableProportionalElections: PoliticalBusiness[] = [];
  public selectableMajorityElections: PoliticalBusiness[] = [];
  public disabled: boolean = false;

  public loading: boolean = true;

  constructor(
    private readonly proportionalElectionUnionService: ProportionalElectionUnionService,
    private readonly majorityElectionUnionService: MajorityElectionUnionService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly dialogRef: MatDialogRef<PoliticalBusinessUnionsDialogData>,
    private readonly auth: AuthorizationService,
    @Inject(MAT_DIALOG_DATA) dialogData: PoliticalBusinessUnionsDialogData,
  ) {
    this.contest = dialogData.contest;
    this.cantonDefaults = dialogData.cantonDefaults;
    this.disabled = this.contest.testingPhaseEnded;
    this.politicalBusinessUnions = this.contest.politicalBusinessUnions;
  }

  public async ngOnInit(): Promise<void> {
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;

    await this.loadData();
  }

  public async createPoliticalBusinessUnion(): Promise<void> {
    const newUnion = newPoliticalBusinessUnion(this.contest.id, this.cantonDefaults.enabledPoliticalBusinessUnionTypesList);

    const dialogData: PoliticalBusinessUnionEditDialogData = {
      politicalBusinessUnion: { ...newUnion },
      enabledPoliticalBusinessUnionTypes: this.cantonDefaults.enabledPoliticalBusinessUnionTypesList,
    };

    const result = await this.dialogService.openForResult<
      PoliticalBusinessUnionEditDialogComponent,
      PoliticalBusinessUnionEditDialogResult
    >(PoliticalBusinessUnionEditDialogComponent, dialogData);
    this.handleCreatePoliticalBusinessUnion(result?.politicalBusinessUnion);
  }

  public async editPoliticalBusinessUnion(politicalBusinessUnion: PoliticalBusinessUnion): Promise<void> {
    const dialogData: PoliticalBusinessUnionEditDialogData = {
      politicalBusinessUnion: { ...politicalBusinessUnion },
      enabledPoliticalBusinessUnionTypes: this.cantonDefaults.enabledPoliticalBusinessUnionTypesList,
    };
    const result = await this.dialogService.openForResult<
      PoliticalBusinessUnionEditDialogComponent,
      PoliticalBusinessUnionEditDialogResult
    >(PoliticalBusinessUnionEditDialogComponent, dialogData);
    this.handleEditPoliticalBusinessUnion(result?.politicalBusinessUnion);
  }

  public async updateAssignedPoliticalBusinesses(): Promise<void> {
    if (!this.selectedPoliticalBusinessUnion) {
      return;
    }

    const selectablePoliticalBusinesses =
      this.selectedPoliticalBusinessUnion.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION
        ? this.selectableProportionalElections
        : this.selectableMajorityElections;

    // selectedPoliticalBusiness are set by the detail tab
    const dialogData: PoliticalBusinessUnionEntriesEditDialogData = {
      politicalBusinessUnion: { ...this.selectedPoliticalBusinessUnion },
      selectablePoliticalBusinesses,
    };

    const result = await this.dialogService.openForResult<
      PoliticalBusinessUnionEntriesEditDialogComponent,
      PoliticalBusinessUnionEntriesEditDialogResult
    >(PoliticalBusinessUnionEntriesEditDialogComponent, dialogData);

    this.handleUpdateAssignedPoliticalBusinesses(result?.politicalBusinessUnion);
  }

  public async deletePoliticalBusinessUnion(politicalBusinessUnion: PoliticalBusinessUnion): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'POLITICAL_BUSINESS_UNION.CONFIRM_DELETE', 'APP.DELETE');

    if (!shouldDelete) {
      return;
    }

    politicalBusinessUnion.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION
      ? await this.proportionalElectionUnionService.delete(politicalBusinessUnion.id)
      : await this.majorityElectionUnionService.delete(politicalBusinessUnion.id);

    this.politicalBusinessUnions = this.politicalBusinessUnions.filter(u => u.id !== politicalBusinessUnion.id);
    this.contest.politicalBusinessUnions = this.politicalBusinessUnions;
    this.selectedPoliticalBusinessUnion = undefined;
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async selectPoliticalBusinessUnion(row: PoliticalBusinessUnion): Promise<void> {
    this.selectedPoliticalBusinessUnion = row;
  }

  public close(): void {
    this.dialogRef.close();
  }

  private async loadData(): Promise<void> {
    try {
      this.selectableProportionalElections = this.proportionalElectionService.mapToPoliticalBusinesses(
        await this.proportionalElectionService.list(this.contest.id),
      );
      this.selectableMajorityElections = this.majorityElectionService.mapToPoliticalBusinesses(
        await this.majorityElectionService.list(this.contest.id),
      );
      this.domainOfInfluences = await this.domainOfInfluenceService.listForPoliticalBusiness(this.contest.domainOfInfluenceId);

      // It's possible that a pb.domainOfInfluence has only a id property, because we map them
      // from election to politicalBusiness. On elections we don't have a domainOfInfluence object per default
      for (const pb of this.selectableProportionalElections) {
        pb.domainOfInfluence = this.domainOfInfluences.find(doi => doi.id === pb.domainOfInfluence.id) ?? pb.domainOfInfluence;
      }
      for (const pb of this.selectableMajorityElections) {
        pb.domainOfInfluence = this.domainOfInfluences.find(doi => doi.id === pb.domainOfInfluence.id) ?? pb.domainOfInfluence;
      }
    } finally {
      this.loading = false;
    }
  }

  private handleCreatePoliticalBusinessUnion(politicalBusinessUnion?: PoliticalBusinessUnion): void {
    if (!politicalBusinessUnion) {
      return;
    }

    if (!this.politicalBusinessUnions.find(u => u.id === politicalBusinessUnion.id)) {
      this.politicalBusinessUnions.push(politicalBusinessUnion);
    }

    this.sortAndRefreshPoliticalBusinessUnions();
  }

  private handleEditPoliticalBusinessUnion(politicalBusinessUnion?: PoliticalBusinessUnion): void {
    if (!politicalBusinessUnion) {
      return;
    }

    const updatedPoliticalBusinessUnion = this.politicalBusinessUnions.find(u => u.id === politicalBusinessUnion.id);
    if (!updatedPoliticalBusinessUnion) {
      return;
    }

    updatedPoliticalBusinessUnion.description = politicalBusinessUnion.description;
    this.sortAndRefreshPoliticalBusinessUnions();
  }

  private handleUpdateAssignedPoliticalBusinesses(politicalBusinessUnion?: PoliticalBusinessUnion): void {
    if (!politicalBusinessUnion || !politicalBusinessUnion.politicalBusinesses || !this.selectedPoliticalBusinessUnion) {
      return;
    }
    this.selectedPoliticalBusinessUnion.politicalBusinesses = politicalBusinessUnion.politicalBusinesses;

    // trigger cd and reset tabs
    this.selectedPoliticalBusinessUnion = { ...this.selectedPoliticalBusinessUnion };
    this.selectedPoliticalBusinessUnion.candidates = undefined;
  }

  private sortAndRefreshPoliticalBusinessUnions(): void {
    sortPoliticalBusinessUnions(this.politicalBusinessUnions);
    this.politicalBusinessUnions = [...this.politicalBusinessUnions];
    this.contest.politicalBusinessUnions = this.politicalBusinessUnions;
  }
}

export interface PoliticalBusinessUnionsDialogData {
  contest: Contest;
  cantonDefaults: DomainOfInfluenceCantonDefaults;
}
