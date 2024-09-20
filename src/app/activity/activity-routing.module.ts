/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityComponent } from './activity.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ActivityComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ActivityRoutingModule {}
