/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil, LanguageService } from '@abraxas/voting-lib';
import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContestService } from '../../core/contest.service';
import { DomainOfInfluenceReportLevelService } from '../../core/domain-of-influence-report-level.service';
import { DomainOfInfluenceTree } from '../../core/domain-of-influence-tree';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { Contest } from '../../core/models/contest.model';
import { DomainOfInfluence, DomainOfInfluenceLevel, DomainOfInfluenceType } from '../../core/models/domain-of-influence.model';
import { PoliticalBusinessBase } from '../../core/models/political-business.model';
import { groupBy } from '../../core/utils/array.utils';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';
import { DialogService } from '@abraxas/base-components';
import {
  AssignedCountingCirclesDialogComponent,
  AssignedCountingCirclesDialogData,
} from '../assigned-counting-circles-dialog/assigned-counting-circles-dialog.component';

@Directive()
export abstract class PoliticalBusinessGeneralInformationsComponent<T extends PoliticalBusinessBase> implements OnInit {
  public readonly domainOfInfluenceTypes: typeof DomainOfInfluenceType = DomainOfInfluenceType;
  public readonly federalIdentificationMaxValue: number = 2147483647;

  public loading: boolean = true;

  public domainOfInfluenceTypeItems: EnumItemDescription<DomainOfInfluenceType>[] = [];
  public domainOfInfluencesByType: Partial<Record<DomainOfInfluenceType, DomainOfInfluence[]>> = {};
  public domainOfInfluenceLevels: DomainOfInfluenceLevel[] = [];
  public contest: Contest = {} as Contest;
  public hasAdminPermissions: boolean = false;
  public readonly: boolean = false;

  @Input()
  public data: T;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  public domainOfInfluences: DomainOfInfluence[] = [];
  private selectedDomainOfInfluenceValue?: DomainOfInfluence;
  private selectedDomainOfInfluenceTypeValue?: DomainOfInfluenceType;
  private domainOfInfluenceTree?: DomainOfInfluenceTree;

  protected constructor(
    protected readonly enumUtil: EnumUtil,
    protected readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly contestService: ContestService,
    private readonly doiReportLevelService: DomainOfInfluenceReportLevelService,
    private readonly permissionService: PermissionService,
    private readonly dialogService: DialogService,
    initialData: T,
  ) {
    this.data = initialData;
  }

  public get selectedDomainOfInfluence(): DomainOfInfluence | undefined {
    return this.selectedDomainOfInfluenceValue;
  }

  public set selectedDomainOfInfluence(v: DomainOfInfluence | undefined) {
    this.selectedDomainOfInfluenceValue = v;
    this.data.domainOfInfluenceId = v?.id ?? '';

    const politicalBusinessDomainOfInfluenceNode = this.domainOfInfluenceTree?.findNodeById(this.data.domainOfInfluenceId);
    this.domainOfInfluenceLevels = this.doiReportLevelService.buildDomainOfInfluenceReportLevels(politicalBusinessDomainOfInfluenceNode);
  }

  public get selectedDomainOfInfluenceType(): DomainOfInfluenceType | undefined {
    return this.selectedDomainOfInfluenceTypeValue;
  }

  public set selectedDomainOfInfluenceType(v: DomainOfInfluenceType | undefined) {
    if (v === this.selectedDomainOfInfluenceTypeValue) {
      return;
    }

    if (this.selectedDomainOfInfluenceTypeValue) {
      this.selectedDomainOfInfluence = undefined;
    }

    this.selectedDomainOfInfluenceTypeValue = v;
  }

  public get isValid(): boolean {
    return (
      this.readonly ||
      (!!this.data &&
        !!this.data.politicalBusinessNumber &&
        LanguageService.allLanguagesPresent(this.data.officialDescription) &&
        LanguageService.allLanguagesPresent(this.data.shortDescription) &&
        !!this.data.domainOfInfluenceId &&
        !!this.data.contestId)
    );
  }

  public async ngOnInit(): Promise<void> {
    try {
      this.contest = await this.contestService.get(this.data.contestId);
      this.hasAdminPermissions = await this.permissionService.hasPermission(Permissions.PoliticalBusiness.ReadActionsTenantSameCanton);
      this.readonly = !(await this.permissionService.hasPermission(Permissions.PoliticalBusiness.WriteActionsSameTenant));
      await this.initDomainOfInfluenceData();
    } finally {
      this.loading = false;
    }
  }

  public openAssignedCountingCirclesDialog(): void {
    const data: AssignedCountingCirclesDialogData = {
      domainOfInfluenceId: this.data.domainOfInfluenceId,
    };
    this.dialogService.openRight(AssignedCountingCirclesDialogComponent, data);
  }

  private async initDomainOfInfluenceData(): Promise<void> {
    this.domainOfInfluenceTree = new DomainOfInfluenceTree(await this.domainOfInfluenceService.listTree(), this.enumUtil);

    const contestDomainOfInfluenceNode = this.domainOfInfluenceTree.findNodeById(this.contest.domainOfInfluenceId);
    if (!contestDomainOfInfluenceNode) {
      throw new Error('could not access doi of contest');
    }

    this.domainOfInfluences = await this.domainOfInfluenceService.filterOnlyManagedByCurrentTenantAndNotVirtualTopLevel(
      this.domainOfInfluenceTree.getSelfAndChildrenAsFlatList(contestDomainOfInfluenceNode),
      this.hasAdminPermissions,
    );

    this.selectedDomainOfInfluence = this.domainOfInfluenceTree.findById(this.data.domainOfInfluenceId);

    const availableDomainOfInfluenceTypes = this.domainOfInfluences.map(d => d.type);
    this.domainOfInfluenceTypeItems = this.enumUtil
      .getArrayWithDescriptions<DomainOfInfluenceType>(DomainOfInfluenceType, 'DOMAIN_OF_INFLUENCE.TYPES.')
      .filter(dit => availableDomainOfInfluenceTypes.includes(dit.value));

    this.domainOfInfluencesByType = groupBy(
      this.domainOfInfluences,
      x => x.type,
      x => x,
    );

    this.selectedDomainOfInfluenceType =
      this.selectedDomainOfInfluence && this.selectedDomainOfInfluence.type
        ? this.selectedDomainOfInfluence.type
        : Math.min(...availableDomainOfInfluenceTypes);
  }
}
