/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import { TranslatedFieldComponent } from '../translated-field/translated-field.component';

@Component({
  selector: 'app-translated-textarea',
  templateUrl: './translated-textarea.component.html',
  styleUrls: ['./translated-textarea.component.scss'],
})
export class TranslatedTextareaComponent extends TranslatedFieldComponent {
  constructor(languageService: LanguageService) {
    super(languageService);
  }
}
