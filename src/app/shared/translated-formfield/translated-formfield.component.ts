/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component } from '@angular/core';
import { TranslatedFieldComponent } from '../translated-field/translated-field.component';

@Component({
  selector: 'app-translated-formfield',
  templateUrl: './translated-formfield.component.html',
  styleUrls: ['./translated-formfield.component.scss'],
  standalone: false,
})
export class TranslatedFormfieldComponent extends TranslatedFieldComponent {
  constructor() {
    super();
  }
}
