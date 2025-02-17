/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, FilterDirective, PaginatorComponent, SortDirective, TableDataSource } from '@abraxas/base-components';
import { DialogService, EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { ExportService } from '../../core/export.service';
import { MajorityElectionService } from '../../core/majority-election.service';
import { DomainOfInfluenceCantonDefaults } from '../../core/models/canton-settings.model';
import { Contest } from '../../core/models/contest.model';
import { DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { ExportEntityType } from '../../core/models/export.model';
import { EntityState } from '../../core/models/message.model';
import { PoliticalBusinessUnion, PoliticalBusinessUnionMessage } from '../../core/models/political-business-union.model';
import {
  PoliticalBusiness,
  PoliticalBusinessMessage,
  PoliticalBusinessSubType,
  PoliticalBusinessSummary,
  PoliticalBusinessType,
} from '../../core/models/political-business.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import { sortPoliticalBusinessUnions } from '../../core/utils/political-business-union.utils';
import { VoteService } from '../../core/vote.service';
import {
  PoliticalBusinessImportDialogComponent,
  PoliticalBusinessImportDialogData,
} from '../../shared/import/political-business-import-dialog/political-business-import-dialog.component';
import {
  PoliticalBusinessUnionsDialogComponent,
  PoliticalBusinessUnionsDialogData,
} from '../political-business-unions-dialog/political-business-unions-dialog.component';
import { LanguageService } from '../../core/language.service';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';
import { ElectionGroup, ElectionGroupMessage } from '../../core/models/election-group.model';

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
  public readonly originalColumns = [
    'number',
    'politicalBusinessUnionDescription',
    'electionGroupNumber',
    'domainOfInfluenceType',
    'shortDescription',
    'domainOfInfluenceName',
    'type',
    'active',
    'owner',
    'actions',
  ];

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  @ViewChild(FilterDirective, { static: true })
  public filter!: FilterDirective;

  public loading: boolean = true;
  public contest: Contest = {
    politicalBusinesses: [] as PoliticalBusiness[],
  } as Contest;
  public tenantId: string = '';
  public readonly politicalBusinessTypes: typeof PoliticalBusinessType = PoliticalBusinessType;
  public politicalBusinessTypeList: EnumItemDescription<PoliticalBusinessType>[] = [];
  public domainOfInfluenceTypeList: EnumItemDescription<DomainOfInfluenceType>[] = [];
  public cantonDefaults?: DomainOfInfluenceCantonDefaults;
  public dataSource = new TableDataSource<PoliticalBusinessListType>();
  public hasAdminReadPermissions = false;
  public hasAdminWritePermissions = false;
  public hasSameTenantReadPermissions = false;
  public hasSameTenantWritePermissions = false;
  public politicalBusinessSummaries: PoliticalBusinessSummary[] = [];
  public columns = [...this.originalColumns];
  public activeToggled: boolean = false;

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
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly languageService: LanguageService,
    private readonly enumUtil: EnumUtil,
    private readonly permissionService: PermissionService,
  ) {
    this.routeSubscription = route.params.subscribe(({ contestId }) => this.load(contestId));
  }

  public async ngOnInit(): Promise<void> {
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;
    this.politicalBusinessTypeList = this.enumUtil.getArrayWithDescriptions<PoliticalBusinessType>(
      PoliticalBusinessType,
      'POLITICAL_BUSINESS.TYPE.',
    );
    this.domainOfInfluenceTypeList = this.enumUtil.getArrayWithDescriptions<DomainOfInfluenceType>(
      DomainOfInfluenceType,
      'DOMAIN_OF_INFLUENCE.TYPES.',
    );
  }

  public async ngOnDestroy(): Promise<void> {
    this.routeSubscription?.unsubscribe();
    this.detailsChangesSubscription?.unsubscribe();
  }

  public isSelectionDisabled = (row: PoliticalBusinessListType): boolean => {
    return !this.hasAdminReadPermissions && row.ownerId !== this.tenantId;
  };

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filter;
    this.dataSource.sort = this.sort;
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

  public async createSecondaryElection(primaryElectionId: string): Promise<void> {
    const routeExtras: NavigationExtras = { relativeTo: this.route, queryParams: { primaryElectionId } };
    await this.router.navigate(['secondary-majority-elections', 'new'], routeExtras);
  }

  public async open(row: PoliticalBusinessListType): Promise<void> {
    if (row.ownerId !== this.tenantId && !this.hasAdminReadPermissions) {
      return;
    }

    switch (row.type) {
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

  public async delete(politicalBusiness: PoliticalBusinessListType): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'POLITICAL_BUSINESS.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    const politicalBusinessId = politicalBusiness.id;
    switch (politicalBusiness.type) {
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

  public async activeStateChange(row: PoliticalBusinessListType, active: boolean): Promise<void> {
    this.activeToggled = true;
    switch (row.type) {
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

  public export(politicalBusiness: PoliticalBusinessListType): Promise<void> {
    const entityType = POLITICAL_BUSINESS_TYPE_TO_EXPORT_ENTITY_TYPE[politicalBusiness.type];
    if (entityType === undefined) {
      throw new Error(`political business type ${politicalBusiness.type} does not support exports`);
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
      this.politicalBusinessSummaries = await this.contestService.listPoliticalBusinessSummaries(contestId);
      this.updatePoliticalBusinessesList();

      this.cantonDefaults = await this.domainOfInfluenceService.getCantonDefaults(this.contest.domainOfInfluenceId);
      this.hasAdminReadPermissions = await this.permissionService.hasPermission(Permissions.PoliticalBusiness.ReadActionsTenantSameCanton);
      this.hasAdminWritePermissions = await this.permissionService.hasPermission(
        Permissions.PoliticalBusiness.WriteActionsTenantSameCanton,
      );
      this.hasSameTenantReadPermissions = await this.permissionService.hasPermission(Permissions.PoliticalBusiness.ReadActionsSameTenant);
      this.hasSameTenantWritePermissions = await this.permissionService.hasPermission(Permissions.PoliticalBusiness.WriteActionsSameTenant);
      this.startChangesListener();
    } finally {
      this.loading = false;
    }
  }

  private removePoliticalBusinessFromUi(politicalBusinessId: string): void {
    this.contest.politicalBusinesses = this.contest.politicalBusinesses.filter(pb => pb.id !== politicalBusinessId);
    this.politicalBusinessSummaries = this.politicalBusinessSummaries.filter(pb => pb.id !== politicalBusinessId);
    this.updatePoliticalBusinessesList();
  }

  private startChangesListener(): void {
    this.detailsChangesSubscription?.unsubscribe();

    this.detailsChangesSubscription = this.contestService.getDetailsChanges(this.contest.id).subscribe(e => {
      // toggle the switch should not refresh the table
      if (this.activeToggled) {
        this.activeToggled = false;
        return;
      }

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

    const politicalBusinessSummary = {
      ...politicalBusiness,
      politicalBusinessUnionDescription: '',
      electionGroupNumber: '',
      politicalBusinessUnionId: '',
      electionGroupId: '',
    };

    const existingPbIdx = this.contest.politicalBusinesses.map(c => c.id).indexOf(politicalBusiness.id);
    if (existingPbIdx >= 0) {
      this.contest.politicalBusinesses[existingPbIdx] = politicalBusiness;
      this.politicalBusinessSummaries[existingPbIdx] = politicalBusinessSummary;
    } else {
      this.contest.politicalBusinesses.push(politicalBusiness);
      this.politicalBusinessSummaries.push(politicalBusinessSummary);
    }

    this.contest.politicalBusinesses = [...this.contest.politicalBusinesses];
    this.updatePoliticalBusinessesList();
  }

  private handlePoliticalBusinessUnionMessage(e: PoliticalBusinessUnionMessage): void {
    const politicalBusinessUnion = e.data;

    if (e.newEntityState === EntityState.ENTITY_STATE_DELETED) {
      this.contest.politicalBusinessUnions = this.contest.politicalBusinessUnions.filter(u => u.id !== politicalBusinessUnion.id);
      this.patchPoliticalBusinessSummariesFromUnion(e.newEntityState, politicalBusinessUnion);
      return;
    }

    const existingPbUnionIdx = this.contest.politicalBusinessUnions.map(c => c.id).indexOf(politicalBusinessUnion.id);
    if (existingPbUnionIdx >= 0) {
      this.contest.politicalBusinessUnions[existingPbUnionIdx] = politicalBusinessUnion;
      this.patchPoliticalBusinessSummariesFromUnion(e.newEntityState, politicalBusinessUnion);
      return;
    } else {
      this.contest.politicalBusinessUnions.push(politicalBusinessUnion);
    }

    sortPoliticalBusinessUnions(this.contest.politicalBusinessUnions);
    this.contest.politicalBusinessUnions = [...this.contest.politicalBusinessUnions];
  }

  private handleElectionGroupMessage(e: ElectionGroupMessage): void {
    const electionGroup = e.data;
    this.patchPoliticalBusinessSummariesFromElectionGroup(e.newEntityState, electionGroup);
  }

  private updatePoliticalBusinessesList(): void {
    this.dataSource.data = this.politicalBusinessSummaries.map(x => this.mapToListType(x));

    this.columns = [...this.originalColumns];
    const hasPoliticalBusinessUnionDescription = this.dataSource.data.some(x => !!x.politicalBusinessUnionDescription);
    const hasElectionGroupNumber = this.dataSource.data.some(x => !!x.electionGroupNumber);

    if (!hasElectionGroupNumber) {
      this.columns.splice(2, 1);
    }

    if (!hasPoliticalBusinessUnionDescription) {
      this.columns.splice(1, 1);
    }
  }

  // To make the table component filter work out of the box, map political businesses
  // into a type which can be displayed and filtered directly
  private mapToListType(politicalBusinessSummary: PoliticalBusinessSummary): PoliticalBusinessListType {
    return {
      id: politicalBusinessSummary.id,
      number: politicalBusinessSummary.politicalBusinessNumber,
      politicalBusinessUnionDescription: politicalBusinessSummary.politicalBusinessUnionDescription,
      electionGroupNumber: politicalBusinessSummary.electionGroupNumber,
      type: politicalBusinessSummary.politicalBusinessType,
      subType: politicalBusinessSummary.politicalBusinessSubType,
      shortDescription: this.languageService.getTranslationForCurrentLang(politicalBusinessSummary.shortDescription),
      active: politicalBusinessSummary.active,
      domainOfInfluenceType: politicalBusinessSummary.domainOfInfluence.type,
      domainOfInfluenceName: politicalBusinessSummary.domainOfInfluence.name,
      owner: politicalBusinessSummary.domainOfInfluence.authorityName,
      ownerId: politicalBusinessSummary.domainOfInfluence.secureConnectId,
    };
  }

  private patchPoliticalBusinessSummariesFromUnion(entityState: EntityState, politicalBusinessUnion: PoliticalBusinessUnion): void {
    if (entityState === EntityState.ENTITY_STATE_ADDED) {
      return;
    }

    for (const politicalBusinessSummary of this.politicalBusinessSummaries.filter(
      x => x.politicalBusinessUnionId === politicalBusinessUnion.id,
    )) {
      politicalBusinessSummary.politicalBusinessUnionDescription = '';
      politicalBusinessSummary.politicalBusinessUnionId = '';
    }

    if (entityState === EntityState.ENTITY_STATE_MODIFIED) {
      for (const politicalBusinessSummary of this.politicalBusinessSummaries.filter(x =>
        politicalBusinessUnion.politicalBusinessIds?.includes(x.id),
      )) {
        politicalBusinessSummary.politicalBusinessUnionId = politicalBusinessUnion.id;
        politicalBusinessSummary.politicalBusinessUnionDescription = politicalBusinessUnion.description;
      }
    }

    this.updatePoliticalBusinessesList();
  }

  private patchPoliticalBusinessSummariesFromElectionGroup(entityState: EntityState, electionGroup: ElectionGroup): void {
    if (entityState === EntityState.ENTITY_STATE_ADDED) {
      return;
    }

    for (const politicalBusinessSummary of this.politicalBusinessSummaries.filter(x => x.electionGroupId === electionGroup.id)) {
      politicalBusinessSummary.electionGroupId = '';
      politicalBusinessSummary.electionGroupNumber = '';
    }

    if (entityState === EntityState.ENTITY_STATE_MODIFIED) {
      for (const politicalBusinessSummary of this.politicalBusinessSummaries.filter(
        x => electionGroup.primaryMajorityElection?.id === x.id || electionGroup.secondaryElectionIdsList.includes(x.id),
      )) {
        politicalBusinessSummary.electionGroupId = electionGroup.id;
        politicalBusinessSummary.electionGroupNumber = String(electionGroup.number);
      }
    }

    this.updatePoliticalBusinessesList();
  }
}

export type PoliticalBusinessListType = {
  id: string;
  number: string;
  politicalBusinessUnionDescription: string;
  electionGroupNumber: string;
  type: PoliticalBusinessType;
  subType: PoliticalBusinessSubType;
  shortDescription: string;
  domainOfInfluenceType: DomainOfInfluenceType;
  domainOfInfluenceName: string;
  owner: string;
  ownerId: string;
  active: boolean;
};
