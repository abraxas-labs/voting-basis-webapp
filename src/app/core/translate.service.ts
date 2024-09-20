/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Injectable } from '@angular/core';
import { TranslateService as CoreTranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslateService extends CoreTranslateService {
  public instantOrFallback(key: string, fallbackKey: string): string {
    const translated = this.instant(key);
    return translated === key ? this.instant(fallbackKey) : translated;
  }
}
