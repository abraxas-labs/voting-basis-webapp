/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, EnumUtil } from '@abraxas/voting-lib';
import { Component, OnInit } from '@angular/core';
import { CantonSettingsService } from '../../core/canton-settings.service';
import { CantonSettings, newCantonSettings } from '../../core/models/canton-settings.model';
import { DomainOfInfluenceCanton } from '../../core/models/domain-of-influence.model';
import { RolesService } from '../../core/roles.service';
import {
  CantonSettingsEditDialogComponent,
  CantonSettingsEditDialogData,
  CantonSettingsEditDialogResult,
} from '../canton-settings-edit-dialog/canton-settings-edit-dialog.component';

@Component({
  selector: 'app-canton-settings-overview',
  templateUrl: './canton-settings-overview.component.html',
  styleUrls: ['./canton-settings-overview.component.scss'],
})
export class CantonSettingsOverviewComponent implements OnInit {
  public loading: boolean = true;
  public isAdmin: boolean = false;

  public cantonSettingsList: CantonSettings[] = [];

  constructor(
    private readonly cantonSettingsService: CantonSettingsService,
    private readonly rolesService: RolesService,
    private readonly dialogService: DialogService,
    private readonly enumUtil: EnumUtil,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      this.isAdmin = await this.rolesService.isAdmin();
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
      readonly: !this.isAdmin,
    };

    const result = await this.dialogService.openForResult(CantonSettingsEditDialogComponent, data);
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
