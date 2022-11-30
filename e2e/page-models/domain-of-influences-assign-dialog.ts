/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Selector } from 'testcafe';
import { AppPage } from './app';

export abstract class DomainOfInfluencesAssignDialog {
  public static cancelButton: Selector = AppPage.dialog.find('button').withText('Abbrechen');

  public static assignButton: Selector = AppPage.dialog.find('button').withText('Zuordnen');

  public static allEntriesSplitPane: Selector = AppPage.dialog.find('div[left]');

  public static selectedEntriesSplitPane: Selector = AppPage.dialog.find('div[right]');

  public static selectedEntries: Selector = DomainOfInfluencesAssignDialog.selectedEntriesSplitPane.find('tbody tr');

  public static selectAllInput: Selector = DomainOfInfluencesAssignDialog.allEntriesSplitPane.find(
    '.select-header input[type=checkbox]',
  );

  public static allEntries: Selector = DomainOfInfluencesAssignDialog.allEntriesSplitPane.find('tbody tr');

  public static deselectButton: (idx: number) => Selector = i =>
    DomainOfInfluencesAssignDialog.selectedEntries.nth(i).find('.inline-action');
}
