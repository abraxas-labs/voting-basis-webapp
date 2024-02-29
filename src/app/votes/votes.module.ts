/**
 * (c) Copyright 2024 by Abraxas Informatik AG
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

const components = [VoteBallotComponent, VoteEditComponent, VoteErfassungInformationsComponent, VoteGeneralInformationsComponent];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, VotesRoutingModule],
  exports: [...components],
})
export class VotesModule {}
