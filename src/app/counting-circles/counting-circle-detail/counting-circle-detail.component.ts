/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, Tenant } from '@abraxas/base-components';
import { EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CountingCircleService } from '../../core/counting-circle.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { CountingCircle, newCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence, DomainOfInfluenceCanton } from '../../core/models/domain-of-influence.model';
import { PermissionService } from '../../core/permission.service';
import { Permissions } from '../../core/models/permissions.model';
import { HasUnsavedChanges } from '../../core/guards/has-unsaved-changes.guard';
import { cloneDeep, isEqual } from 'lodash';

@Component({
  selector: 'app-counting-circle-detail',
  templateUrl: './counting-circle-detail.component.html',
  styleUrls: ['./counting-circle-detail.component.scss'],
})
export class CountingCircleDetailComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  @HostListener('window:beforeunload')
  public beforeUnload(): boolean {
    return !this.hasChanges;
  }

  public loading: boolean = true;
  public saving: boolean = false;

  public data: CountingCircle | undefined;
  public persistedData: CountingCircle | undefined;
  public domainOfInfluences: DomainOfInfluence[] = [];

  public selectedResponsibleAuthority: Tenant | undefined;
  public originalSelectedResponsibleAuthoritySecureConnectId: string | undefined;

  public canEditEverything: boolean = false;
  public isResponsibleAuthorityOrCanEditEverything: boolean = false;
  public tenantId: string = '';
  public isNew: boolean = false;
  public hasChanges: boolean = false;

  public readonly cantons: EnumItemDescription<DomainOfInfluenceCanton>[];
  private readonly routeSubscription: Subscription;

  constructor(
    private readonly countingCircleService: CountingCircleService,
    private readonly permissionService: PermissionService,
    private readonly auth: AuthorizationService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    enumUtil: EnumUtil,
  ) {
    this.routeSubscription = route.params.subscribe(({ countingCircleId }) => this.load(countingCircleId));
    this.cantons = enumUtil.getArrayWithDescriptions<DomainOfInfluenceCanton>(DomainOfInfluenceCanton, 'DOMAIN_OF_INFLUENCE_CANTONS.');
  }

  public get hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.name &&
      !!this.data.bfs &&
      !!this.selectedResponsibleAuthority &&
      !!this.selectedResponsibleAuthority.id &&
      !!this.data.canton
    );
  }

  public async cancel(): Promise<void> {
    await this.router.navigate(['..'], { relativeTo: this.route });
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    try {
      this.saving = true;
      if (this.canEditEverything && this.data.responsibleAuthority) {
        this.data.responsibleAuthority.secureConnectId = this.selectedResponsibleAuthority?.id || '';
        this.data.responsibleAuthority.name = this.selectedResponsibleAuthority?.name || '';
      }

      if (this.isNew) {
        await this.countingCircleService.create(this.data);
      } else {
        await this.countingCircleService.update(this.data);
      }
    } finally {
      this.saving = false;
    }

    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
    this.hasChanges = false;
    await this.router.navigate(['..'], { relativeTo: this.route });
  }

  public async ngOnInit(): Promise<void> {
    this.canEditEverything = await this.permissionService.hasAnyPermission(
      Permissions.CountingCircle.UpdateSameCanton,
      Permissions.CountingCircle.UpdateAll,
    );
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;
  }

  public async ngOnDestroy(): Promise<void> {
    this.routeSubscription?.unsubscribe();
  }

  public contentChanged(): void {
    this.hasChanges =
      !isEqual(this.data, this.persistedData) ||
      !isEqual(this.selectedResponsibleAuthority?.id, this.originalSelectedResponsibleAuthoritySecureConnectId);
  }

  private async load(countingCircleId?: string): Promise<void> {
    this.loading = true;
    this.isResponsibleAuthorityOrCanEditEverything = false;
    try {
      this.isNew = !countingCircleId;
      if (!countingCircleId) {
        this.persistedData = newCountingCircle();
        this.data = cloneDeep(this.persistedData);
        this.isResponsibleAuthorityOrCanEditEverything = true;
        return;
      }

      this.persistedData = await this.countingCircleService.get(countingCircleId);
      this.data = cloneDeep(this.persistedData);
      this.domainOfInfluences = await this.domainOfInfluenceService.listForCountingCircle(this.data.id);

      if (!this.data?.responsibleAuthority) {
        return;
      }

      this.selectedResponsibleAuthority = {
        name: this.data.responsibleAuthority.name,
        id: this.data.responsibleAuthority.secureConnectId,
      } as Tenant;

      this.originalSelectedResponsibleAuthoritySecureConnectId = cloneDeep(this.selectedResponsibleAuthority.id);

      this.isResponsibleAuthorityOrCanEditEverything =
        this.canEditEverything || this.tenantId === this.data.responsibleAuthority.secureConnectId;
    } finally {
      this.loading = false;
    }
  }
}
