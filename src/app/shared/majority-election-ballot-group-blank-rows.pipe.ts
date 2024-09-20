/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { MajorityElectionBallotGroup } from '../core/models/majority-election-ballot-group.model';

@Pipe({
  name: 'majorityElectionBallotGroupBlankRows',
})
export class MajorityElectionBallotGroupBlankRowsPipe implements PipeTransform {
  public transform(value: MajorityElectionBallotGroup, electionId: string): number | undefined {
    const entry = value.entries.find(e => e.electionId === electionId);
    return entry?.blankRowCount;
  }
}
