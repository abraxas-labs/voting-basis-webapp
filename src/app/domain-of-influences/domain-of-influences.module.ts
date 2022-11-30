/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ComparisonCountOfVotersCountingCircleAssignDialogComponent } from './comparison-count-of-voters-counting-circle-assign-dialog/comparison-count-of-voters-counting-circle-assign-dialog.component';
import { DomainOfInfluenceCountingCircleAssignDialogComponent } from './domain-of-influence-counting-circle-assign-dialog/domain-of-influence-counting-circle-assign-dialog.component';
import { DomainOfInfluenceEditDialogComponent } from './domain-of-influence-edit-dialog/domain-of-influence-edit-dialog.component';
import { DomainOfInfluenceLogoEditComponent } from './domain-of-influence-logo-edit/domain-of-influence-logo-edit.component';
import { DomainOfInfluenceOverviewComponent } from './domain-of-influence-overview/domain-of-influence-overview.component';
import { DomainOfInfluencePartiesComponent } from './domain-of-influence-parties/domain-of-influence-parties.component';
import { DomainOfInfluencePartyEditDialogComponent } from './domain-of-influence-party-edit-dialog/domain-of-influence-party-edit-dialog.component';
import { DomainOfInfluencePartyTableComponent } from './domain-of-influence-party-table/domain-of-influence-party-table.component';
import { DomainOfInfluenceVotingCardDataEditComponent } from './domain-of-influence-voting-card-data-edit/domain-of-influence-voting-card-data-edit.component';
import { DomainOfInfluencesRoutingModule } from './domain-of-influences-routing.module';
import { ExportConfigurationAssignDialogComponent } from './export-configuration-assign-dialog/export-configuration-assign-dialog.component';
import { ExportConfigurationsComponent } from './export-configurations/export-configurations.component';
import { PlausibilisationConfigurationComponent } from './plausibilisation-configuration/plausibilisation-configuration.component';
import { DomainOfInfluenceLogoUrlPipe } from './shared/domain-of-influence-logo-url.pipe';

const components = [
  ComparisonCountOfVotersCountingCircleAssignDialogComponent,
  DomainOfInfluenceCountingCircleAssignDialogComponent,
  DomainOfInfluenceEditDialogComponent,
  DomainOfInfluenceLogoEditComponent,
  DomainOfInfluenceOverviewComponent,
  DomainOfInfluencePartiesComponent,
  DomainOfInfluencePartyEditDialogComponent,
  DomainOfInfluencePartyTableComponent,
  DomainOfInfluenceVotingCardDataEditComponent,
  ExportConfigurationAssignDialogComponent,
  ExportConfigurationsComponent,
  PlausibilisationConfigurationComponent,
];

const pipes = [DomainOfInfluenceLogoUrlPipe];

@NgModule({
  declarations: [...components, ...pipes],
  imports: [SharedModule, DomainOfInfluencesRoutingModule],
  exports: [...components, ...pipes],
})
export class DomainOfInfluencesModule {}
