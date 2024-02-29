/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MajorityElectionCandidatesComponent } from './majority-election-candidates/majority-election-candidates.component';
import { MajorityElectionEditComponent } from './majority-election-edit/majority-election-edit.component';
import { MajorityElectionErfassungInformationsComponent } from './majority-election-erfassung-informations/majority-election-erfassung-informations.component';
import { MajorityElectionGeneralInformationsComponent } from './majority-election-general-informations/majority-election-general-informations.component';
import { MajorityElectionsRoutingModule } from './majority-elections-routing.module';

const components = [
  MajorityElectionCandidatesComponent,
  MajorityElectionEditComponent,
  MajorityElectionErfassungInformationsComponent,
  MajorityElectionGeneralInformationsComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, MajorityElectionsRoutingModule],
  exports: [...components],
})
export class MajorityElectionsModule {}
