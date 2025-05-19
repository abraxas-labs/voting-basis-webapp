/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contact-person-edit',
  templateUrl: './contact-person-edit.component.html',
  styleUrls: ['./contact-person-edit.component.scss'],
  standalone: false,
})
export class ContactPersonEditComponent {
  @Input()
  public readonly: boolean = false;

  @Input()
  public formGroup?: FormGroup<ContactPersonForm>;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();
}

export interface ContactPersonForm {
  familyName: FormControl<string>;
  firstName: FormControl<string>;
  phone: FormControl<string>;
  mobilePhone: FormControl<string>;
  email: FormControl<string>;
}
