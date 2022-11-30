/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, Input } from '@angular/core';
import { MajorityElectionCandidate } from '../../core/models/majority-election.model';
import { SexType } from '../../core/models/sex-type.model';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';

@Component({
  selector: 'app-majority-election-candidate-edit',
  templateUrl: './majority-election-candidate-edit.component.html',
  styleUrls: ['./majority-election-candidate-edit.component.scss'],
})
export class MajorityElectionCandidateEditComponent {
  @Input()
  public candidate?: MajorityElectionCandidate;

  @Input()
  public testingPhaseEnded: boolean = false;

  // allows editing of a candidate reference. only specific fields are enabled
  @Input()
  public isCandidateReference: boolean = false;

  public sexTypes: EnumItemDescription<SexType>[] = [];

  constructor(private readonly enumUtil: EnumUtil) {
    this.sexTypes = this.enumUtil.getArrayWithDescriptions<SexType>(SexType, 'SEX_TYPE.');
  }

  public set dateOfBirth(value: string) {
    if (!this.candidate || !value) {
      return;
    }

    this.candidate.dateOfBirth = new Date(value);
  }

  public isDateOfBirthValid(): boolean {
    return !!this.candidate && isValidDateOfBirth(this.candidate.dateOfBirth);
  }
}
