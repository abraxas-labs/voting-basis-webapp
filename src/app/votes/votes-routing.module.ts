/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoteEditComponent } from './vote-edit/vote-edit.component';
import { HasUnsavedChangesGuard } from '../core/guards/has-unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'new',
    component: VoteEditComponent,
    canDeactivate: [HasUnsavedChangesGuard],
  },
  {
    path: ':voteId',
    component: VoteEditComponent,
    canDeactivate: [HasUnsavedChangesGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class VotesRoutingModule {}
