/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  AppHeaderBarIamModule,
  AppHeaderBarModule,
  AutocompleteModule,
  ButtonModule,
  CheckboxModule,
  DateModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  ExpansionPanelModule,
  IconButtonModule,
  IconModule,
  LabelModule,
  NavigationModule,
  NavLayoutModule,
  NumberModule,
  RadioButtonModule,
  SimpleStepperModule,
  SnackbarModule,
  SpinnerModule,
  SwitchModule,
  TableModule,
  TabsModule,
  TextareaModule,
  TextModule,
  TimeModule,
  TooltipModule,
  TruncateWithTooltipModule,
  ErrorModule,
} from '@abraxas/base-components';
import { VotingLibModule } from '@abraxas/voting-lib';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DndModule } from 'ngx-drag-drop';
import { MomentModule } from 'ngx-moment';
import { CanEditBallotGroupPipe } from './can-edit-ballot-group.pipe';
import { ContactPersonEditComponent } from './contact-person-edit/contact-person-edit.component';
import { ExportDialogComponent } from './export-dialog/export-dialog.component';
import { GetTranslationPipe } from './get-translation.pipe';
import { HistorizationFilterBarComponent } from './historization-filter-bar/historization-filter-bar.component';
import { ContestImportDialogComponent } from './import/contest-import-dialog/contest-import-dialog.component';
import { ImportContestEditComponent } from './import/import-contest-edit/import-contest-edit.component';
import { ImportFileSelectComponent } from './import/import-file-select/import-file-select.component';
import { ImportMajorityElectionEditComponent } from './import/import-majority-election-edit/import-majority-election-edit.component';
import { ImportPoliticalBusinessesComponent } from './import/import-political-businesses/import-political-businesses.component';
import { ImportProportionalElectionEditComponent } from './import/import-proportional-election-edit/import-proportional-election-edit.component';
import { ImportVoteEditComponent } from './import/import-vote-edit/import-vote-edit.component';
import { MajorityElectionCandidatesImportDialogComponent } from './import/majority-election-candidates-import-dialog/majority-election-candidates-import-dialog.component';
import { PoliticalBusinessImportDialogComponent } from './import/political-business-import-dialog/political-business-import-dialog.component';
import { ProportionalElectionListsAndCandidatesImportDialogComponent } from './import/proportional-election-lists-and-candidates-import-dialog/proportional-election-lists-and-candidates-import-dialog.component';
import { MajorityElectionBallotGroupAssignCandidatesComponent } from './majority-election-ballot-groups/majority-election-ballot-group-assign-candidates/majority-election-ballot-group-assign-candidates.component';
import { MajorityElectionBallotGroupGeneralInformationsComponent } from './majority-election-ballot-groups/majority-election-ballot-group-general-informations/majority-election-ballot-group-general-informations.component';
import { MajorityElectionBallotGroupAssignCandidatesEntryComponent } from './majority-election-ballot-groups/majority-election-ballot-group-assign-candidates-entry/majority-election-ballot-group-assign-candidates-entry.component';
import { MajorityElectionBallotGroupCandidatesComponent } from './majority-election-ballot-groups/majority-election-ballot-group-candidates/majority-election-ballot-group-candidates.component';
import { MajorityElectionBallotGroupDetailComponent } from './majority-election-ballot-groups/majority-election-ballot-group-detail/majority-election-ballot-group-detail.component';
import { MajorityElectionBallotGroupEditDialogComponent } from './majority-election-ballot-groups/majority-election-ballot-group-edit-dialog/majority-election-ballot-group-edit-dialog.component';
import { MajorityElectionBallotGroupOverviewComponent } from './majority-election-ballot-groups/majority-election-ballot-group-overview/majority-election-ballot-group-overview.component';
import { MajorityElectionCandidateEditDialogComponent } from './majority-election-candidate-edit-dialog/majority-election-candidate-edit-dialog.component';
import { MajorityElectionCandidateEditComponent } from './majority-election-candidate-edit/majority-election-candidate-edit.component';
import { MajorityElectionCandidateListComponent } from './majority-election-candidate-list/majority-election-candidate-list.component';
import { PoliticalBusinessUnionDetailCandidatesTabComponent } from './political-business-union-detail-candidates-tab/political-business-union-detail-candidates-tab.component';
import { PoliticalBusinessUnionDetailPoliticalBusinessesTabComponent } from './political-business-union-detail-political-businesses-tab/political-business-union-detail-political-businesses-tab.component';
import { PoliticalBusinessUnionDetailComponent } from './political-business-union-detail/political-business-union-detail.component';
import { SafeHtmlPipe } from './safe-html.pipe';
import { SecondaryMajorityElectionCandidateEditDialogComponent } from './secondary-majority-election-candidate-edit-dialog/secondary-majority-election-candidate-edit-dialog.component';
import { SecondaryMajorityElectionCandidatesComponent } from './secondary-majority-election-candidates/secondary-majority-election-candidates.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { TranslatedFormfieldComponent } from './translated-formfield/translated-formfield.component';
import { TranslatedTextareaComponent } from './translated-textarea/translated-textarea.component';
import { ImportProportionalElectionPartyMappingComponent } from './import/import-proportional-election-party-mapping/import-proportional-election-party-mapping.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { TruncatedValueComponent } from './truncated-value/truncated-value.component';
import { AssignedCountingCirclesDialogComponent } from './assigned-counting-circles-dialog/assigned-counting-circles-dialog.component';
import { MatDialogClose } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';

const components = [
  ContactPersonEditComponent,
  HistorizationFilterBarComponent,
  PoliticalBusinessUnionDetailComponent,
  PoliticalBusinessUnionDetailCandidatesTabComponent,
  PoliticalBusinessUnionDetailPoliticalBusinessesTabComponent,
  SideNavComponent,
  TranslatedFormfieldComponent,
  TranslatedTextareaComponent,
  ContestImportDialogComponent,
  ImportContestEditComponent,
  ImportFileSelectComponent,
  ImportMajorityElectionEditComponent,
  ImportPoliticalBusinessesComponent,
  ImportProportionalElectionEditComponent,
  ImportVoteEditComponent,
  MajorityElectionCandidatesImportDialogComponent,
  PoliticalBusinessImportDialogComponent,
  ProportionalElectionListsAndCandidatesImportDialogComponent,
  ExportDialogComponent,
  SecondaryMajorityElectionCandidatesComponent,
  SecondaryMajorityElectionCandidateEditDialogComponent,
  MajorityElectionBallotGroupAssignCandidatesComponent,
  MajorityElectionBallotGroupGeneralInformationsComponent,
  MajorityElectionBallotGroupCandidatesComponent,
  MajorityElectionBallotGroupDetailComponent,
  MajorityElectionBallotGroupEditDialogComponent,
  MajorityElectionBallotGroupOverviewComponent,
  MajorityElectionCandidateListComponent,
  MajorityElectionCandidateEditComponent,
  MajorityElectionCandidateEditDialogComponent,
  MajorityElectionBallotGroupAssignCandidatesEntryComponent,
  ImportProportionalElectionPartyMappingComponent,
  TruncatedValueComponent,
  AssignedCountingCirclesDialogComponent,
];

const pipes = [GetTranslationPipe, SafeHtmlPipe, CanEditBallotGroupPipe];

const modules = [
  CommonModule,
  SpinnerModule,
  ButtonModule,
  TabsModule,
  IconModule,
  TextareaModule,
  DropdownModule,
  CheckboxModule,
  RadioButtonModule,
  ExpansionPanelModule,
  MomentModule,
  FormsModule,
  SimpleStepperModule,
  TableModule,
  NavLayoutModule,
  NavigationModule,
  AppHeaderBarIamModule,
  AppHeaderBarModule,
  RouterModule,
  TranslateModule,
  VotingLibModule,
  DateModule,
  TextModule,
  DividerModule,
  LabelModule,
  NumberModule,
  SnackbarModule,
  TimeModule,
  DragDropModule,
  DndModule,
  MatIconModule,
  TooltipModule,
  MatTooltip,
  TableModule,
  NavLayoutModule,
  DialogModule,
  MatMenuModule,
  SwitchModule,
  TruncateWithTooltipModule,
  AutocompleteModule,
  IconButtonModule,
  MatDialogClose,
  ReactiveFormsModule,
  ErrorModule,
];

@NgModule({
  imports: [...modules],
  declarations: [...components, ...pipes],
  exports: [...components, ...pipes, ...modules],
})
export class SharedModule {}
