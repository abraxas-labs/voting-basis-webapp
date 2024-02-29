/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { TranslateLoader } from '@ngx-translate/core';
import { all as merge } from 'deepmerge';
import { from, Observable } from 'rxjs';

export class WebpackTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    return from(this.loadTranslations(lang));
  }

  private async loadTranslations(lang: string): Promise<any> {
    const app = await import(`../../assets/i18n/${lang}.json`);
    const lib = await import(`@abraxas/voting-lib/assets/voting-lib/i18n/${lang}.json`);
    // deep merge translation properties
    return merge([{ ...lib }, { ...app }]);
  }
}
