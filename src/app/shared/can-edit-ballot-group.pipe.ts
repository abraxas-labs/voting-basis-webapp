/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { MajorityElectionBallotGroup } from '../core/models/majority-election-ballot-group.model';

@Pipe({
  name: 'canEditBallotGroup',
})
export class CanEditBallotGroupPipe implements PipeTransform {
  public transform(ballotGroup: MajorityElectionBallotGroup | undefined, testingPhaseEnded: boolean): boolean {
    if (!ballotGroup) {
      return false;
    }

    if (!testingPhaseEnded) {
      return true;
    }

    const allCandidateCountsOk = ballotGroup.entries.every(e => e.candidateCountOk);
    // After the testing phase, ballot groups are only editable if the candidate counts aren't ok
    return !allCandidateCountsOk;
  }
}
