/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';

@Pipe({
  name: 'domainOfInfluenceLogoUrl',
})
export class DomainOfInfluenceLogoUrlPipe implements PipeTransform {
  constructor(private readonly doiService: DomainOfInfluenceService) {}

  public transform(doiId: string): Promise<string> {
    return this.doiService.getLogoUrl(doiId);
  }
}
