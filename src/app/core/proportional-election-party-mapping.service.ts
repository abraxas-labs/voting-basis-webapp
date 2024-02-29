/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DomainOfInfluenceParty as DomainOfInfluencePartyProto } from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_party_pb';
import { Injectable } from '@angular/core';
import { LanguageService } from './language.service';
import { DomainOfInfluenceParty, PartyMapping, PartyMappingContainer, PartyWithMappings } from './models/domain-of-influence-party.model';
import { ProportionalElectionListImport } from './models/import.model';
import { ProportionalElectionCandidateProto } from './models/proportional-election.model';

const unknownSourceParty = '<unknown>';

@Injectable({
  providedIn: 'root',
})
export class ProportionalElectionPartyMappingService {
  constructor(private readonly languageService: LanguageService) {}

  public applyMappings(partyMappings?: PartyMappingContainer): void {
    if (partyMappings === undefined) {
      return;
    }

    for (const party of partyMappings.parties) {
      const doiParty = new DomainOfInfluencePartyProto();
      doiParty.setId(party.id);
      for (const mapping of party.mappings) {
        for (const candidate of mapping.candidates) {
          candidate.setParty(doiParty);
        }
      }
    }

    for (const unmapped of partyMappings.unmapped) {
      for (const candidate of unmapped.candidates) {
        candidate.setParty(undefined);
      }
    }
  }

  public buildImportPartyMappingGroups(lists: ProportionalElectionListImport[], parties: DomainOfInfluenceParty[]): PartyMappingContainer {
    const candidatesBySourceParty = this.groupCandidatesBySourceParty(lists);
    const partiesWithMappings = this.mapCandidatesToParties(parties, candidatesBySourceParty);
    const unmapped = this.buildUnmapped(candidatesBySourceParty);
    return {
      parties: partiesWithMappings,
      unmapped,
    };
  }

  private buildUnmapped(candidatesBySourceParty: Map<string, ProportionalElectionCandidateProto[]>): PartyMapping[] {
    return [...candidatesBySourceParty.entries()]
      .filter(([sourceName, candidates]) => sourceName !== unknownSourceParty)
      .map(([sourceName, candidates]) => ({
        sourceName,
        candidates,
      }));
  }

  private mapCandidatesToParties(
    parties: DomainOfInfluenceParty[],
    candidatesBySourceParty: Map<string, ProportionalElectionCandidateProto[]>,
  ): PartyWithMappings[] {
    const partiesWithMappings: PartyWithMappings[] = [];
    for (const party of parties) {
      const foundMappings: PartyMapping[] = [];

      // by party short description
      const partyShortDescription = party.shortDescription.get(this.languageService.currentLanguage);
      if (partyShortDescription !== undefined && candidatesBySourceParty.has(partyShortDescription)) {
        foundMappings.push({
          sourceName: partyShortDescription,
          candidates: candidatesBySourceParty.get(partyShortDescription)!,
        });
        candidatesBySourceParty.delete(partyShortDescription);
      }

      // by party name
      const partyName = party.name.get(this.languageService.currentLanguage);
      if (partyName !== undefined && candidatesBySourceParty.has(partyName)) {
        foundMappings.push({
          sourceName: partyName,
          candidates: candidatesBySourceParty.get(partyName)!,
        });
        candidatesBySourceParty.delete(partyName);
      }

      partiesWithMappings.push({
        ...party,
        mappings: foundMappings,
      });
    }
    return partiesWithMappings;
  }

  private groupCandidatesBySourceParty(lists: ProportionalElectionListImport[]): Map<string, ProportionalElectionCandidateProto[]> {
    const mappings: Map<string, ProportionalElectionCandidateProto[]> = new Map<string, ProportionalElectionCandidateProto[]>();
    for (const list of lists) {
      for (const candidate of list.getCandidatesList()) {
        // prio 1: source party short
        // prio 2: source party
        // prio 3: list short description
        // prio 4: list description
        const sourceParty =
          candidate.getSourcePartyShortMap()?.get(this.languageService.currentLanguage) ??
          candidate.getSourcePartyMap()?.get(this.languageService.currentLanguage) ??
          list.getList()?.getShortDescriptionMap()?.get(this.languageService.currentLanguage) ??
          list.getList()?.getDescriptionMap()?.get(this.languageService.currentLanguage) ??
          unknownSourceParty;

        if (mappings.has(sourceParty)) {
          mappings.get(sourceParty)!.push(candidate.getCandidate()!);
        } else {
          mappings.set(sourceParty, [candidate.getCandidate()!]);
        }
      }
    }
    return mappings;
  }
}
