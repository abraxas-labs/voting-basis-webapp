/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ContestArchiveDialogComponent } from './contest-archive-dialog/contest-archive-dialog.component';
import { ContestDetailComponent } from './contest-detail/contest-detail.component';
import { ContestEditDialogComponent } from './contest-edit-dialog/contest-edit-dialog.component';
import { ContestListComponent } from './contest-list/contest-list.component';
import { ContestOverviewComponent } from './contest-overview/contest-overview.component';
import { ContestPastUnlockDialogComponent } from './contest-past-unlock-dialog/contest-past-unlock-dialog.component';
import { ContestsRoutingModule } from './contests-routing.module';
import { MajorityElectionUnionDetailComponent } from './majority-election-union-detail/majority-election-union-detail.component';
import { PoliticalBusinessUnionEditDialogComponent } from './political-business-union-edit-dialog/political-business-union-edit-dialog.component';
import { PoliticalBusinessUnionEntriesEditDialogComponent } from './political-business-union-entries-edit-dialog/political-business-union-entries-edit-dialog.component';
import { PoliticalBusinessUnionsDialogComponent } from './political-business-unions-dialog/political-business-unions-dialog.component';
import { ProportionalElectionUnionDetailListTabComponent } from './proportional-election-union-detail-list-tab/proportional-election-union-detail-list-tab.component';
import { ProportionalElectionUnionDetailComponent } from './proportional-election-union-detail/proportional-election-union-detail.component';
import { PoliticalAssemblyEditDialogComponent } from './political-assembly-edit-dialog/political-assembly-edit-dialog.component';

const components = [
  ContestArchiveDialogComponent,
  ContestDetailComponent,
  ContestEditDialogComponent,
  ContestListComponent,
  ContestOverviewComponent,
  ContestPastUnlockDialogComponent,
  MajorityElectionUnionDetailComponent,
  PoliticalBusinessUnionEditDialogComponent,
  PoliticalBusinessUnionEntriesEditDialogComponent,
  PoliticalBusinessUnionsDialogComponent,
  ProportionalElectionUnionDetailComponent,
  ProportionalElectionUnionDetailListTabComponent,
  PoliticalAssemblyEditDialogComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, ContestsRoutingModule],
  exports: [...components],
})
export class ContestsModule {}
