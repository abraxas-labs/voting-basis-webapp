/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { allLanguages, Language } from './models/language.model';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  // This is currently hard coded, since no requirement to switch languages exist. Also, translations for other languages are missing.
  public readonly currentLanguage: string = Language.German;

  public static fillAllLanguages(value: string): Map<string, string> {
    const map = new Map<string, string>();

    for (const lang of allLanguages) {
      map.set(lang, value);
    }

    return map;
  }

  public static allLanguagesPresent(translations: Map<string, string>): boolean {
    for (const lang of allLanguages) {
      if (!translations.get(lang)) {
        return false;
      }
    }

    return true;
  }

  public getTranslationForCurrentLang(translations?: Map<string, string>): string {
    if (!translations) {
      return '';
    }

    const translationForCurrentLang = translations.get(this.currentLanguage);
    if (translationForCurrentLang) {
      return translationForCurrentLang;
    }

    for (const lang of allLanguages) {
      const translation = translations.get(lang);
      if (translation) {
        return translation;
      }
    }

    return '';
  }
}
