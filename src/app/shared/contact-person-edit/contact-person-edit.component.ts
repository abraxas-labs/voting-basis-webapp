/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { ContactPerson } from '../../core/models/contact-person.model';

@Component({
  selector: 'app-contact-person-edit',
  templateUrl: './contact-person-edit.component.html',
  styleUrls: ['./contact-person-edit.component.scss'],
})
export class ContactPersonEditComponent {
  @Input()
  public disabled: boolean = false;

  @Input()
  public contactPerson!: ContactPerson;
}
