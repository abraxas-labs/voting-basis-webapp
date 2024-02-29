/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ContestArchiveDialogComponent } from './contest-archive-dialog/contest-archive-dialog.component';
import { ContestCountingCircleEVotingTableComponent } from './contest-counting-circle-e-voting-table/contest-counting-circle-e-voting-table.component';
import { ContestDetailComponent } from './contest-detail/contest-detail.component';
import { ContestEditDialogComponent } from './contest-edit-dialog/contest-edit-dialog.component';
import { ContestListComponent } from './contest-list/contest-list.component';
import { ContestOverviewComponent } from './contest-overview/contest-overview.component';
import { ContestPastUnlockDialogComponent } from './contest-past-unlock-dialog/contest-past-unlock-dialog.component';
import { ContestsRoutingModule } from './contests-routing.module';
import { ElectionGroupEditDialogComponent } from './election-group-edit-dialog/election-group-edit-dialog.component';
import { ElectionGroupOverviewComponent } from './election-group-overview/election-group-overview.component';
import { MajorityElectionUnionDetailComponent } from './majority-election-union-detail/majority-election-union-detail.component';
import { PoliticalBusinessUnionEditDialogComponent } from './political-business-union-edit-dialog/political-business-union-edit-dialog.component';
import { PoliticalBusinessUnionEntriesEditDialogComponent } from './political-business-union-entries-edit-dialog/political-business-union-entries-edit-dialog.component';
import { PoliticalBusinessUnionsDialogComponent } from './political-business-unions-dialog/political-business-unions-dialog.component';
import { ProportionalElectionUnionDetailListTabComponent } from './proportional-election-union-detail-list-tab/proportional-election-union-detail-list-tab.component';
import { ProportionalElectionUnionDetailComponent } from './proportional-election-union-detail/proportional-election-union-detail.component';
import { CanDeleteContestPipe } from './shared/can-delete-contest.pipe';
import { CanEditContestPipe } from './shared/can-edit-contest.pipe';
import { OwnsContestPipe } from './shared/owns-contest.pipe';

const components = [
  ContestArchiveDialogComponent,
  ContestCountingCircleEVotingTableComponent,
  ContestDetailComponent,
  ContestEditDialogComponent,
  ContestListComponent,
  ContestOverviewComponent,
  ContestPastUnlockDialogComponent,
  ElectionGroupEditDialogComponent,
  ElectionGroupOverviewComponent,
  MajorityElectionUnionDetailComponent,
  PoliticalBusinessUnionEditDialogComponent,
  PoliticalBusinessUnionEntriesEditDialogComponent,
  PoliticalBusinessUnionsDialogComponent,
  ProportionalElectionUnionDetailComponent,
  ProportionalElectionUnionDetailListTabComponent,
];

const pipes = [CanEditContestPipe, CanDeleteContestPipe, OwnsContestPipe];

@NgModule({
  declarations: [...components, ...pipes],
  imports: [SharedModule, ContestsRoutingModule],
  exports: [...components, ...pipes],
})
export class ContestsModule {}
