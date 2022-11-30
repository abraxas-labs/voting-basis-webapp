/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Selector } from 'testcafe';

export abstract class CountingCirclesDetailPage {
  public static readonly title: Selector = Selector('h1.page-title');

  public static readonly cancelButton: Selector = Selector('main button').withText('Abbrechen');

  public static readonly saveButton: Selector = Selector('main button.primary').withText('Speichern');

  public static readonly backButton: Selector = Selector('main a').withText('← zurück');

  public static readonly nameInput: Selector = Selector('[ng-reflect-label="Bezeichnung"] input');

  public static readonly bfsInput: Selector = Selector('[ng-reflect-label="BFS-Nummer"] input');

  public static readonly responsibleAuthorityInput: Selector = Selector(
    '[ng-reflect-label="zuständige Behörde"] input',
  );

  public static readonly responsibleAuthorityOptions: Selector = Selector(
    '[ng-reflect-label="zuständige Behörde"] .ng-option',
  );
}
