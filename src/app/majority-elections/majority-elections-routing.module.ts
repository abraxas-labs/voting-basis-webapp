/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MajorityElectionEditComponent } from './majority-election-edit/majority-election-edit.component';
import { HasUnsavedChanges, HasUnsavedChangesGuard } from '../core/guards/has-unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'new',
    component: MajorityElectionEditComponent,
    canDeactivate: [(component: HasUnsavedChanges) => inject(HasUnsavedChangesGuard).canDeactivate(component)],
  },
  {
    path: ':majorityElectionId',
    component: MajorityElectionEditComponent,
    canDeactivate: [(component: HasUnsavedChanges) => inject(HasUnsavedChangesGuard).canDeactivate(component)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class MajorityElectionsRoutingModule {}
