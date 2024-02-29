/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Selector } from 'testcafe';

export abstract class DomainOfInfluencesPage {
  public static readonly titleLeft: Selector = Selector('.content h1');
  public static readonly titleRight: Selector = Selector('div[right] h2');

  public static readonly searchInput: Selector = Selector('input[placeholder=Suchen]');

  public static readonly domainOfInfluenceEntries: Selector = Selector('div[left] .node-row');

  public static readonly createDomainOfInfluenceButton: Selector = Selector('button').withText('Wahlkreis erstellen');

  public static readonly editDomainOfInfluenceButton: Selector = Selector('.node-row .icon-pencil');

  public static readonly deleteDomainOfInfluenceButton: Selector = Selector('.node-row .icon-trash');

  public static readonly assignCountingCirclesButton: Selector = Selector('button').withText(
    'Auszählungskreise zuordnen',
  );

  public static readonly countingCircleEntries: Selector = Selector('div[right] table tbody tr');

  public static readonly domainOfInfluenceEntry: (name: string) => Selector = name =>
    Selector('div[left] .node-row label').withText(name);
}
