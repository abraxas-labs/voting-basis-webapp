/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MajorityElectionEditComponent } from './majority-election-edit/majority-election-edit.component';

const routes: Routes = [
  {
    path: 'new',
    component: MajorityElectionEditComponent,
  },
  {
    path: ':majorityElectionId',
    component: MajorityElectionEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MajorityElectionsRoutingModule {}
