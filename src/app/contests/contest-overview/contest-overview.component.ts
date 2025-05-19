/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { ContestService } from '../../core/contest.service';
import { ExportService } from '../../core/export.service';
import { ContestState, ContestSummary, PreconfiguredContestDate } from '../../core/models/contest.model';
import { ExportEntityType } from '../../core/models/export.model';
import { ContestImportDialogComponent } from '../../shared/import/contest-import-dialog/contest-import-dialog.component';
import { ContestArchiveDialogComponent, ContestArchiveDialogData } from '../contest-archive-dialog/contest-archive-dialog.component';
import {
  ContestEditDialogComponent,
  ContestEditDialogData,
  ContestEditDialogResult,
} from '../contest-edit-dialog/contest-edit-dialog.component';
import {
  ContestPastUnlockDialogComponent,
  ContestPastUnlockDialogData,
} from '../contest-past-unlock-dialog/contest-past-unlock-dialog.component';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { AuthorizationService } from '@abraxas/base-components';
import { PoliticalAssemblyState, PoliticalAssembly } from '../../core/models/political-assembly.model';
import { PoliticalAssemblyService } from '../../core/political-assembly.service';
import {
  PoliticalAssemblyEditDialogComponent,
  PoliticalAssemblyEditDialogData,
  PoliticalAssemblyEditDialogResult,
} from '../political-assembly-edit-dialog/political-assembly-edit-dialog.component';
import { ContestListType } from '../../core/models/contest-list.model';
import { Permissions } from '../../core/models/permissions.model';
import { PermissionService } from '../../core/permission.service';
import { EventLogService } from '../../core/event-log.service';
import { EventType } from '../../core/models/event-log.model';
import { PoliticalAssemblies } from '@abraxas/voting-basis-service-proto/grpc/models/political_assembly_pb';

@Component({
  selector: 'app-contest-overview',
  templateUrl: './contest-overview.component.html',
  styleUrls: ['./contest-overview.component.scss'],
  standalone: false,
})
export class ContestOverviewComponent implements OnInit, OnDestroy {
  public loading: boolean = true;
  public contests: ContestSummary[] = [];
  public pastContests: ContestSummary[] = [];
  public archivedContests: ContestSummary[] = [];
  public canAddPoliticalAssembly: boolean = false;
  public politicalAssemblies: PoliticalAssembly[] = [];
  public pastPoliticalAssemblies: PoliticalAssembly[] = [];
  public archivedPoliticalAssemblies: PoliticalAssembly[] = [];
  public canCreate: boolean = false;
  public canEdit: boolean = false;
  public canDelete: boolean = false;

  private preconfiguredDates: PreconfiguredContestDate[] = [];
  private overviewChangesSubscription?: Subscription;

  constructor(
    private readonly exportService: ExportService,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
    private readonly contestService: ContestService,
    private readonly eventLogService: EventLogService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly auth: AuthorizationService,
    private readonly politicalAssemblyService: PoliticalAssemblyService,
    private readonly permissionService: PermissionService,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      [this.preconfiguredDates, this.contests, this.pastContests, this.archivedContests, this.canCreate, this.canEdit, this.canDelete] =
        await Promise.all([
          this.contestService.listFuturePreconfiguredDates(),
          this.contestService.listSummaries(ContestState.CONTEST_STATE_ACTIVE, ContestState.CONTEST_STATE_TESTING_PHASE),
          this.contestService.listSummaries(ContestState.CONTEST_STATE_PAST_UNLOCKED, ContestState.CONTEST_STATE_PAST_LOCKED),
          this.contestService.listSummaries(ContestState.CONTEST_STATE_ARCHIVED),
          this.permissionService.hasPermission(Permissions.Contest.Create),
          this.permissionService.hasPermission(Permissions.Contest.Update),
          this.permissionService.hasPermission(Permissions.Contest.Delete),
        ]);
      this.attachPreconfiguredDates();
      this.startChangesListener();

      const tenant = await this.auth.getActiveTenant();
      const domainOfInfluences = await this.domainOfInfluenceService.listForTenant(tenant.id);
      this.canAddPoliticalAssembly = domainOfInfluences.some(x => x.responsibleForVotingCards);

      if (this.canAddPoliticalAssembly) {
        this.politicalAssemblies = await this.politicalAssemblyService.list(PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_ACTIVE);
        this.pastPoliticalAssemblies = await this.politicalAssemblyService.list(
          PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_PAST_LOCKED,
        );
        this.archivedPoliticalAssemblies = await this.politicalAssemblyService.list(
          PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_ARCHIVED,
        );
      }
    } finally {
      this.loading = false;
    }
  }

  public ngOnDestroy(): void {
    this.overviewChangesSubscription?.unsubscribe();
  }

  public async create(preconfiguredDate?: Date): Promise<void> {
    const data: ContestEditDialogData = {
      preconfiguredDate,
      testingPhaseEnded: false,
    };

    const result = await this.dialogService.openForResult(ContestEditDialogComponent, data);
    this.handleCreateContest(result);
  }

  public async createPoliticalAssembly(): Promise<void> {
    const result = await this.dialogService.openForResult(PoliticalAssemblyEditDialogComponent, {});
    this.handleCreatePoliticalAssembly(result);
  }

  public async edit(contestListType: ContestListType): Promise<void> {
    if (contestListType.isPoliticalAssembly) {
      const data: PoliticalAssemblyEditDialogData = {
        politicalAssemblyId: contestListType.id,
      };

      const result = await this.dialogService.openForResult(PoliticalAssemblyEditDialogComponent, data);
      this.handleEditPoliticalAssembly(result);
    } else {
      const data: ContestEditDialogData = {
        contestId: contestListType.id,
        testingPhaseEnded: contestListType.testingPhaseEnded ?? false,
      };

      const result = await this.dialogService.openForResult(ContestEditDialogComponent, data);
      this.handleEditContest(result);
    }
  }

  public async delete(contestListType: ContestListType): Promise<void> {
    const shouldDelete = await this.dialogService.confirm(
      'APP.DELETE',
      contestListType.isPoliticalAssembly ? 'POLITICAL_ASSEMBLY.CONFIRM_DELETE' : 'CONTEST.CONFIRM_DELETE',
      'APP.DELETE',
    );
    if (!shouldDelete) {
      return;
    }

    if (contestListType.isPoliticalAssembly) {
      await this.politicalAssemblyService.delete(contestListType.id);
    } else {
      await this.contestService.delete(contestListType.id);
    }

    this.removeContestListTypeFromUi(contestListType.id, contestListType.isPoliticalAssembly);
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async view(id: string): Promise<void> {
    await this.router.navigate([id], { relativeTo: this.route });
  }

  public import(): void {
    this.dialogService.open(ContestImportDialogComponent, undefined);
  }

  public export(id: string): Promise<void> {
    return this.exportService.downloadExportOrShowDialog(ExportEntityType.EXPORT_ENTITY_TYPE_CONTEST, id);
  }

  public async archive(listEntry: ContestListType): Promise<void> {
    const data: ContestArchiveDialogData = {
      listEntry,
    };

    const result = await this.dialogService.openForResult(ContestArchiveDialogComponent, data);
    if (!result || !result.immediatelyArchived) {
      return;
    }

    if (listEntry.isPoliticalAssembly) {
      this.pastPoliticalAssemblies = this.pastPoliticalAssemblies.filter(x => x.id !== listEntry.id);
      this.archivedPoliticalAssemblies = [listEntry.politicalAssembly!, ...this.archivedPoliticalAssemblies];
    } else {
      this.pastContests = this.pastContests.filter(x => x.id !== listEntry.id);
      this.archivedContests = [listEntry.contest!, ...this.archivedContests];
    }
  }

  public pastUnlock(contest: ContestSummary): void {
    const data: ContestPastUnlockDialogData = {
      contest,
    };

    this.dialogService.open(ContestPastUnlockDialogComponent, data);
  }

  private handleCreateContest(data?: ContestEditDialogResult): void {
    if (!data) {
      return;
    }

    const missingProps = { isPreconfiguredDate: false, contestEntriesDetails: [], state: ContestState.CONTEST_STATE_TESTING_PHASE };
    const createdContest = { ...data.contest, ...missingProps };

    // we may have overwritten a "child contest" or a preconfigured contest date
    this.contests = [...this.contests.filter(({ date }) => !moment(date).isSame(createdContest.date, 'day')), createdContest];
  }

  private handleCreatePoliticalAssembly(data?: PoliticalAssemblyEditDialogResult): void {
    if (!data) {
      return;
    }
    data.politicalAssembly.state = PoliticalAssemblyState.POLITICAL_ASSEMBLY_STATE_ACTIVE;
    this.politicalAssemblies = [...this.politicalAssemblies, data.politicalAssembly];
  }

  private handleEditContest(data?: ContestEditDialogResult): void {
    if (!data) {
      return;
    }

    const existingContestIndex = this.contests.findIndex(c => c.id === data.contest.id);
    this.contests[existingContestIndex] = {
      ...this.contests[existingContestIndex],
      ...data.contest,
    };

    // trigger angular change detection
    this.contests = [...this.contests];
  }

  private handleEditPoliticalAssembly(data?: PoliticalAssemblyEditDialogResult): void {
    if (!data) {
      return;
    }

    const existingPoliticalAssemblyIndex = this.politicalAssemblies.findIndex(c => c.id === data.politicalAssembly.id);
    this.politicalAssemblies[existingPoliticalAssemblyIndex] = {
      ...this.politicalAssemblies[existingPoliticalAssemblyIndex],
      ...data.politicalAssembly,
    };

    // trigger angular change detection
    this.politicalAssemblies = [...this.politicalAssemblies];
  }

  private attachPreconfiguredDates(): void {
    const dates = this.preconfiguredDates
      .filter(x => !this.contests.find(({ date }) => moment(date).isSame(x.date, 'day')))
      .map(
        ({ date }) =>
          ({
            date,
            isPreconfiguredDate: true,
          }) as ContestSummary,
      );
    this.contests = [...this.contests, ...dates];
  }

  private startChangesListener(): void {
    this.overviewChangesSubscription?.unsubscribe();
    this.overviewChangesSubscription = this.eventLogService
      .watch(['ContestCreated', 'ContestUpdated', 'ContestDeleted'])
      .subscribe(e => this.handleContestEvent(e.type, e.aggregateId));
  }

  private async handleContestEvent(eventType: EventType, contestId: string): Promise<void> {
    switch (eventType) {
      case 'ContestCreated':
        if (this.contests.find(x => x.id === contestId)) {
          break;
        }

        this.contests = [
          ...this.contests,
          {
            ...(await this.contestService.get(contestId)),
            archivePer: undefined,
            contestEntriesDetails: [],
            isPreconfiguredDate: false,
          },
        ];
        break;
      case 'ContestUpdated':
        const idx = this.contests.findIndex(d => d.id === contestId);
        if (idx >= 0) {
          this.contests[idx] = {
            ...(await this.contestService.get(contestId)),
            archivePer: undefined,
            contestEntriesDetails: [],
            isPreconfiguredDate: false,
          };
          this.contests = [...this.contests];
        }
        break;
      case 'ContestDeleted':
        this.contests = this.contests.filter(c => c.id !== contestId);
        break;
    }
  }

  private removeContestListTypeFromUi(id: string, isPoliticalAssembly: boolean): void {
    if (isPoliticalAssembly) {
      this.politicalAssemblies = this.politicalAssemblies.filter(c => c.id !== id);
    } else {
      const existingContest = this.contests.find(c => c.id === id);
      this.contests = this.contests.filter(c => c.id !== id);

      // re-add the preconfigured date, if there was one for the removed contest
      if (existingContest && !!this.preconfiguredDates.find(x => moment(x.date).isSame(existingContest.date, 'day'))) {
        this.contests = [
          ...this.contests,
          {
            date: existingContest.date,
            isPreconfiguredDate: true,
          } as ContestSummary,
        ];
      }
    }
  }
}
