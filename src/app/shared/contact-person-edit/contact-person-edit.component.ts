/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContactPerson } from '../../core/models/contact-person.model';

@Component({
  selector: 'app-contact-person-edit',
  templateUrl: './contact-person-edit.component.html',
  styleUrls: ['./contact-person-edit.component.scss'],
})
export class ContactPersonEditComponent {
  @Input()
  public readonly: boolean = false;

  @Input()
  public contactPerson!: ContactPerson;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();
}
