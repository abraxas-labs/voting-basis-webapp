/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import { TranslatedFieldComponent } from '../translated-field/translated-field.component';

@Component({
  selector: 'app-translated-formfield',
  templateUrl: './translated-formfield.component.html',
  styleUrls: ['./translated-formfield.component.scss'],
})
export class TranslatedFormfieldComponent extends TranslatedFieldComponent {
  constructor(languageService: LanguageService) {
    super(languageService);
  }
}
