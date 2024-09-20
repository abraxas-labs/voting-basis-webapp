/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoteEditComponent } from './vote-edit/vote-edit.component';
import { HasUnsavedChanges, HasUnsavedChangesGuard } from '../core/guards/has-unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'new',
    component: VoteEditComponent,
    canDeactivate: [(component: HasUnsavedChanges) => inject(HasUnsavedChangesGuard).canDeactivate(component)],
  },
  {
    path: ':voteId',
    component: VoteEditComponent,
    canDeactivate: [(component: HasUnsavedChanges) => inject(HasUnsavedChangesGuard).canDeactivate(component)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class VotesRoutingModule {}
