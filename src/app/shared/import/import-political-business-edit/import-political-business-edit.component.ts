/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomainOfInfluenceReportLevelService } from '../../../core/domain-of-influence-report-level.service';
import { DomainOfInfluenceTree } from '../../../core/domain-of-influence-tree';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { DomainOfInfluenceCantonDefaults } from '../../../core/models/canton-settings.model';
import { DomainOfInfluence, DomainOfInfluenceLevel, DomainOfInfluenceType } from '../../../core/models/domain-of-influence.model';
import { groupBy } from '../../../core/utils/array.utils';
import { PermissionService } from '../../../core/permission.service';
import { Permissions } from '../../../core/models/permissions.model';

@Directive()
export abstract class ImportPoliticalBusinessEditComponent<T extends { domainOfInfluenceId: string }> implements OnInit {
  public loading: boolean = true;

  public domainOfInfluenceTypes: EnumItemDescription<DomainOfInfluenceType>[] = [];
  public domainOfInfluencesByType: Partial<Record<DomainOfInfluenceType, DomainOfInfluence[]>> = {};
  public domainOfInfluenceLevels: DomainOfInfluenceLevel[] = [];

  public domainOfInfluences: DomainOfInfluence[] = [];
  public domainOfInfluenceDefaults?: DomainOfInfluenceCantonDefaults;

  public data!: T;

  @Output()
  public valid: EventEmitter<boolean> = new EventEmitter<boolean>();

  public isValid: boolean = false;

  @Input()
  public contestDomainOfInfluenceId: string = '';
  private selectedDomainOfInfluenceValue?: DomainOfInfluence;

  private selectedDomainOfInfluenceTypeValue?: DomainOfInfluenceType;
  private domainOfInfluenceTree?: DomainOfInfluenceTree;
  private hasAdminPermissions = false;

  protected constructor(
    protected readonly enumUtil: EnumUtil,
    private readonly doiReportLevelService: DomainOfInfluenceReportLevelService,
    protected readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly permissionService: PermissionService,
  ) {}

  public get selectedDomainOfInfluence(): DomainOfInfluence | undefined {
    return this.selectedDomainOfInfluenceValue;
  }

  public set selectedDomainOfInfluence(v: DomainOfInfluence | undefined) {
    this.selectedDomainOfInfluenceValue = v;
    this.data.domainOfInfluenceId = v?.id ?? '';

    const politicalBusinessDomainOfInfluenceNode = this.domainOfInfluenceTree?.findNodeById(this.data.domainOfInfluenceId);
    this.domainOfInfluenceLevels = this.doiReportLevelService.buildDomainOfInfluenceReportLevels(politicalBusinessDomainOfInfluenceNode);
    this.handleDomainOfInfluenceChange();
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

  public async ngOnInit(): Promise<void> {
    try {
      this.hasAdminPermissions = await this.permissionService.hasPermission(Permissions.PoliticalBusiness.WriteActionsTenantSameCanton);
      await this.initDomainOfInfluenceData();
    } finally {
      this.loading = false;
    }
  }

  protected setValid(valid: boolean = true): void {
    this.isValid = valid;
    this.valid.emit(valid);
  }

  protected handleDomainOfInfluenceDefaultsChange(): void {}

  protected async handleDomainOfInfluenceChange(): Promise<void> {
    await this.loadDomainOfInfluenceDefaults();
  }

  private async initDomainOfInfluenceData(): Promise<void> {
    this.domainOfInfluenceTree = new DomainOfInfluenceTree(await this.domainOfInfluenceService.listTree(), this.enumUtil);

    const contestDomainOfInfluenceNode = this.domainOfInfluenceTree.findNodeById(this.contestDomainOfInfluenceId);
    if (!contestDomainOfInfluenceNode) {
      throw new Error('could not access doi of contest');
    }

    this.domainOfInfluences = await this.domainOfInfluenceService.filterOnlyManagedByCurrentTenantAndNotVirtualTopLevel(
      this.domainOfInfluenceTree.getSelfAndChildrenAsFlatList(contestDomainOfInfluenceNode),
      this.hasAdminPermissions,
    );

    this.selectedDomainOfInfluence = this.domainOfInfluenceTree.findById(this.data.domainOfInfluenceId);

    const availableDomainOfInfluenceTypes = this.domainOfInfluences.map(d => d.type);
    this.domainOfInfluenceTypes = this.enumUtil
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

  private async loadDomainOfInfluenceDefaults(): Promise<void> {
    if (!this.selectedDomainOfInfluence) {
      return;
    }

    this.domainOfInfluenceDefaults = await this.domainOfInfluenceService.getCantonDefaults(this.selectedDomainOfInfluence.id);

    this.handleDomainOfInfluenceDefaultsChange();
  }
}
