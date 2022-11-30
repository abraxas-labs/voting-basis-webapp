/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Component, Input } from '@angular/core';
import { Authority } from '../../core/models/counting-circle.model';

@Component({
  selector: 'app-authority-address-edit',
  templateUrl: './authority-address-edit.component.html',
})
export class AuthorityAddressEditComponent {
  @Input()
  public authority!: Authority;

  @Input()
  public disabled: boolean = true;
}
