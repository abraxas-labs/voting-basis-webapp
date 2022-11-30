/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProportionalElectionEditComponent } from './proportional-election-edit/proportional-election-edit.component';

const routes: Routes = [
  {
    path: 'new',
    component: ProportionalElectionEditComponent,
  },
  {
    path: ':proportionalElectionId',
    component: ProportionalElectionEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ProportionalElectionsRoutingModule {}
