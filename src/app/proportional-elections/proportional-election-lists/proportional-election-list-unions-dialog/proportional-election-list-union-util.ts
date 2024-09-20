/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ProportionalElectionList, ProportionalElectionListUnion } from '../../../core/models/proportional-election.model';

export class ProportionalElectionListUnionUtil {
  private static readonly enumerationSeperator: string = ' / ';

  public static reorderAndRefreshListUnions(listUnions: ProportionalElectionListUnion[], lists: ProportionalElectionList[]): void {
    for (let i = 0; i < listUnions.length; i++) {
      // set position and number first, since this fields are used in refreshListUnion()
      const currentListUnion = listUnions[i];
      currentListUnion.position = i + 1;
      currentListUnion.number = currentListUnion.position.toString();

      for (let j = 0; j < currentListUnion.proportionalElectionSubListUnions.length; j++) {
        const currentSubListUnion = currentListUnion.proportionalElectionSubListUnions[j];
        currentSubListUnion.position = j + 1;
        currentSubListUnion.number = `${currentListUnion.position}.${currentSubListUnion.position}`;
      }

      this.refreshListUnion(currentListUnion, lists);

      for (const currentSubListUnion of currentListUnion.proportionalElectionSubListUnions) {
        this.refreshListUnion(currentSubListUnion, lists, currentListUnion);
      }
    }
  }

  private static refreshListUnion(
    listUnion: ProportionalElectionListUnion,
    lists: ProportionalElectionList[],
    rootListUnion?: ProportionalElectionListUnion,
  ): void {
    if (!!rootListUnion) {
      this.refreshSubListUnion(listUnion, rootListUnion);
    }

    listUnion.proportionalElectionSubListUnionEnumeration = this.getEnumerationString(
      listUnion.proportionalElectionSubListUnions.map(c => c.number!),
    );
    listUnion.proportionalElectionListEnumeration = this.getEnumerationString(
      lists.filter(l => listUnion.proportionalElectionListIds.includes(l.id)).map(l => l.orderNumber),
    );
    this.refreshMainList(listUnion, lists, rootListUnion);
  }

  private static refreshSubListUnion(listUnion: ProportionalElectionListUnion, rootListUnion: ProportionalElectionListUnion): void {
    listUnion.proportionalElectionListIds = listUnion.proportionalElectionListIds.filter(listId =>
      rootListUnion.proportionalElectionListIds.includes(listId),
    );
  }

  private static refreshMainList(
    listUnion: ProportionalElectionListUnion,
    lists: ProportionalElectionList[],
    rootListUnion?: ProportionalElectionListUnion,
  ): void {
    // if the mainListId got deleted in the root or the current listUnion, unset mainList
    if (
      !!listUnion.proportionalElectionMainListId &&
      ((!!rootListUnion && !rootListUnion.proportionalElectionListIds.includes(listUnion.proportionalElectionMainListId)) ||
        !listUnion.proportionalElectionListIds.includes(listUnion.proportionalElectionMainListId))
    ) {
      listUnion.proportionalElectionMainListId = '';
      listUnion.proportionalElectionMainListNumber = '';
      return;
    }

    listUnion.proportionalElectionMainListNumber = !!listUnion.proportionalElectionMainListId
      ? lists.find(l => l.id === listUnion.proportionalElectionMainListId)?.orderNumber
      : '';
  }

  private static getEnumerationString(items: string[]): string {
    return items.join(this.enumerationSeperator);
  }
}
