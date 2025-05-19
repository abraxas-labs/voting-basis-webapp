/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil, LanguageService, allLanguages } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MajorityElectionCandidate } from '../../core/models/majority-election.model';
import { SexType } from '../../core/models/sex-type.model';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';
import { CountryService } from '../../core/country.service';
import { Country } from '../../core/models/country.model';

@Component({
  selector: 'app-majority-election-candidate-edit',
  templateUrl: './majority-election-candidate-edit.component.html',
  styleUrls: ['./majority-election-candidate-edit.component.scss'],
  standalone: false,
})
export class MajorityElectionCandidateEditComponent implements OnInit {
  @Input()
  public candidate?: MajorityElectionCandidate;

  @Input()
  public testingPhaseEnded: boolean = false;

  // allows editing of a candidate reference. only specific fields are enabled
  @Input()
  public isCandidateReference: boolean = false;

  @Output()
  public contentChanged: EventEmitter<void> = new EventEmitter<void>();

  @Input()
  public isCandidateLocalityRequired: boolean = false;

  @Input()
  public isCandidateOriginRequired: boolean = false;

  @Input()
  public hideOccupationTitle: boolean = false;

  @Input()
  public partyShortDescriptions: string[] = [];

  public sexTypes: EnumItemDescription<SexType>[] = [];
  public currentLanguage: string;
  public countries: Country[] = [];

  constructor(
    private readonly enumUtil: EnumUtil,
    private readonly countryService: CountryService,
    languageService: LanguageService,
  ) {
    this.sexTypes = this.enumUtil.getArrayWithDescriptions<SexType>(SexType, 'SEX_TYPE.').filter(
      // deprecated values
      p => p.value !== SexType.SEX_TYPE_UNDEFINED,
    );
    this.currentLanguage = languageService.currentLanguage;
  }

  public async ngOnInit(): Promise<void> {
    this.countries = await this.countryService.list();
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

  public setParty(value: string) {
    for (const lang of allLanguages) {
      this.candidate?.party.set(lang, value);
    }

    this.contentChanged.emit();
  }
}
