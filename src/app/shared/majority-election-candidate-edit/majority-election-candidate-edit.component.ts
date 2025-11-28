/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { EnumItemDescription, EnumUtil, LanguageService, allLanguages } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MajorityElectionCandidate, MajorityElectionCandidateReportingType } from '../../core/models/majority-election.model';
import { SexType } from '../../core/models/sex-type.model';
import { isValidDateOfBirth } from '../../core/utils/date-of-birth.utils';
import { CountryService } from '../../core/country.service';
import { Country } from '../../core/models/country.model';
import { isValidZipCode } from '../../core/utils/zip-code.utils';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';
import { TranslateService } from '@ngx-translate/core';

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
  public parties: DomainOfInfluenceParty[] = [];

  @Input()
  public individualCandidatesDisabled: boolean = false;

  public sexTypes: EnumItemDescription<SexType>[] = [];
  public reportingTypes: EnumItemDescription<MajorityElectionCandidateReportingType>[] = [];
  public currentLanguage: string;
  public countries: Country[] = [];
  public selectableParties: SelectableParty[] = [];
  public selectedParty?: SelectableParty;

  private readonly customPartySelector: SelectableParty;

  constructor(
    private readonly enumUtil: EnumUtil,
    private readonly countryService: CountryService,
    languageService: LanguageService,
    i18n: TranslateService,
  ) {
    this.sexTypes = this.enumUtil.getArrayWithDescriptions<SexType>(SexType, 'SEX_TYPE.').filter(
      // deprecated values
      p => p.value !== SexType.SEX_TYPE_UNDEFINED,
    );

    this.reportingTypes = this.enumUtil.getArrayWithDescriptions<MajorityElectionCandidateReportingType>(
      MajorityElectionCandidateReportingType,
      'MAJORITY_ELECTION.CANDIDATE.REPORTING_TYPES.',
    );

    this.currentLanguage = languageService.currentLanguage;
    this.customPartySelector = {
      description: i18n.instant('MAJORITY_ELECTION.CANDIDATE.CUSTOM_PARTY'),
      isCustomPartySelector: true,
    };
  }

  public async ngOnInit(): Promise<void> {
    this.countries = await this.countryService.list();

    this.selectableParties = this.parties.map(p => ({
      party: p,
      description: p.name.get(this.currentLanguage) ?? p.shortDescription.get(this.currentLanguage) ?? '',
      isCustomPartySelector: false,
    }));
    this.selectableParties.push(this.customPartySelector);

    if (this.candidate && this.candidate.partyShortDescription.size > 0) {
      const matchingParty = this.parties.find(
        p =>
          this.areMapsEqual(p.name, this.candidate!.partyLongDescription) &&
          this.areMapsEqual(p.shortDescription, this.candidate!.partyShortDescription),
      );
      this.selectedParty = matchingParty ? this.selectableParties.find(p => p.party === matchingParty) : this.customPartySelector;
    }
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

  public isZipCodeValid(): boolean {
    return !!this.candidate && isValidZipCode(this.candidate.zipCode, this.candidate.country);
  }

  public setParty(value: SelectableParty | undefined): void {
    if (this.selectedParty === value) {
      return;
    }

    this.selectedParty = value;

    if (!value) {
      this.candidate!.partyShortDescription = new Map<string, string>();
      this.candidate!.partyLongDescription = new Map<string, string>();
      this.contentChanged.emit();
      return;
    }

    if (value.isCustomPartySelector) {
      this.setPartyShort('');
      this.setPartyLong('');
      return;
    }

    this.setPartyShort(value.party?.shortDescription.get(this.currentLanguage)!);
    this.setPartyLong(value.party?.name.get(this.currentLanguage)!);
  }

  public setPartyShort(value: string) {
    for (const lang of allLanguages) {
      this.candidate?.partyShortDescription.set(lang, value);
    }

    this.contentChanged.emit();
  }

  public setPartyLong(value: string) {
    for (const lang of allLanguages) {
      this.candidate?.partyLongDescription.set(lang, value);
    }

    this.contentChanged.emit();
  }

  private areMapsEqual(map1: Map<string, string>, map2: Map<string, string>): boolean {
    if (map1.size !== map2.size) {
      return false;
    }

    for (const [key, val] of map1) {
      const val2 = map2.get(key);
      if (val2 !== val || (val2 === undefined && !map2.has(key))) {
        return false;
      }
    }

    return true;
  }
}

interface SelectableParty {
  party?: DomainOfInfluenceParty;
  description: string;
  isCustomPartySelector: boolean;
}
