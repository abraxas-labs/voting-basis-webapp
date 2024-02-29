/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageService } from '../../core/language.service';
import { DomainOfInfluenceParty, newDomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';

@Component({
  selector: 'app-domain-of-influence-party-edit-dialog',
  templateUrl: './domain-of-influence-party-edit-dialog.component.html',
})
export class DomainOfInfluencePartyEditDialogComponent {
  public readonly isNew: boolean = false;
  public readonly party: DomainOfInfluenceParty = newDomainOfInfluenceParty();

  constructor(
    public readonly dialogRef: MatDialogRef<DomainOfInfluencePartyEditDialogData>,
    @Inject(MAT_DIALOG_DATA) dialogData: DomainOfInfluencePartyEditDialogData,
  ) {
    this.party = dialogData.party;
    this.isNew = !this.party.id;
  }

  public get canSave(): boolean {
    return (
      !!this.party &&
      LanguageService.allLanguagesPresent(this.party.name) &&
      LanguageService.allLanguagesPresent(this.party.shortDescription)
    );
  }

  public save(): void {
    const result: DomainOfInfluencePartyEditDialogResult = {
      party: this.party,
    };

    this.dialogRef.close(result);
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface DomainOfInfluencePartyEditDialogData {
  party: DomainOfInfluenceParty;
}

export interface DomainOfInfluencePartyEditDialogResult {
  party: DomainOfInfluenceParty;
}
