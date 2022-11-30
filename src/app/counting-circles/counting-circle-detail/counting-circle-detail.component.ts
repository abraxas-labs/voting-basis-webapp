/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AuthorizationService, Tenant } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CountingCircleService } from '../../core/counting-circle.service';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { CountingCircle, newCountingCircle } from '../../core/models/counting-circle.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { RolesService } from '../../core/roles.service';

@Component({
  selector: 'app-counting-circle-detail',
  templateUrl: './counting-circle-detail.component.html',
  styleUrls: ['./counting-circle-detail.component.scss'],
})
export class CountingCircleDetailComponent implements OnInit, OnDestroy {
  public loading: boolean = true;
  public saving: boolean = false;

  public data: CountingCircle | undefined;
  public domainOfInfluences: DomainOfInfluence[] = [];

  public selectedResponsibleAuthority: Tenant | undefined;

  public isAdmin: boolean = false;
  public tenantId: string = '';
  public isResponsibleAuthorityOrAdmin: boolean = false;
  public isNew: boolean = false;

  private readonly routeSubscription: Subscription;

  constructor(
    private readonly countingCircleService: CountingCircleService,
    private readonly rolesService: RolesService,
    private readonly auth: AuthorizationService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
  ) {
    this.routeSubscription = route.params.subscribe(({ countingCircleId }) => this.load(countingCircleId));
  }

  public get canSave(): boolean {
    return (
      !!this.data && !!this.data.name && !!this.data.bfs && !!this.selectedResponsibleAuthority && !!this.selectedResponsibleAuthority.id
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
      if (this.isAdmin && this.data.responsibleAuthority) {
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
    await this.router.navigate(['..'], { relativeTo: this.route });
  }

  public async ngOnInit(): Promise<void> {
    this.isAdmin = await this.rolesService.isAdmin();
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;
  }

  public async ngOnDestroy(): Promise<void> {
    this.routeSubscription?.unsubscribe();
  }

  private async load(countingCircleId?: string): Promise<void> {
    this.loading = true;
    this.isResponsibleAuthorityOrAdmin = false;
    try {
      this.isNew = !countingCircleId;
      if (!countingCircleId) {
        this.data = newCountingCircle();
        // only admins can create counting circles
        this.isResponsibleAuthorityOrAdmin = true;
        return;
      }

      this.data = await this.countingCircleService.get(countingCircleId);
      this.domainOfInfluences = await this.domainOfInfluenceService.listForCountingCircle(this.data.id);

      if (!this.data?.responsibleAuthority) {
        return;
      }

      this.selectedResponsibleAuthority = {
        name: this.data.responsibleAuthority.name,
        id: this.data.responsibleAuthority.secureConnectId,
      } as Tenant;

      // only admins can change responsible authority, so we can set isResponsibleAuthorityOrAdmin once at loading
      this.isResponsibleAuthorityOrAdmin = this.isAdmin || this.tenantId === this.data.responsibleAuthority.secureConnectId;
    } finally {
      this.loading = false;
    }
  }
}
