/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';

@Pipe({
  name: 'domainOfInfluenceLogoUrl',
  standalone: false,
})
export class DomainOfInfluenceLogoUrlPipe implements PipeTransform {
  private readonly doiService = inject(DomainOfInfluenceService);

  public transform(doiId: string): Promise<string> {
    return this.doiService.getLogoUrl(doiId);
  }
}
