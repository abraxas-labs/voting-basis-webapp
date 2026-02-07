/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: false,
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  public transform(value: string): SafeHtml {
    // Note that this could be a dangerous operation. It should only be used on trusted input.
    // We bypass the Angular security mechanism here, allowing us to display arbitrary HTML content.
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
