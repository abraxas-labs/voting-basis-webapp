/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { CantonSettingsEditDialogComponent } from './canton-settings-edit-dialog/canton-settings-edit-dialog.component';
import { CantonSettingsOverviewComponent } from './canton-settings-overview/canton-settings-overview.component';
import { CantonSettingsRoutingModule } from './canton-settings-routing.module';
import { SharedModule } from '../shared/shared.module';

const components = [CantonSettingsEditDialogComponent, CantonSettingsOverviewComponent];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, CantonSettingsRoutingModule],
  exports: [...components],
})
export class CantonSettingsModule {}
