/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ContestSummary } from '../../core/models/contest.model';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';

@Pipe({
  name: 'ownsContest',
})
export class OwnsContestPipe implements PipeTransform {
  public transform(contest: ContestSummary, domainOfInfluences: DomainOfInfluence[]): boolean {
    return !!domainOfInfluences.find(doi => doi.id === contest.domainOfInfluenceId);
  }
}
