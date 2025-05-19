/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Authority } from '../../core/models/counting-circle.model';

@Component({
  selector: 'app-authority-address-edit',
  templateUrl: './authority-address-edit.component.html',
  standalone: false,
})
export class AuthorityAddressEditComponent {
  @Input()
  public authority!: Authority;

  @Input()
  public readonly: boolean = true;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();
}
