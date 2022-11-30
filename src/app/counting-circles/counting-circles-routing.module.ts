/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountingCircleDetailComponent } from './counting-circle-detail/counting-circle-detail.component';
import { CountingCircleMergersComponent } from './counting-circle-mergers/counting-circle-mergers.component';
import { CountingCircleOverviewComponent } from './counting-circle-overview/counting-circle-overview.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CountingCircleOverviewComponent,
  },
  {
    path: 'mergers',
    component: CountingCircleMergersComponent,
  },
  {
    path: 'new',
    component: CountingCircleDetailComponent,
  },
  {
    path: ':countingCircleId',
    component: CountingCircleDetailComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CountingCirclesRoutingModule {}
