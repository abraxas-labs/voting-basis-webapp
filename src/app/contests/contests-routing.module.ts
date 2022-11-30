/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContestDetailComponent } from './contest-detail/contest-detail.component';
import { ContestOverviewComponent } from './contest-overview/contest-overview.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ContestOverviewComponent,
  },
  {
    path: ':contestId',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ContestDetailComponent,
      },
      {
        path: 'votes',
        loadChildren: () => import('../votes/votes.module').then(x => x.VotesModule),
      },
      {
        path: 'proportional-elections',
        loadChildren: () => import('../proportional-elections/proportional-elections.module').then(x => x.ProportionalElectionsModule),
      },
      {
        path: 'majority-elections',
        loadChildren: () => import('../majority-elections/majority-elections.module').then(x => x.MajorityElectionsModule),
      },
      {
        path: 'secondary-majority-elections',
        loadChildren: () =>
          import('../secondary-majority-election/secondary-majority-election.module').then(x => x.SecondaryMajorityElectionModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ContestsRoutingModule {}
