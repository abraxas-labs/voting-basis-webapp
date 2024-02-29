/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { ElectionGroupService } from '../../core/election-group.service';
import { ExportService } from '../../core/export.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { Contest } from '../../core/models/contest.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { ElectionGroup, ElectionGroupMessage } from '../../core/models/election-group.model';
import { ExportEntityType } from '../../core/models/export.model';
import { EntityState } from '../../core/models/message.model';
import { PoliticalBusinessUnionMessage } from '../../core/models/political-business-union.model';
import { PoliticalBusiness, PoliticalBusinessMessage, PoliticalBusinessType } from '../../core/models/political-business.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import { sortElectionGroups } from '../../core/utils/election-group.utils';
import { sortPoliticalBusinessUnions } from '../../core/utils/political-business-union.utils';
import { sortPoliticalBusinesses } from '../../core/utils/political-business.utils';
import { VoteService } from '../../core/vote.service';
import {
  PoliticalBusinessImportDialogComponent,
  PoliticalBusinessImportDialogData,
} from '../../shared/import/political-business-import-dialog/political-business-import-dialog.component';
import {
  SecondaryElectionCreateDialogData,
  SecondaryElectionCreateDialogResult,
  SecondaryMajorityElectionCreateDialogComponent,
} from '../../shared/secondary-majority-election-create-dialog/secondary-majority-election-create-dialog.component';
import {
  PoliticalBusinessUnionsDialogComponent,
  PoliticalBusinessUnionsDialogData,
} from '../political-business-unions-dialog/political-business-unions-dialog.component';

const POLITICAL_BUSINESS_TYPE_TO_EXPORT_ENTITY_TYPE: { [key in PoliticalBusinessType]?: ExportEntityType } = {
  [PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE]: ExportEntityType.EXPORT_ENTITY_TYPE_VOTE,
  [PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION]: ExportEntityType.EXPORT_ENTITY_TYPE_PROPORTIONAL_ELECTION,
  [PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION]: ExportEntityType.EXPORT_ENTITY_TYPE_MAJORITY_ELECTION,
};

@Component({
  selector: 'app-contest-detail',
  templateUrl: './contest-detail.component.html',
  styleUrls: ['./contest-detail.component.scss'],
})
export class ContestDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  public readonly columns = [
    'number',
    'shortDescription',
    'officialDescription',
    'domainOfInfluenceType',
    'domainOfInfluenceName',
    'type',
    'enable',
    'owner',
    'ownerDescription',
    'actions',
  ];

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  public loading: boolean = true;
  public contest: Contest = {
    politicalBusinesses: [] as PoliticalBusiness[],
  } as Contest;
  public tenantId: string = '';
  public electionGroups: ElectionGroup[] = [];
  public readonly politicalBusinessTypes: typeof PoliticalBusinessType = PoliticalBusinessType;
  public cantonDefaults?: DomainOfInfluenceCantonDefaults;
  public dataSource: MatTableDataSource<PoliticalBusiness> = new MatTableDataSource<PoliticalBusiness>();

  private tenantDomainOfInfluences: DomainOfInfluence[] = [];
  private readonly routeSubscription: Subscription;
  private detailsChangesSubscription?: Subscription;

  constructor(
    private readonly exportService: ExportService,
    private readonly auth: AuthorizationService,
    private readonly dialogService: DialogService,
    private readonly contestService: ContestService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly voteService: VoteService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly majorityElectionService: MajorityElectionService,
    private readonly secondaryMajorityElectionService: SecondaryMajorityElectionService,
    private readonly electionGroupService: ElectionGroupService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.routeSubscription = route.params.subscribe(({ contestId }) => this.load(contestId));
  }

  public async ngOnInit(): Promise<void> {
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;
    this.tenantDomainOfInfluences = await this.domainOfInfluenceService.listForTenant(this.tenantId);
  }

  public async ngOnDestroy(): Promise<void> {
    this.routeSubscription?.unsubscribe();
    this.detailsChangesSubscription?.unsubscribe();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public async createVote(): Promise<void> {
    await this.router.navigate(['votes', 'new'], { relativeTo: this.route });
  }

  public async createProportionalElection(): Promise<void> {
    await this.router.navigate(['proportional-elections', 'new'], { relativeTo: this.route });
  }

  public async createMajorityElection(): Promise<void> {
    await this.router.navigate(['majority-elections', 'new'], { relativeTo: this.route });
  }

  public async createSecondaryElection(): Promise<void> {
    const possiblePrimaryElections = this.contest.politicalBusinesses.filter(
      pb =>
        this.ownsPoliticalBusiness(pb) &&
        (pb.politicalBusinessType === PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION ||
          pb.politicalBusinessType === PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION),
    );

    const dialogData: SecondaryElectionCreateDialogData = { possiblePrimaryElections };
    const result = await this.dialogService.openForResult<
      SecondaryMajorityElectionCreateDialogComponent,
      SecondaryElectionCreateDialogResult
    >(SecondaryMajorityElectionCreateDialogComponent, dialogData);

    if (result?.secondaryElection) {
      const primaryElectionId = result.secondaryElection.primaryElectionId;
      const routeExtras: NavigationExtras = { relativeTo: this.route, queryParams: { primaryElectionId } };
      await this.router.navigate(['secondary-majority-elections', 'new'], routeExtras);
    }
  }

  public async open(row: PoliticalBusiness): Promise<void> {
    switch (row.politicalBusinessType) {
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE:
        await this.router.navigate(['votes', row.id], { relativeTo: this.route });
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION:
        await this.router.navigate(['proportional-elections', row.id], { relativeTo: this.route });
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION:
        await this.router.navigate(['majority-elections', row.id], { relativeTo: this.route });
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_SECONDARY_MAJORITY_ELECTION:
        await this.router.navigate(['secondary-majority-elections', row.id], { relativeTo: this.route });
        break;
    }
  }

  public async delete(politicalBusiness: PoliticalBusiness): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'POLITICAL_BUSINESS.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    const politicalBusinessId = politicalBusiness.id;
    switch (politicalBusiness.politicalBusinessType) {
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE:
        await this.voteService.delete(politicalBusinessId);
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION:
        await this.proportionalElectionService.delete(politicalBusinessId);
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION:
        await this.majorityElectionService.delete(politicalBusinessId);
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_SECONDARY_MAJORITY_ELECTION:
        await this.secondaryMajorityElectionService.delete(politicalBusinessId);
        break;
    }

    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
    this.removePoliticalBusinessFromUi(politicalBusiness.id);
  }

  public ownsPoliticalBusiness(politicalBusiness: PoliticalBusiness): boolean {
    return !!this.tenantDomainOfInfluences.find(doi => doi.id === politicalBusiness.domainOfInfluence.id);
  }

  public async activeStateChange(row: PoliticalBusiness, active: boolean): Promise<void> {
    switch (row.politicalBusinessType) {
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE:
        await this.voteService.updateActiveState(row.id, active);
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION:
        await this.proportionalElectionService.updateActiveState(row.id, active);
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION:
        await this.majorityElectionService.updateActiveState(row.id, active);
        break;
      case PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_SECONDARY_MAJORITY_ELECTION:
        await this.secondaryMajorityElectionService.updateActiveState(row.id, active);
        break;
    }

    row.active = active;
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
  }

  public managePoliticalBusinessUnions(): void {
    if (!this.cantonDefaults) {
      return;
    }

    const dialogData: PoliticalBusinessUnionsDialogData = {
      contest: this.contest,
      cantonDefaults: this.cantonDefaults,
    };
    this.dialogService.open(PoliticalBusinessUnionsDialogComponent, dialogData);
  }

  public importPoliticalBusinesses(): void {
    const dialogData: PoliticalBusinessImportDialogData = {
      contest: this.contest,
    };

    this.dialogService.open(PoliticalBusinessImportDialogComponent, dialogData);
  }

  public export(politicalBusiness: PoliticalBusiness): Promise<void> {
    const entityType = POLITICAL_BUSINESS_TYPE_TO_EXPORT_ENTITY_TYPE[politicalBusiness.politicalBusinessType];
    if (entityType === undefined) {
      throw new Error(`political business type ${politicalBusiness.politicalBusinessType} does not support exports`);
    }

    return this.exportService.downloadExportOrShowDialog(entityType, politicalBusiness.id);
  }

  private async load(contestId?: string): Promise<void> {
    if (!contestId) {
      return;
    }

    this.loading = true;

    try {
      this.contest = await this.contestService.get(contestId);
      this.dataSource.data = this.contest.politicalBusinesses;
      this.electionGroups = await this.electionGroupService.list(contestId);
      this.cantonDefaults = await this.domainOfInfluenceService.getCantonDefaults(this.contest.domainOfInfluenceId);
      this.startChangesListener();
    } finally {
      this.loading = false;
    }
  }

  private removePoliticalBusinessFromUi(politicalBusinessId: string): void {
    this.contest.politicalBusinesses = this.contest.politicalBusinesses.filter(pb => pb.id !== politicalBusinessId);
    this.removePoliticalBusinessFromElectionGroups(politicalBusinessId);
  }

  private removePoliticalBusinessFromElectionGroups(politicalBusinessId: string): void {
    for (const electionGroup of this.electionGroups) {
      const idIndex = electionGroup.secondaryElectionIdsList.findIndex(id => id === politicalBusinessId);
      if (idIndex >= 0) {
        electionGroup.secondaryElectionIdsList.splice(idIndex, 1);
        electionGroup.secondaryPoliticalBusinessNumbersList.splice(idIndex, 1);
      }
    }
  }

  private startChangesListener(): void {
    this.detailsChangesSubscription?.unsubscribe();

    this.detailsChangesSubscription = this.contestService.getDetailsChanges(this.contest.id).subscribe(e => {
      if (!!e.politicalBusiness) {
        this.handlePoliticalBusinessMessage(e.politicalBusiness);
        return;
      }

      if (!!e.politicalBusinessUnion) {
        this.handlePoliticalBusinessUnionMessage(e.politicalBusinessUnion);
        return;
      }

      this.handleElectionGroupMessage(e.electionGroup!);
    });
  }

  private handlePoliticalBusinessMessage(e: PoliticalBusinessMessage): void {
    const politicalBusiness = e.data;

    if (e.newEntityState === EntityState.ENTITY_STATE_DELETED) {
      this.removePoliticalBusinessFromUi(politicalBusiness.id);
      return;
    }

    const existingPbIdx = this.contest.politicalBusinesses.map(c => c.id).indexOf(politicalBusiness.id);
    if (existingPbIdx >= 0) {
      this.contest.politicalBusinesses[existingPbIdx] = politicalBusiness;
    } else {
      this.contest.politicalBusinesses.push(politicalBusiness);
    }

    sortPoliticalBusinesses(this.contest.politicalBusinesses);
    this.contest.politicalBusinesses = [...this.contest.politicalBusinesses];
  }

  private handlePoliticalBusinessUnionMessage(e: PoliticalBusinessUnionMessage): void {
    const politicalBusinessUnion = e.data;

    if (e.newEntityState === EntityState.ENTITY_STATE_DELETED) {
      this.contest.politicalBusinessUnions = this.contest.politicalBusinessUnions.filter(u => u.id !== politicalBusinessUnion.id);
      return;
    }

    const existingPbUnionIdx = this.contest.politicalBusinessUnions.map(c => c.id).indexOf(politicalBusinessUnion.id);
    if (existingPbUnionIdx >= 0) {
      this.contest.politicalBusinessUnions[existingPbUnionIdx] = politicalBusinessUnion;
      return;
    } else {
      this.contest.politicalBusinessUnions.push(politicalBusinessUnion);
    }

    sortPoliticalBusinessUnions(this.contest.politicalBusinessUnions);
    this.contest.politicalBusinessUnions = [...this.contest.politicalBusinessUnions];
  }

  private handleElectionGroupMessage(e: ElectionGroupMessage): void {
    const electionGroup = e.data;

    if (e.newEntityState === EntityState.ENTITY_STATE_DELETED) {
      this.electionGroups = this.electionGroups.filter(eg => eg.id !== electionGroup.id);
      return;
    }

    const existingElectionGroupIdx = this.electionGroups.map(eg => eg.id).indexOf(electionGroup.id);
    if (existingElectionGroupIdx >= 0) {
      this.electionGroups[existingElectionGroupIdx] = electionGroup;
    } else {
      this.electionGroups.push(electionGroup);
    }

    sortElectionGroups(this.electionGroups);
    this.electionGroups = [...this.electionGroups];
  }
}
