/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VoteEditComponent } from './vote-edit/vote-edit.component';

const routes: Routes = [
  {
    path: 'new',
    component: VoteEditComponent,
  },
  {
    path: ':voteId',
    component: VoteEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class VotesRoutingModule {}
