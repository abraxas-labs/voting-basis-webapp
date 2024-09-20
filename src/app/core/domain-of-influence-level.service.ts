/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { TreeNode } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluence, DomainOfInfluenceLevel } from './models/domain-of-influence.model';
import { flatMap } from './utils/array.utils';

@Injectable({
  providedIn: 'root',
})
export class DomainOfInfluenceLevelService {
  constructor(private readonly i18n: TranslateService) {}

  public buildDomainOfInfluenceLevels(politicalDomainOfInfluenceNode?: TreeNode<DomainOfInfluence>): DomainOfInfluenceLevel[] {
    if (!politicalDomainOfInfluenceNode) {
      return [];
    }

    let level = 0;
    let currentNodes = [politicalDomainOfInfluenceNode];
    const domainOfInfluenceLevels: DomainOfInfluenceLevel[] = [];

    while (currentNodes.length > 0) {
      domainOfInfluenceLevels.push({
        level: level++,
        desc: this.buildDomainOfInfluenceLevelDescription(level, currentNodes),
      });
      currentNodes = flatMap(currentNodes.map(n => n.filteredChildNodes));
    }

    return domainOfInfluenceLevels;
  }

  private buildDomainOfInfluenceLevelDescription(level: number, nodes: TreeNode<DomainOfInfluence>[]): string {
    const maxElements = 3;
    const nodeNames = nodes.slice(0, maxElements).map(n => n.data.name);

    if (nodes.length > maxElements) {
      nodeNames.push('...');
    }

    const domainOfInfluenceType = nodes[0].data.type;
    const typeTranslated = this.i18n.instant(`DOMAIN_OF_INFLUENCE.TYPES.${domainOfInfluenceType}`);
    return `${level}: ${typeTranslated} (${nodeNames.join(', ')})`;
  }
}
