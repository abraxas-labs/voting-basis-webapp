/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component } from '@angular/core';
import { TranslatedFieldComponent } from '../translated-field/translated-field.component';
import { LanguageService } from '@abraxas/voting-lib';

@Component({
  selector: 'app-translated-textarea',
  templateUrl: './translated-textarea.component.html',
  styleUrls: ['./translated-textarea.component.scss'],
  standalone: false,
})
export class TranslatedTextareaComponent extends TranslatedFieldComponent {
  constructor(languageService: LanguageService) {
    super(languageService);
  }
}
