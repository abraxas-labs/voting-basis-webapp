/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, EnumUtil } from '@abraxas/voting-lib';
import { Component, OnInit } from '@angular/core';
import { CantonSettingsService } from '../../core/canton-settings.service';
import { CantonSettings, newCantonSettings } from '../../core/models/canton-settings.model';
import { DomainOfInfluenceCanton } from '../../core/models/domain-of-influence.model';
import { PermissionService } from '../../core/permission.service';
import {
  CantonSettingsEditDialogComponent,
  CantonSettingsEditDialogData,
  CantonSettingsEditDialogResult,
} from '../canton-settings-edit-dialog/canton-settings-edit-dialog.component';
import { Permissions } from '../../core/models/permissions.model';

@Component({
  selector: 'app-canton-settings-overview',
  templateUrl: './canton-settings-overview.component.html',
})
export class CantonSettingsOverviewComponent implements OnInit {
  public readonly columns = ['name', 'shortName', 'authority'];

  public loading: boolean = true;
  public canCreate: boolean = false;
  public canEdit: boolean = false;

  public cantonSettingsList: CantonSettings[] = [];

  constructor(
    private readonly cantonSettingsService: CantonSettingsService,
    private readonly permissionService: PermissionService,
    private readonly dialogService: DialogService,
    private readonly enumUtil: EnumUtil,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      this.canCreate = await this.permissionService.hasPermission(Permissions.CantonSettings.Create);
      this.canEdit = await this.permissionService.hasPermission(Permissions.CantonSettings.UpdateAll);
      this.cantonSettingsList = await this.cantonSettingsService.list();
    } finally {
      this.loading = false;
    }
  }

  public async createOrEdit(cantonSettings?: CantonSettings): Promise<void> {
    cantonSettings = !cantonSettings
      ? newCantonSettings()
      : {
          ...cantonSettings,
          proportionalElectionMandateAlgorithmsList: [...cantonSettings.proportionalElectionMandateAlgorithmsList],
          swissAbroadVotingRightDomainOfInfluenceTypesList: [...cantonSettings.swissAbroadVotingRightDomainOfInfluenceTypesList],
        };

    const allCantons = this.enumUtil.getArrayWithDescriptions<DomainOfInfluenceCanton>(
      DomainOfInfluenceCanton,
      'DOMAIN_OF_INFLUENCE_CANTONS.',
    );
    const takenCantons = this.cantonSettingsList.filter(c => c.canton !== cantonSettings?.canton).map(c => c.canton);

    const data: CantonSettingsEditDialogData = {
      cantons: allCantons.filter(c => !takenCantons.includes(c.value)),
      cantonSettings,
      readonly: !this.canEdit,
    };

    const result = await this.dialogService.openForResult(CantonSettingsEditDialogComponent, data, { autoFocus: 'first-heading' });
    this.handleCreateOrEdit(result);
  }

  private handleCreateOrEdit(result: CantonSettingsEditDialogResult): void {
    if (!result) {
      return;
    }

    const existingIndex = this.cantonSettingsList.findIndex(l => l.id === result.cantonSettings.id);
    if (existingIndex < 0) {
      this.cantonSettingsList.push(result.cantonSettings);
    } else {
      this.cantonSettingsList[existingIndex] = result.cantonSettings;
    }

    // trigger angular change detection
    this.cantonSettingsList = this.cantonSettingsList.concat([]);
  }
}
