/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Selector } from 'testcafe';
import { AppPage } from './app';

export abstract class DomainOfInfluencesEditDialog {
  public static cancelButton: Selector = AppPage.dialog.find('button').withText('Abbrechen');

  public static saveButton: Selector = AppPage.dialog.find('button').withText('Speichern');

  public static nameInput: Selector = AppPage.dialog.find('[ng-reflect-label="Bezeichnung"] input');

  public static shortNameInput: Selector = AppPage.dialog.find('[ng-reflect-label="Kurzbezeichnung"] input');

  public static readonly authorityInput: Selector = Selector('[ng-reflect-label="Behörde"] input');

  public static readonly authorityOptions: Selector = Selector('[ng-reflect-label="Behörde"] .ng-option');

  public static readonly typeInput: Selector = Selector('[ng-reflect-label="Geschäftsebene"] input');

  public static readonly typeOptions: Selector = Selector('[ng-reflect-label="Geschäftsebene"] .ng-option');

  public static readonly cantonInput: Selector = Selector('[ng-reflect-label="Kanton"] input');

  public static readonly cantonOptions: Selector = Selector('[ng-reflect-label="Kanton"] .ng-option');
}
