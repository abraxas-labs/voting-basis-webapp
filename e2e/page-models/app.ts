/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { ClientFunction, Selector } from 'testcafe';

export abstract class AppPage {
  public static readonly getLocationHref: ClientFunction<string, []> = ClientFunction(() => document.location.href);

  public static readonly title: Selector = Selector('.application-title');

  public static readonly tenant: Selector = Selector('.tenant');

  public static readonly navCountingCircles: Selector = Selector('[aside] a').withText('Auszählungskreise');

  public static readonly navDomainOfInfluences: Selector = Selector('[aside] a').withText('Wahlkreise');

  public static readonly dialog: Selector = Selector('div.cdk-overlay-pane');

  public static toast: (type: string, content: string) => Selector = (type: string, content: string) =>
    Selector('div.toast.' + type)
      .withText(content)
      .with({
        visibilityCheck: true,
        timeout: 1000,
      });
}
