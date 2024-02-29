/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomainOfInfluenceParty, newDomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';
import {
  DomainOfInfluencePartyEditDialogComponent,
  DomainOfInfluencePartyEditDialogData,
  DomainOfInfluencePartyEditDialogResult,
} from '../domain-of-influence-party-edit-dialog/domain-of-influence-party-edit-dialog.component';

@Component({
  selector: 'app-domain-of-influence-parties',
  templateUrl: './domain-of-influence-parties.component.html',
})
export class DomainOfInfluencePartiesComponent {
  @Input()
  public disabled: boolean = false;

  @Input()
  public parties: DomainOfInfluenceParty[] = [];

  @Output()
  public partiesChange: EventEmitter<DomainOfInfluenceParty[]> = new EventEmitter<DomainOfInfluenceParty[]>();

  constructor(private readonly dialogService: DialogService) {}

  public async addParty(): Promise<void> {
    const party = newDomainOfInfluenceParty();
    return this.editParty(party);
  }

  public async editParty(party: DomainOfInfluenceParty): Promise<void> {
    const existingPartyIndex = this.parties.findIndex(p => p === party);
    const dialogData: DomainOfInfluencePartyEditDialogData = {
      party: { ...party },
    };

    const result = await this.dialogService.openForResult(DomainOfInfluencePartyEditDialogComponent, dialogData);
    this.handleEditParty(existingPartyIndex, result);
  }

  public deleteParty(party: DomainOfInfluenceParty): void {
    const existingPartyIndex = this.parties.findIndex(p => p === party);
    this.parties.splice(existingPartyIndex, 1);
    this.parties = [...this.parties];
    this.partiesChange.emit(this.parties);
  }

  private handleEditParty(existingPartyIndex: number, result?: DomainOfInfluencePartyEditDialogResult): void {
    if (!result) {
      return;
    }

    const party = result.party;

    if (existingPartyIndex < 0) {
      this.parties = [...this.parties, party];
    } else {
      this.parties[existingPartyIndex] = party;
      this.parties = [...this.parties];
    }

    this.partiesChange.emit(this.parties);
  }
}
