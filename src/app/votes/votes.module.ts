/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { VoteBallotComponent } from './vote-ballot/vote-ballot.component';
import { VoteEditComponent } from './vote-edit/vote-edit.component';
import { VoteErfassungInformationsComponent } from './vote-erfassung-informations/vote-erfassung-informations.component';
import { VoteGeneralInformationsComponent } from './vote-general-informations/vote-general-informations.component';
import { VotesRoutingModule } from './votes-routing.module';
import { VoteStandardBallotComponent } from './vote-ballot/vote-standard-ballot/vote-standard-ballot.component';
import { VoteVariantsOnSingleBallotComponent } from './vote-ballot/vote-variants-on-single-ballot/vote-variants-on-single-ballot.component';
import { VoteVariantsOnMultipleBallotsComponent } from './vote-ballot/vote-variants-on-multiple-ballots/vote-variants-on-multiple-ballots.component';

const components = [
  VoteBallotComponent,
  VoteEditComponent,
  VoteErfassungInformationsComponent,
  VoteGeneralInformationsComponent,
  VoteStandardBallotComponent,
  VoteVariantsOnSingleBallotComponent,
  VoteVariantsOnMultipleBallotsComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, VotesRoutingModule],
  exports: [...components],
})
export class VotesModule {}
