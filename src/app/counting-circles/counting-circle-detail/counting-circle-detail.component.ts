/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService, Tenant } from '@abraxas/base-components';
import { AsyncInputValidators, EnumItemDescription, EnumUtil, InputValidators, SnackbarService } from '@abraxas/voting-lib';
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
import { distinct } from '../../core/utils/array.utils';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ContactPersonForm } from '../../shared/contact-person-edit/contact-person-edit.component';

@Component({
  selector: 'app-counting-circle-detail',
  templateUrl: './counting-circle-detail.component.html',
  styleUrls: ['./counting-circle-detail.component.scss'],
  standalone: false,
})
export class CountingCircleDetailComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  private eVotingActiveFromString: string = '';

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
  public showEVotingActiveFrom: boolean = false;
  public cantons: EnumItemDescription<DomainOfInfluenceCanton>[];
  public form?: FormGroup<Form>;

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
    private readonly formBuilder: NonNullableFormBuilder,
    enumUtil: EnumUtil,
  ) {
    this.routeSubscription = route.params.subscribe(async ({ countingCircleId }) => {
      await this.load(countingCircleId);
      this.buildForm();
    });
    this.cantons = enumUtil.getArrayWithDescriptions<DomainOfInfluenceCanton>(DomainOfInfluenceCanton, 'DOMAIN_OF_INFLUENCE_CANTONS.');
  }

  public get hasUnsavedChanges(): boolean {
    return this.hasChanges;
  }

  public get canSave(): boolean {
    return (
      !!this.form &&
      this.form.valid &&
      !!this.data &&
      !!this.selectedResponsibleAuthority &&
      !!this.selectedResponsibleAuthority.id &&
      !!this.data.canton &&
      (!this.showEVotingActiveFrom || !!this.data.eVotingActiveFrom)
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
    this.canEditEverything = await this.permissionService.hasPermission(Permissions.CountingCircle.UpdateSameCanton);
    const tenant = await this.auth.getActiveTenant();
    this.tenantId = tenant.id;

    // if the tenant has only domain of influences within one canton, only this canton should be selectable
    await this.filterCantons();
  }

  public async ngOnDestroy(): Promise<void> {
    this.routeSubscription?.unsubscribe();
  }

  public contentChanged(): void {
    this.hasChanges =
      !isEqual(this.data, this.persistedData) ||
      !isEqual(this.selectedResponsibleAuthority?.id, this.originalSelectedResponsibleAuthoritySecureConnectId);
  }

  public updateShowEVotingActiveFrom(showEVotingActiveFrom: boolean): void {
    if (!this.data) {
      return;
    }

    this.showEVotingActiveFrom = showEVotingActiveFrom;

    if (!this.showEVotingActiveFrom) {
      this.data.eVotingActiveFrom = undefined;
    } else {
      this.data.eVotingActiveFrom ??= new Date();
    }
  }

  public updateEVotingActiveFrom(eVotingActiveFrom: string): void {
    if (!this.data || !eVotingActiveFrom || this.eVotingActiveFromString === eVotingActiveFrom) {
      return;
    }

    this.eVotingActiveFromString = eVotingActiveFrom;
    this.data.eVotingActiveFrom = new Date(eVotingActiveFrom);
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

      this.showEVotingActiveFrom = !!this.data.eVotingActiveFrom;

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

  private async filterCantons(): Promise<void> {
    const domainOfInfluences = await this.domainOfInfluenceService.listTree();
    const cantons = distinct(
      domainOfInfluences.map(x => x.canton),
      x => x,
    );

    if (!this.data || cantons.length !== 1) {
      return;
    }

    const canton = cantons[0];
    this.cantons = this.cantons.filter(x => x.value === canton);
    if (this.isNew) {
      this.data.canton = canton;
    }
  }

  private buildForm(): void {
    if (!this.data) {
      return;
    }

    this.form = this.formBuilder.group<Form>({
      name: this.formBuilder.control(this.data.name, {
        validators: [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
        asyncValidators: [AsyncInputValidators.simpleSlText],
      }),
      nameForProtocol: this.formBuilder.control(this.data.nameForProtocol, {
        validators: [Validators.maxLength(100)],
        asyncValidators: [AsyncInputValidators.complexSlText],
      }),
      bfs: this.formBuilder.control(this.data.bfs, {
        validators: [Validators.minLength(1), Validators.maxLength(8), InputValidators.alphaNumWhite],
      }),
      code: this.formBuilder.control(this.data.code, {
        validators: [Validators.minLength(1), Validators.maxLength(20)],
        asyncValidators: [AsyncInputValidators.simpleSlText],
      }),
      sortNumber: this.formBuilder.control(this.data.sortNumber, {
        validators: [Validators.min(0), Validators.max(1000)],
      }),
      contactPersonDuringEvent: this.formBuilder.group({
        familyName: this.formBuilder.control(this.data.contactPersonDuringEvent!.familyName, {
          validators: [Validators.minLength(1), Validators.maxLength(50)],
          asyncValidators: [AsyncInputValidators.complexSlText],
        }),
        firstName: this.formBuilder.control(this.data.contactPersonDuringEvent!.firstName, {
          validators: [Validators.minLength(1), Validators.maxLength(50)],
          asyncValidators: [AsyncInputValidators.complexSlText],
        }),
        phone: this.formBuilder.control(this.data.contactPersonDuringEvent!.phone, {
          validators: [InputValidators.phone],
        }),
        mobilePhone: this.formBuilder.control(this.data.contactPersonDuringEvent!.mobilePhone, {
          validators: [InputValidators.phone],
        }),
        email: this.formBuilder.control(this.data.contactPersonDuringEvent!.email, {
          validators: [Validators.email],
        }),
      }),
      contactPersonAfterEvent: this.formBuilder.group({
        familyName: this.formBuilder.control(this.data.contactPersonAfterEvent!.familyName, {
          validators: [Validators.minLength(1), Validators.maxLength(50)],
          asyncValidators: [AsyncInputValidators.complexSlText],
        }),
        firstName: this.formBuilder.control(this.data.contactPersonAfterEvent!.firstName, {
          validators: [Validators.minLength(1), Validators.maxLength(50)],
          asyncValidators: [AsyncInputValidators.complexSlText],
        }),
        phone: this.formBuilder.control(this.data.contactPersonAfterEvent!.phone, {
          validators: [InputValidators.phone],
        }),
        mobilePhone: this.formBuilder.control(this.data.contactPersonAfterEvent!.mobilePhone, {
          validators: [InputValidators.phone],
        }),
        email: this.formBuilder.control(this.data.contactPersonAfterEvent!.email, {
          validators: [Validators.email],
        }),
      }),
    });
  }

  // currently necessary since not all values are in the reactive form
  public updateContactPerson(): void {
    if (!this.data || !this.form) {
      return;
    }

    this.data.contactPersonDuringEvent = this.form.getRawValue().contactPersonDuringEvent;
    this.data.contactPersonAfterEvent = this.form.getRawValue().contactPersonAfterEvent;
  }
}

export interface Form {
  name: FormControl<string>;
  bfs: FormControl<string>;
  contactPersonDuringEvent: FormGroup<ContactPersonForm>;
  contactPersonAfterEvent: FormGroup<ContactPersonForm>;
  code: FormControl<string>;
  sortNumber: FormControl<number>;
  nameForProtocol: FormControl<string>;
}
