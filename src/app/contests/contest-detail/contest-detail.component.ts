/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AuthorizationService,
  DialogService as BcDialogService,
  FilterDirective,
  PaginatorComponent,
  SortDirective,
  TableDataSource,
} from '@abraxas/base-components';
import { DialogService, EnumItemDescription, EnumUtil, SnackbarService, LanguageService } from '@abraxas/voting-lib';
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
import { PoliticalBusiness, PoliticalBusinessSubType, PoliticalBusinessSummary } from '../../core/models/political-business.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import { SecondaryMajorityElectionService } from '../../core/secondary-majority-election.service';
import { VoteService } from '../../core/vote.service';
import {
  PoliticalBusinessImportDialogComponent,
  PoliticalBusinessImportDialogData,
} from '../../shared/import/political-business-import-dialog/political-business-import-dialog.component';
import {
  PoliticalBusinessUnionsDialogComponent,
  PoliticalBusinessUnionsDialogData,
} from '../political-business-unions-dialog/political-business-unions-dialog.component';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';
import {
  AssignedCountingCirclesDialogComponent,
  AssignedCountingCirclesDialogData,
} from '../../shared/assigned-counting-circles-dialog/assigned-counting-circles-dialog.component';
import { EventLogService } from '../../core/event-log.service';
import { EventType } from '../../core/models/event-log.model';
import { PoliticalBusinessType } from '@abraxas/voting-basis-service-proto/grpc/shared/political_business_pb';

const POLITICAL_BUSINESS_TYPE_TO_EXPORT_ENTITY_TYPE: { [key in PoliticalBusinessType]?: ExportEntityType } = {
  [PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE]: ExportEntityType.EXPORT_ENTITY_TYPE_VOTE,
  [PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION]: ExportEntityType.EXPORT_ENTITY_TYPE_PROPORTIONAL_ELECTION,
  [PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION]: ExportEntityType.EXPORT_ENTITY_TYPE_MAJORITY_ELECTION,
};

@Component({
  selector: 'app-contest-detail',
  templateUrl: './contest-detail.component.html',
  styleUrls: ['./contest-detail.component.scss'],
  standalone: false,
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
    private readonly eventLogService: EventLogService,
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
    private readonly bcDialogService: BcDialogService,
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

    try {
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
    } catch (err) {
      row.active = !row.active;
      throw err;
    }
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

  public async openAssignedCountingCircles(politicalBusiness: PoliticalBusinessListType): Promise<void> {
    const data: AssignedCountingCirclesDialogData = {
      domainOfInfluenceId: politicalBusiness.domainOfInfluenceId,
    };
    this.bcDialogService.openRight(AssignedCountingCirclesDialogComponent, data);
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
      this.startChangesListenerIfNotStarted();
    } finally {
      this.loading = false;
    }
  }

  private removePoliticalBusinessFromUi(politicalBusinessId: string): void {
    this.contest.politicalBusinesses = this.contest.politicalBusinesses.filter(pb => pb.id !== politicalBusinessId);
    this.politicalBusinessSummaries = this.politicalBusinessSummaries.filter(pb => pb.id !== politicalBusinessId);
    this.updatePoliticalBusinessesList();
  }

  private replacePoliticalBusinessInUi(business: PoliticalBusinessSummary & PoliticalBusiness): void {
    const contestIdx = this.contest.politicalBusinesses.findIndex(pb => pb.id === business.id);
    if (contestIdx !== -1) {
      this.contest.politicalBusinesses[contestIdx] = business;
      this.contest.politicalBusinesses = [...this.contest.politicalBusinesses];
    }

    const summariesIdx = this.politicalBusinessSummaries.findIndex(pb => pb.id === business.id);
    if (summariesIdx !== -1) {
      this.politicalBusinessSummaries[summariesIdx] = business;
      this.politicalBusinessSummaries = [...this.politicalBusinessSummaries];
    }

    this.updatePoliticalBusinessesList();
  }

  private addPoliticalBusiness(politicalBusiness: PoliticalBusinessSummary & PoliticalBusiness): void {
    this.contest.politicalBusinesses = [...this.contest.politicalBusinesses, politicalBusiness];
    this.politicalBusinessSummaries = [...this.politicalBusinessSummaries, politicalBusiness];
    this.updatePoliticalBusinessesList();
  }

  private startChangesListenerIfNotStarted(): void {
    if (this.detailsChangesSubscription !== undefined) {
      return;
    }

    this.detailsChangesSubscription = this.eventLogService
      .watch(
        [
          'ContestDeleted',

          'ElectionGroupCreated',
          'ElectionGroupDeleted',

          'VoteCreated',
          'VoteUpdated',
          'VoteActiveStateUpdated',
          'VoteDeleted',
          'BallotCreated',
          'BallotUpdated',
          'BallotAfterTestingPhaseUpdated',
          'BallotDeleted',

          'ProportionalElectionCreated',
          'ProportionalElectionUpdated',
          'ProportionalElectionActiveStateUpdated',
          'ProportionalElectionAfterTestingPhaseUpdated',
          'ProportionalElectionDeleted',
          'ProportionalElectionUnionCreated',
          'ProportionalElectionUnionUpdated',
          'ProportionalElectionUnionEntriesUpdated',
          'ProportionalElectionUnionDeleted',

          'MajorityElectionCreated',
          'MajorityElectionUpdated',
          'MajorityElectionActiveStateUpdated',
          'MajorityElectionDeleted',
          'MajorityElectionAfterTestingPhaseUpdated',
          'MajorityElectionUnionCreated',
          'MajorityElectionUnionUpdated',
          'MajorityElectionUnionEntriesUpdated',
          'MajorityElectionUnionDeleted',

          'SecondaryMajorityElectionCreated',
          'SecondaryMajorityElectionUpdated',
          'SecondaryMajorityElectionActiveStateUpdated',
          'SecondaryMajorityElectionAfterTestingPhaseUpdated',
          'SecondaryMajorityElectionDeleted',
        ],
        this.contest.id,
      )
      .subscribe(e => this.handleEvent(e.type, e.politicalBusinessId));
  }

  private async handleEvent(type: EventType, politicalBusinessId: string): Promise<void> {
    switch (type) {
      case 'ContestDeleted':
        await this.router.navigate(['../']);
        break;
      case 'MajorityElectionDeleted':
      case 'SecondaryMajorityElectionDeleted':
      case 'ProportionalElectionDeleted':
      case 'VoteDeleted':
        this.removePoliticalBusinessFromUi(politicalBusinessId);
        break;
      case 'VoteCreated': {
        if (this.contest.politicalBusinesses.find(x => x.id === politicalBusinessId)) {
          break;
        }

        const vote = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE,
          politicalBusinessId,
        );
        this.addPoliticalBusiness(vote);
        break;
      }
      case 'BallotCreated':
      case 'BallotUpdated':
      case 'BallotAfterTestingPhaseUpdated':
      case 'BallotDeleted':
      case 'VoteUpdated':
      case 'VoteActiveStateUpdated': {
        const vote = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_VOTE,
          politicalBusinessId,
        );
        this.replacePoliticalBusinessInUi(vote);
        break;
      }
      case 'ProportionalElectionCreated': {
        if (this.contest.politicalBusinesses.find(x => x.id === politicalBusinessId)) {
          break;
        }

        const election = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION,
          politicalBusinessId,
        );
        this.addPoliticalBusiness(election);
        break;
      }
      case 'ProportionalElectionUpdated':
      case 'ProportionalElectionActiveStateUpdated':
      case 'ProportionalElectionAfterTestingPhaseUpdated': {
        const election = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_PROPORTIONAL_ELECTION,
          politicalBusinessId,
        );
        this.replacePoliticalBusinessInUi(election);
        break;
      }
      case 'MajorityElectionCreated': {
        if (this.contest.politicalBusinesses.find(x => x.id === politicalBusinessId)) {
          break;
        }

        const election = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION,
          politicalBusinessId,
        );
        this.addPoliticalBusiness(election);
        break;
      }
      case 'MajorityElectionUpdated':
      case 'MajorityElectionActiveStateUpdated':
      case 'MajorityElectionAfterTestingPhaseUpdated': {
        const election = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_MAJORITY_ELECTION,
          politicalBusinessId,
        );
        this.replacePoliticalBusinessInUi(election);
        break;
      }
      case 'SecondaryMajorityElectionCreated': {
        if (this.contest.politicalBusinesses.find(x => x.id === politicalBusinessId)) {
          break;
        }

        const election = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_SECONDARY_MAJORITY_ELECTION,
          politicalBusinessId,
        );
        this.addPoliticalBusiness(election);
        break;
      }
      case 'SecondaryMajorityElectionUpdated':
      case 'SecondaryMajorityElectionActiveStateUpdated':
      case 'SecondaryMajorityElectionAfterTestingPhaseUpdated': {
        const election = await this.contestService.getPoliticalBusinessSummary(
          PoliticalBusinessType.POLITICAL_BUSINESS_TYPE_SECONDARY_MAJORITY_ELECTION,
          politicalBusinessId,
        );
        this.replacePoliticalBusinessInUi(election);
        break;
      }
      case 'MajorityElectionUnionCreated':
      case 'MajorityElectionUnionUpdated':
      case 'MajorityElectionUnionEntriesUpdated':
      case 'MajorityElectionUnionDeleted':
      case 'ProportionalElectionUnionCreated':
      case 'ProportionalElectionUnionUpdated':
      case 'ProportionalElectionUnionEntriesUpdated':
      case 'ProportionalElectionUnionDeleted':
      case 'ElectionGroupCreated':
      case 'ElectionGroupDeleted': {
        this.contest = await this.contestService.get(this.contest.id);
        this.politicalBusinessSummaries = await this.contestService.listPoliticalBusinessSummaries(this.contest.id);
        this.updatePoliticalBusinessesList();
        break;
      }
    }
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
      domainOfInfluenceId: politicalBusinessSummary.domainOfInfluence.id,
      owner: politicalBusinessSummary.domainOfInfluence.authorityName,
      ownerId: politicalBusinessSummary.domainOfInfluence.secureConnectId,
    };
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
  domainOfInfluenceId: string;
  owner: string;
  ownerId: string;
  active: boolean;
};
