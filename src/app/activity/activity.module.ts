/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivityRoutingModule } from './activity-routing.module';
import { ActivityComponent } from './activity.component';

@NgModule({
  declarations: [ActivityComponent],
  imports: [SharedModule, ActivityRoutingModule],
  exports: [ActivityComponent],
})
export class ActivityModule {}
