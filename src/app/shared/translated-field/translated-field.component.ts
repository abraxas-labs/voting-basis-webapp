/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { allLanguages } from '../../core/models/language.model';
import { LanguageService } from '../../core/language.service';

@Directive()
export abstract class TranslatedFieldComponent {
  public readonly languages: string[] = allLanguages;
  public readonly currentLanguage: string = '';
  public translations: Map<string, string> = new Map<string, string>();
  public placeholder: string = '';
  public lastEmittedResult?: Map<string, string>;

  @Output()
  public valueChange: EventEmitter<Map<string, string>> = new EventEmitter<Map<string, string>>();

  @Input()
  public readonly: boolean = false;

  @Input()
  public optional: boolean = false;

  @Input()
  public maxlength?: number;

  @Input()
  public label: string = '';

  @Input()
  public singleLanguageInput: boolean = false;

  private placeholderLang?: string;
  private emptyLanguages: Set<string> = new Set<string>();

  protected constructor(languageService: LanguageService) {
    this.currentLanguage = languageService.currentLanguage;
  }

  @Input()
  public set value(val: Map<string, string>) {
    // Do not overwrite the current translations with the emitted results,
    // since that would remove the placeholders and display the actual values
    if (val === this.lastEmittedResult) {
      return;
    }

    this.translations = new Map(val);
    this.initialize();
  }

  public translationChanged(lang: string, value: string): void {
    this.translations.set(lang, value);

    if (!this.singleLanguageInput) {
      this.updateEmptyLanguages(lang, value);
      this.updatePlaceholder(lang, value);
    }

    this.lastEmittedResult = this.buildTranslationResult();
    this.valueChange.emit(this.lastEmittedResult);
  }

  private initialize(): void {
    this.unsetTranslationValuesThatMatchFirstFoundDuplicate();
    this.updatePlaceholderFromTranslations();

    this.emptyLanguages.clear();
    for (const lang of allLanguages) {
      const existing = this.translations.get(lang);
      if (!existing) {
        this.emptyLanguages.add(lang);
        this.translations.set(lang, '');
      }
    }
  }

  private updateEmptyLanguages(lang: string, value: string): void {
    if (value) {
      this.emptyLanguages.delete(lang);
    } else {
      this.emptyLanguages.add(lang);
    }
  }

  private updatePlaceholder(lang: string, value: string): void {
    if (!this.placeholderLang && value) {
      this.placeholderLang = lang;
      this.placeholder = value;
      return;
    }

    if (this.placeholderLang !== lang) {
      return;
    }

    if (value) {
      this.placeholder = value;
    } else {
      this.updatePlaceholderFromTranslations();
    }
  }

  private updatePlaceholderFromTranslations(): void {
    for (const lang of this.languages) {
      const value = this.translations.get(lang);
      if (value) {
        this.placeholderLang = lang;
        this.placeholder = value;
        return;
      }
    }

    delete this.placeholderLang;
    this.placeholder = '';
  }

  private buildTranslationResult(): Map<string, string> {
    const result = new Map<string, string>();

    if (this.singleLanguageInput) {
      const currentLangValue = this.translations.get(this.currentLanguage) ?? '';
      for (const lang of allLanguages) {
        result.set(lang, currentLangValue);
      }

      return result;
    }

    for (const lang of allLanguages) {
      const value = this.emptyLanguages.has(lang) ? this.placeholder : (this.translations.get(lang) ?? this.placeholder);
      result.set(lang, value);
    }

    return result;
  }

  private unsetTranslationValuesThatMatchFirstFoundDuplicate(): void {
    const existingLanguageValues = new Set<string>();
    let translationValueToUnset = '';

    for (const lang of this.languages) {
      const value = this.translations.get(lang);

      if (!value) {
        continue;
      }

      if (!translationValueToUnset && existingLanguageValues.has(value)) {
        translationValueToUnset = value;
      }

      if (translationValueToUnset === value) {
        this.translations.set(lang, '');
      }

      existingLanguageValues.add(value);
    }
  }
}
