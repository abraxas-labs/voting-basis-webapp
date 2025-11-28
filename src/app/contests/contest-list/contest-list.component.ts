/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, FilterDirective, PaginatorComponent, SortDirective, TableDataSource } from '@abraxas/base-components';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { ContestState, ContestSummary } from '../../core/models/contest.model';
import { ContestListType } from '../../core/models/contest-list.model';
import { PoliticalAssembly, PoliticalAssemblyState } from '../../core/models/political-assembly.model';
import { TranslateService } from '../../core/translate.service';
import { EnumItemDescription, EnumUtil, LanguageService } from '@abraxas/voting-lib';
import moment from 'moment';

@Component({
  selector: 'app-contest-list',
  templateUrl: './contest-list.component.html',
  styleUrls: ['./contest-list.component.scss'],
  standalone: false,
})
export class ContestListComponent implements OnInit, OnChanges, AfterViewInit {
  public columns: string[] = [];
  public readonly contestStates: typeof ContestState = ContestState;
  public contestStateList: EnumItemDescription<ContestState>[] = [];
  public dataSource = new TableDataSource<ContestListType>();
  public tenantId: string = '';

  @Input()
  public showEndOfTestingPhase: boolean = false;

  @Input()
  public showArchivePer: boolean = false;

  @Input()
  public showType: boolean = false;

  @Input()
  public showState: boolean = true;

  @Input()
  public canCreate: boolean = false;

  @Input()
  public canEdit: boolean = false;

  @Input()
  public canDelete: boolean = false;

  @Input()
  public set contests(contests: ContestSummary[]) {
    const contestListTypes = contests.map(x => this.mapContestSummaryToContestListType(x));
    this.dataSource.data = [...this.dataSource.data.filter(x => x.isPoliticalAssembly), ...contestListTypes];
  }

  @Input()
  public set politicalAssemblies(politicalAssemblies: PoliticalAssembly[]) {
    const contestListTypes = politicalAssemblies.map(x => this.mapPoliticalAssemblyToListType(x));
    this.dataSource.data = [...this.dataSource.data.filter(x => !x.isPoliticalAssembly), ...contestListTypes];
  }

  @Input()
  public showPaginator: boolean = false;

  @Output()
  public view: EventEmitter<ContestListType> = new EventEmitter<ContestListType>();

  @Output()
  public create: EventEmitter<ContestListType> = new EventEmitter<ContestListType>();

  @Output()
  public edit: EventEmitter<ContestListType> = new EventEmitter<ContestListType>();

  @Output()
  public archive: EventEmitter<ContestListType> = new EventEmitter<ContestListType>();

  @Output()
  public pastUnlock: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @Output()
  public delete: EventEmitter<ContestListType> = new EventEmitter<ContestListType>();

  @Output()
  public export: EventEmitter<ContestSummary> = new EventEmitter<ContestSummary>();

  @ViewChild('paginator') public paginator!: PaginatorComponent;

  @ViewChild(SortDirective, { static: true })
  public sort!: SortDirective;

  @ViewChild(FilterDirective, { static: true })
  public filter!: FilterDirective;

  constructor(
    private readonly languageService: LanguageService,
    private readonly i18n: TranslateService,
    private readonly enumUtil: EnumUtil,
    private readonly auth: AuthorizationService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.contestStateList = this.enumUtil.getArrayWithDescriptions<ContestState>(ContestState, 'CONTEST.STATES.');
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filter = this.filter;
  }

  public ngOnChanges(): void {
    this.columns = [
      'dateString',
      'type',
      'description',
      'endOfTestingPhase',
      'state',
      'archivePer',
      'politicalBusinesses',
      'owner',
      'actions',
    ];
    if (!this.showArchivePer) {
      this.columns.splice(5, 1);
    }
    if (!this.showState) {
      this.columns.splice(4, 1);
    }
    if (!this.showEndOfTestingPhase) {
      this.columns.splice(3, 1);
    }
    if (!this.showType) {
      this.columns.splice(1, 1);
    }
  }

  // To make the table component filter work out of the box, map contests and
  // political assemblies into a combined type which can be displayed and filtered directly
  private mapContestSummaryToContestListType(entry: ContestSummary): ContestListType {
    return {
      id: entry.id,
      date: entry.date!,
      dateString: moment(entry.date!).format('YYYY-MM-DD'),
      type: entry.isPreconfiguredDate ? '' : this.i18n.instant('CONTEST.TYPE.CONTEST'),
      description: entry.isPreconfiguredDate
        ? this.i18n.instant('CONTEST.PRECONFIGURED_DATE')
        : this.languageService.getTranslationForCurrentLang(entry.description),
      isPreconfiguredDate: entry.isPreconfiguredDate,
      isPoliticalAssembly: false,
      endOfTestingPhase: entry.endOfTestingPhase,
      state: entry.state,
      archivePer: entry.archivePer,
      owner: entry.domainOfInfluence?.authorityName ?? '',
      ownerId: entry.domainOfInfluence?.secureConnectId,
      locked: entry.locked,
      politicalBusinesses:
        entry.contestEntriesDetails
          ?.map(x => `${this.i18n.instant('DOMAIN_OF_INFLUENCE.TYPES.' + x.domainOfInfluenceType)}: ${x.contestEntriesCount}`)
          .join('\n') ?? '',
      contest: entry, // keep this around, as some event emitters depend on this
      eVotingApprovalDueDateString: entry.eVotingApprovalDueDate ? moment(entry.eVotingApprovalDueDate).format('YYYY-MM-DD') : undefined,
    };
  }

  private mapPoliticalAssemblyToListType(politicalAssembly: PoliticalAssembly): ContestListType {
    return {
      id: politicalAssembly.id,
      date: politicalAssembly.date!,
      dateString: moment(politicalAssembly.date!).format('YYYY-MM-DD'),
      type: this.i18n.instant('CONTEST.TYPE.POLITICAL_ASSEMBLY'),
      description: this.languageService.getTranslationForCurrentLang(politicalAssembly.description),
      isPoliticalAssembly: true,
      isPreconfiguredDate: false,
      state: this.mapPoliticalAssemblyState(politicalAssembly.state),
      archivePer: politicalAssembly.archivePer,
      owner: politicalAssembly.domainOfInfluence?.authorityName ?? '',
      ownerId: politicalAssembly.domainOfInfluence?.secureConnectId,
      politicalBusinesses: '', // The base components filter does not handle undefined very well, use empty string
      locked: politicalAssembly.state !== PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_ACTIVE,
      politicalAssembly: politicalAssembly,
    };
  }

  private mapPoliticalAssemblyState(state: PoliticalAssemblyState): ContestState {
    switch (state) {
      case PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_ACTIVE:
        return ContestState.CONTEST_STATE_ACTIVE;
      case PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_PAST_LOCKED:
        return ContestState.CONTEST_STATE_PAST_LOCKED;
      case PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_ARCHIVED:
        return ContestState.CONTEST_STATE_ARCHIVED;
      default:
        return ContestState.CONTEST_STATE_UNSPECIFIED;
    }
  }
}
