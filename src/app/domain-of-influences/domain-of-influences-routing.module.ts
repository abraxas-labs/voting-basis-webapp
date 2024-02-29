/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DomainOfInfluenceOverviewComponent } from './domain-of-influence-overview/domain-of-influence-overview.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DomainOfInfluenceOverviewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class DomainOfInfluencesRoutingModule {}
