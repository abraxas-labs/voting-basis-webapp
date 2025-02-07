/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { LanguageService } from '../../core/language.service';
import { newSecondaryMajorityElection, SecondaryMajorityElection } from '../../core/models/secondary-majority-election.model';

@Component({
  selector: 'app-secondary-majority-election-general-informations',
  templateUrl: './secondary-majority-election-general-informations.component.html',
  styleUrls: ['./secondary-majority-election-general-informations.component.scss'],
})
export class SecondaryMajorityElectionGeneralInformationsComponent {
  public loading: boolean = true;

  @Input()
  public data: SecondaryMajorityElection = newSecondaryMajorityElection();

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  @Input()
  public eVoting: boolean = false;

  public get canSave(): boolean {
    return (
      !!this.data &&
      !!this.data.politicalBusinessNumber &&
      LanguageService.allLanguagesPresent(this.data.officialDescription) &&
      this.data.numberOfMandates > 0 &&
      LanguageService.allLanguagesPresent(this.data.shortDescription)
    );
  }
}
