/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AuthorityAddressEditComponent } from './authority-address-edit/authority-address-edit.component';
import { CountingCircleDetailComponent } from './counting-circle-detail/counting-circle-detail.component';
import { CountingCircleMergerDialogComponent } from './counting-circle-merger-dialog/counting-circle-merger-dialog.component';
import { CountingCircleMergerGeneralInformationsComponent } from './counting-circle-merger-general-informations/counting-circle-merger-general-informations.component';
import { CountingCircleMergerSelectComponent } from './counting-circle-merger-select/counting-circle-merger-select.component';
import { CountingCircleMergersComponent } from './counting-circle-mergers/counting-circle-mergers.component';
import { CountingCircleOverviewComponent } from './counting-circle-overview/counting-circle-overview.component';
import { CountingCirclesRoutingModule } from './counting-circles-routing.module';
import { CountingCircleElectoratesComponent } from './counting-circle-electorates/counting-circle-electorates.component';
import { CountingCircleElectorateAssignDialogComponent } from './counting-circle-electorate-assign-dialog/counting-circle-electorate-assign-dialog.component';

const components = [
  AuthorityAddressEditComponent,
  CountingCircleDetailComponent,
  CountingCircleMergerDialogComponent,
  CountingCircleMergerGeneralInformationsComponent,
  CountingCircleMergerSelectComponent,
  CountingCircleMergersComponent,
  CountingCircleOverviewComponent,
  CountingCircleElectoratesComponent,
  CountingCircleElectorateAssignDialogComponent,
];

@NgModule({
  declarations: [...components],
  imports: [SharedModule, CountingCirclesRoutingModule],
  exports: [...components],
})
export class CountingCirclesModule {}
