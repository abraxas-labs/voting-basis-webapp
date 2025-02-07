/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, PaginatorComponent, TableDataSource, Tenant } from '@abraxas/base-components';
import { DialogService, EnumUtil, SnackbarService, TreeNode } from '@abraxas/voting-lib';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CountingCircleService } from '../../core/counting-circle.service';
import { DomainOfInfluenceTree } from '../../core/domain-of-influence-tree';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluenceCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence, DomainOfInfluenceType, newDomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { PermissionService } from '../../core/permission.service';
import { HistorizationFilter, newHistorizationFilter } from '../../shared/historization-filter-bar/historization-filter-bar.component';
import {
  DomainOfInfluenceCountingCircleAssignDialogComponent,
  DomainOfInfluenceCountingCircleAssignDialogData,
  DomainOfInfluenceCountingCircleAssignDialogResult,
} from '../domain-of-influence-counting-circle-assign-dialog/domain-of-influence-counting-circle-assign-dialog.component';
import {
  DomainOfInfluenceEditDialogComponent,
  DomainOfInfluenceEditDialogData,
  DomainOfInfluenceEditDialogResult,
} from '../domain-of-influence-edit-dialog/domain-of-influence-edit-dialog.component';
import { Permissions } from '../../core/models/permissions.model';
import { flatMap } from '../../core/utils/array.utils';

@Component({
  selector: 'app-domain-of-influence-overview',
  templateUrl: './domain-of-influence-overview.component.html',
  styleUrls: ['./domain-of-influence-overview.component.scss'],
})
export class DomainOfInfluenceOverviewComponent implements OnInit {
  public readonly columns = ['name', 'bfs', 'authority'];

  @ViewChild('paginator')
  public paginator!: PaginatorComponent;

  public tree: DomainOfInfluenceTree | undefined;
  public domainOfInfluences: DomainOfInfluence[] = [];

  public canCreate: boolean = false;
  public canEditEverything: boolean = false;
  public canEditSameTenant: boolean = false;
  public canDelete: boolean = false;
  public canAssignCountingCircles: boolean = false;
  public loading: boolean = true;
  public loadingDetail: boolean = false;
  public loadingAssignableCountingCircles: boolean = false;
  public historizationFilter: HistorizationFilter = newHistorizationFilter();

  public selectedNode?: TreeNode<DomainOfInfluence>;

  public dataSource = new TableDataSource<DomainOfInfluenceCountingCircle>();

  public selectedDomainOfInfluenceValue?: DomainOfInfluence;
  private tenant?: Tenant;

  constructor(
    private readonly i18n: TranslateService,
    private readonly permissionService: PermissionService,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly countingCircleService: CountingCircleService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
    private readonly auth: AuthorizationService,
    private readonly enumUtil: EnumUtil,
    private readonly cd: ChangeDetectorRef,
  ) {}

  public get selectedDomainOfInfluence(): DomainOfInfluence | undefined {
    return this.selectedDomainOfInfluenceValue;
  }

  public set selectedDomainOfInfluence(v: DomainOfInfluence | undefined) {
    this.selectedDomainOfInfluenceValue = v;
  }

  public async ngOnInit(): Promise<void> {
    try {
      this.canCreate = await this.permissionService.hasPermission(Permissions.DomainOfInfluence.CreateSameCanton);
      this.canAssignCountingCircles = await this.permissionService.hasPermission(Permissions.DomainOfInfluenceHierarchy.UpdateSameCanton);
      this.canEditEverything = await this.permissionService.hasPermission(Permissions.DomainOfInfluence.UpdateSameCanton);
      this.canEditSameTenant = await this.permissionService.hasPermission(Permissions.DomainOfInfluence.UpdateSameTenant);
      this.canDelete = await this.permissionService.hasPermission(Permissions.DomainOfInfluence.DeleteSameCanton);
      this.tenant = await this.auth.getActiveTenant();
      await this.loadTree();
    } finally {
      this.loading = false;
    }
  }

  public async nodeSelect(node: TreeNode<DomainOfInfluence>): Promise<void> {
    this.selectedNode = node;

    if (!node || !node.data) {
      this.selectedDomainOfInfluence = undefined;
      return;
    }

    const editable = !this.historizationFilter.date && !node.data.deletedOn;
    node.showEditButton = editable && (this.canEditEverything || (node.data.secureConnectId === this.tenant?.id && this.canEditSameTenant));
    node.showInfoButton = editable && !node.showEditButton;
    node.showDeleteButton = editable && this.canDelete;

    // prevent reload same twice
    if (this.selectedDomainOfInfluence && node.data.id === this.selectedDomainOfInfluence.id) {
      return;
    }

    this.loadingDetail = true;
    try {
      if (!this.historizationFilter.useHistorizationRequests) {
        node.data.countingCircles = await this.countingCircleService.listAssignedForDomainOfInfluence(node.data.id);
        node.data.parties = await this.domainOfInfluenceService.listParties(node.data.id);
      } else {
        node.data.countingCircles = await this.countingCircleService.listAssignedForDomainOfInfluenceSnapshot(
          node.data.id,
          this.historizationFilter.date,
        );
      }

      this.selectedDomainOfInfluence = node.data;
    } finally {
      this.loadingDetail = false;
      this.updateAssignedCountingCirclesTable();
    }
  }

  public async nodeEdit(node: TreeNode<DomainOfInfluence>, readonly: boolean): Promise<void> {
    if (!node.data) {
      return;
    }

    const [domainOfInfluence, countingCircles] = await Promise.all([
      this.domainOfInfluenceService.get(node.data.id),
      !this.historizationFilter.useHistorizationRequests
        ? this.countingCircleService.listAssignedForDomainOfInfluence(node.data.id)
        : Promise.resolve([]),
    ]);

    const data: DomainOfInfluenceEditDialogData = {
      domainOfInfluence: {
        ...domainOfInfluence,
        countingCircles,
      },
      parent: node.parentNode?.data,
      readonly,
      availableSuperiorAuthorityDomainOfInfluences: this.domainOfInfluences.filter(
        doi => doi.id !== node.data.id && doi.type <= DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU,
      ),
    };

    const result = await this.dialogService.openForResult(DomainOfInfluenceEditDialogComponent, data);
    this.handleUpdateDomainOfInfluence(result);
  }

  public async nodeDelete(node: TreeNode<DomainOfInfluence>): Promise<void> {
    if (!node.data || !this.tree) {
      return;
    }

    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'DOMAIN_OF_INFLUENCE.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    await this.domainOfInfluenceService.delete(node.data.id);

    node.showDeleteButton = false;
    node.showEditButton = false;
    node.data.deletedOn = new Date();
    if (!this.historizationFilter.includeDeleted) {
      this.tree.remove(node);
      this.selectedDomainOfInfluence = undefined;
    }

    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }

  public async create(): Promise<void> {
    const domainOfInfluence = newDomainOfInfluence();
    domainOfInfluence.parties = !this.selectedDomainOfInfluence
      ? []
      : await this.domainOfInfluenceService.listParties(this.selectedDomainOfInfluence.id);

    for (const party of domainOfInfluence.parties) {
      party.inherited = true;
    }

    const data: DomainOfInfluenceEditDialogData = {
      domainOfInfluence,
      parent: this.selectedDomainOfInfluence,
      readonly: false,
      availableSuperiorAuthorityDomainOfInfluences: this.domainOfInfluences.filter(
        doi => doi.type <= DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU,
      ),
    };

    const result = await this.dialogService.openForResult(DomainOfInfluenceEditDialogComponent, data);
    this.handleCreateDomainOfInfluence(result);
  }

  public async assignCountingCircles(): Promise<void> {
    if (!this.selectedDomainOfInfluence) {
      return;
    }

    this.loadingAssignableCountingCircles = true;
    let countingCircles = [];

    try {
      // loading counting circles here to simplify dialog handling
      countingCircles = await this.countingCircleService.listAssignableForDomainOfInfluence(this.selectedDomainOfInfluence.id);
    } finally {
      this.loadingAssignableCountingCircles = false;
    }

    const data: DomainOfInfluenceCountingCircleAssignDialogData = {
      domainOfInfluence: this.selectedDomainOfInfluence,
      countingCircles,
    };

    this.dialogService
      .open(DomainOfInfluenceCountingCircleAssignDialogComponent, data)
      .afterClosed()
      .subscribe((result: DomainOfInfluenceCountingCircleAssignDialogResult) => {
        if (!result) {
          return;
        }
        this.selectedDomainOfInfluence = result.domainOfInfluence;
      });
  }

  public async historizationFilterChange(filter: HistorizationFilter): Promise<void> {
    this.historizationFilter = filter;
    await this.loadTree();
  }

  private handleUpdateDomainOfInfluence(result: DomainOfInfluenceEditDialogResult): void {
    if (!result || !result.domainOfInfluence || !this.tree) {
      return;
    }

    this.tree.updateNode(result.domainOfInfluence);
  }

  private handleCreateDomainOfInfluence(result: DomainOfInfluenceEditDialogResult): void {
    if (!result || !result.domainOfInfluence || !this.tree) {
      return;
    }

    result.domainOfInfluence.createdOn = new Date();
    result.domainOfInfluence.modifiedOn = new Date();
    this.tree.addChildNode(result.domainOfInfluence, this.selectedNode);
  }

  private async loadTree(): Promise<void> {
    this.selectedDomainOfInfluence = undefined;
    this.loading = true;
    try {
      const tree = !this.historizationFilter.useHistorizationRequests
        ? await this.domainOfInfluenceService.listTree()
        : await this.domainOfInfluenceService.listTreeSnapshot(this.historizationFilter.includeDeleted, this.historizationFilter.date);

      this.tree = new DomainOfInfluenceTree(tree, this.enumUtil);
      this.domainOfInfluences = flatMap(this.tree.nodes.map(n => this.tree!.getSelfAndChildrenAsFlatList(n))).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    } finally {
      this.loading = false;
    }
  }

  private updateAssignedCountingCirclesTable(): void {
    this.cd.detectChanges();
    this.dataSource.paginator = this.paginator;
    this.dataSource.data = this.selectedDomainOfInfluence?.countingCircles ?? [];
  }
}
