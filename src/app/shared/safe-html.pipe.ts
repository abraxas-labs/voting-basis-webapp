/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  public transform(value: string): SafeHtml {
    // Note that this could be a dangerous operation. It should only be used on trusted input.
    // We bypass the Angular security mechanism here, allowing us to display arbitrary HTML content.
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
