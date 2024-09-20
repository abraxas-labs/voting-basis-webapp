/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecondaryMajorityElectionEditComponent } from './secondary-majority-election-edit/secondary-majority-election-edit.component';

const routes: Routes = [
  {
    path: 'new',
    component: SecondaryMajorityElectionEditComponent,
  },
  {
    path: ':secondaryMajorityElectionId',
    component: SecondaryMajorityElectionEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class SecondaryMajorityElectionRoutingModule {}
