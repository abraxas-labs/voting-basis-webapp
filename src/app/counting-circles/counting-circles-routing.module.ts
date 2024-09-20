/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { inject, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountingCircleDetailComponent } from './counting-circle-detail/counting-circle-detail.component';
import { CountingCircleMergersComponent } from './counting-circle-mergers/counting-circle-mergers.component';
import { CountingCircleOverviewComponent } from './counting-circle-overview/counting-circle-overview.component';
import { HasUnsavedChanges, HasUnsavedChangesGuard } from '../core/guards/has-unsaved-changes.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CountingCircleOverviewComponent,
  },
  {
    path: 'mergers',
    component: CountingCircleMergersComponent,
  },
  {
    path: 'new',
    component: CountingCircleDetailComponent,
    canDeactivate: [(component: HasUnsavedChanges) => inject(HasUnsavedChangesGuard).canDeactivate(component)],
  },
  {
    path: ':countingCircleId',
    component: CountingCircleDetailComponent,
    canDeactivate: [(component: HasUnsavedChanges) => inject(HasUnsavedChangesGuard).canDeactivate(component)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class CountingCirclesRoutingModule {}
