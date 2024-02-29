/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';
import { PartyMapping, PartyMappingContainer, PartyWithMappings } from '../../../core/models/domain-of-influence-party.model';

@Component({
  selector: 'app-import-proportional-election-party-mapping',
  templateUrl: './import-proportional-election-party-mapping.component.html',
  styleUrls: ['./import-proportional-election-party-mapping.component.scss'],
})
export class ImportProportionalElectionPartyMappingComponent {
  @Input()
  public data!: PartyMappingContainer;

  public addMapping({ sourceName }: PartyMapping, { id: partyId }: PartyWithMappings): void {
    // cant use dragged data directly as it is another instance created by the drag & drop library
    const party = this.findParty(partyId);
    const mappingIndex = this.data.unmapped.findIndex(x => x.sourceName === sourceName);
    party.mappings = [...party.mappings, this.data.unmapped[mappingIndex]];
    this.data.unmapped.splice(mappingIndex, 1);
    this.data.unmapped = [...this.data.unmapped];
  }

  public removeMapping({ sourceName }: PartyMapping, party?: PartyWithMappings): void {
    if (party === undefined) {
      return;
    }

    // cant use dragged data directly as it is another instance created by the drag & drop library
    party = this.findParty(party.id);
    const mappingIndex = party.mappings.findIndex(x => x.sourceName === sourceName);
    this.data.unmapped = [party.mappings[mappingIndex], ...this.data.unmapped];
    party.mappings.splice(mappingIndex, 1);
    party.mappings = [...party.mappings];
  }

  private findParty(id: string): PartyWithMappings {
    return this.data.parties.find(x => x.id === id)!;
  }
}
