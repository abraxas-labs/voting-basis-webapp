/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MajorityElectionEditComponent } from './majority-election-edit/majority-election-edit.component';
import { HasUnsavedChangesGuard } from '../core/guards/has-unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'new',
    component: MajorityElectionEditComponent,
    canDeactivate: [HasUnsavedChangesGuard],
  },
  {
    path: ':majorityElectionId',
    component: MajorityElectionEditComponent,
    canDeactivate: [HasUnsavedChangesGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MajorityElectionsRoutingModule {}
