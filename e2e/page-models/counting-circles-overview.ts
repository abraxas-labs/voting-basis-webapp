/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Selector } from 'testcafe';

export abstract class CountingCirclesOverviewPage {
  public static readonly title: Selector = Selector('h1');

  public static readonly newButton: Selector = Selector('button').withText('Auszählungskreis erstellen');

  public static readonly entries: Selector = Selector('main tbody tr');

  public static readonly sidebarDrawer: Selector = Selector('.sidebar-drawer');

  public static readonly sidebarCloser: Selector = Selector('.sidebar-closer');

  public static readonly sidebar: Selector = Selector('.sidebar-open');

  public static readonly domainOfInfluenceEntries: Selector = Selector('.sidebar-open p');

  public static readonly actionMenu: Selector = Selector('main tbody tr .action-button');

  public static readonly actionMenuItem: (index: number, text: string) => Selector = (i, t) =>
    CountingCirclesOverviewPage.entries.nth(i).find('.action-items button').withText(t);
}
