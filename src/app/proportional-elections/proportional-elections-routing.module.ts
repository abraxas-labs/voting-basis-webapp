/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProportionalElectionEditComponent } from './proportional-election-edit/proportional-election-edit.component';
import { HasUnsavedChangesGuard } from '../core/guards/has-unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'new',
    component: ProportionalElectionEditComponent,
    canDeactivate: [HasUnsavedChangesGuard],
  },
  {
    path: ':proportionalElectionId',
    component: ProportionalElectionEditComponent,
    canDeactivate: [HasUnsavedChangesGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ProportionalElectionsRoutingModule {}
