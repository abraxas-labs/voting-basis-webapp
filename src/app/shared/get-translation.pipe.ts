/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '@abraxas/voting-lib';

@Pipe({
  name: 'getTranslation',
  standalone: false,
})
export class GetTranslationPipe implements PipeTransform {
  constructor(private readonly languageService: LanguageService) {}

  public transform(translations?: Map<string, string>): string {
    return this.languageService.getTranslationForCurrentLang(translations);
  }
}
