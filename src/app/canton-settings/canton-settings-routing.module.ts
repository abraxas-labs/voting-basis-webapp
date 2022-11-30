/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CantonSettingsOverviewComponent } from './canton-settings-overview/canton-settings-overview.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CantonSettingsOverviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CantonSettingsRoutingModule {}
