/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { newSecondaryMajorityElection, SecondaryMajorityElection } from '../../core/models/secondary-majority-election.model';
import { LanguageService } from '@abraxas/voting-lib';

@Component({
  selector: 'app-secondary-majority-election-general-informations',
  templateUrl: './secondary-majority-election-general-informations.component.html',
  styleUrls: ['./secondary-majority-election-general-informations.component.scss'],
  standalone: false,
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

  @Input()
  public readonly: boolean = false;

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
