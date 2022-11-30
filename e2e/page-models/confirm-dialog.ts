/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Selector } from 'testcafe';

export abstract class ConfirmDialog {
  public static readonly cancelButton: Selector = Selector('.buttons button:not(.primary)');

  public static readonly confirmButton: Selector = Selector('.buttons button.primary');
}
