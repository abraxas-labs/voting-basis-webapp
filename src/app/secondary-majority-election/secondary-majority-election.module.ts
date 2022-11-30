/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { SecondaryMajorityElectionEditComponent } from './secondary-majority-election-edit/secondary-majority-election-edit.component';
import { SecondaryMajorityElectionGeneralInformationsComponent } from './secondary-majority-election-general-informations/secondary-majority-election-general-informations.component';
import { SecondaryMajorityElectionRoutingModule } from './secondary-majority-election-routing.module';

const components = [SecondaryMajorityElectionEditComponent, SecondaryMajorityElectionGeneralInformationsComponent];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, SecondaryMajorityElectionRoutingModule],
  exports: [...components],
})
export class SecondaryMajorityElectionModule {}
