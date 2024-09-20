/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthThemeGuard, ThemeService } from '@abraxas/voting-lib';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: ThemeService.NoTheme,
  },
  {
    path: ':theme',
    canActivate: [AuthThemeGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'contests',
      },
      {
        path: 'counting-circles',
        loadChildren: () => import('./counting-circles/counting-circles.module').then(x => x.CountingCirclesModule),
      },
      {
        path: 'domain-of-influences',
        loadChildren: () => import('./domain-of-influences/domain-of-influences.module').then(x => x.DomainOfInfluencesModule),
      },
      {
        path: 'contests',
        loadChildren: () => import('./contests/contests.module').then(x => x.ContestsModule),
      },
      {
        path: 'activities',
        loadChildren: () => import('./activity/activity.module').then(x => x.ActivityModule),
      },
      {
        path: 'canton-settings',
        loadChildren: () => import('./canton-settings/canton-settings.module').then(x => x.CantonSettingsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
