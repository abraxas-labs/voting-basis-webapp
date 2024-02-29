/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ProportionalElectionCandidateEditDialogComponent } from './proportional-election-candidate-edit-dialog/proportional-election-candidate-edit-dialog.component';
import { ProportionalElectionCandidatesComponent } from './proportional-election-candidates/proportional-election-candidates.component';
import { ProportionalElectionEditComponent } from './proportional-election-edit/proportional-election-edit.component';
import { ProportionalElectionErfassungInformationsComponent } from './proportional-election-erfassung-informations/proportional-election-erfassung-informations.component';
import { ProportionalElectionGeneralInformationsComponent } from './proportional-election-general-informations/proportional-election-general-informations.component';
import { ProportionalElectionListEditDialogComponent } from './proportional-election-lists/proportional-election-list-edit-dialog/proportional-election-list-edit-dialog.component';
import { ProportionalElectionListUnionEditDialogComponent } from './proportional-election-lists/proportional-election-list-union-edit-dialog/proportional-election-list-union-edit-dialog.component';
import { ProportionalElectionListUnionEntriesEditDialogComponent } from './proportional-election-lists/proportional-election-list-union-entries-edit-dialog/proportional-election-list-union-entries-edit-dialog.component';
import { ProportionalElectionListUnionMainListEditDialogComponent } from './proportional-election-lists/proportional-election-list-union-main-list-edit-dialog/proportional-election-list-union-main-list-edit-dialog.component';
import { ProportionalElectionListUnionsDialogComponent } from './proportional-election-lists/proportional-election-list-unions-dialog/proportional-election-list-unions-dialog.component';
import { ProportionalElectionListsComponent } from './proportional-election-lists/proportional-election-lists.component';
import { ProportionalElectionsRoutingModule } from './proportional-elections-routing.module';

const components = [
  ProportionalElectionCandidateEditDialogComponent,
  ProportionalElectionCandidatesComponent,
  ProportionalElectionEditComponent,
  ProportionalElectionErfassungInformationsComponent,
  ProportionalElectionGeneralInformationsComponent,
  ProportionalElectionListEditDialogComponent,
  ProportionalElectionListUnionEditDialogComponent,
  ProportionalElectionListUnionEntriesEditDialogComponent,
  ProportionalElectionListUnionMainListEditDialogComponent,
  ProportionalElectionListUnionsDialogComponent,
  ProportionalElectionListsComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, ProportionalElectionsRoutingModule],
  exports: [...components],
})
export class ProportionalElectionsModule {}
