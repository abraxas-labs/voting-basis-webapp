/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { environment } from '../environment';
import { countingCirclesMock } from '../http-mocks/counting-circle.service.mock';
import { domainOfInfluencesMock } from '../http-mocks/domain-of-influence.service.mock';
import { AppPage } from '../page-models';
import { ConfirmDialog } from '../page-models/confirm-dialog';
import { CountingCirclesOverviewPage } from '../page-models/counting-circles-overview';
import { admin, electionAdmin } from '../roles/roles';

const countingCirclesUrl = environment.appUrl + 'e2e/counting-circles';
const countingCirclesNewUrl = countingCirclesUrl + '/new';
const countingCirclesDetailUrl = countingCirclesUrl + '/100';

fixture`counting circles overview`
  .requestHooks(
    countingCirclesMock.list,
    countingCirclesMock.get,
    countingCirclesMock.delete,
    domainOfInfluencesMock.list,
  )
  .page(environment.appUrl);

test('navigation', t =>
  t
    .useRole(admin)

    .click(AppPage.navCountingCircles)

    .expect(AppPage.getLocationHref())
    .eql(countingCirclesUrl)
    .expect(CountingCirclesOverviewPage.title.textContent)
    .eql('Auszählungskreise'));

test('no new for non admins', t =>
  t
    .useRole(electionAdmin)

    .navigateTo(countingCirclesUrl)
    .expect(CountingCirclesOverviewPage.newButton.exists)
    .notOk());

test('new', t =>
  t
    .useRole(admin)

    .navigateTo(countingCirclesUrl)
    .click(CountingCirclesOverviewPage.newButton)

    .expect(AppPage.getLocationHref())
    .eql(countingCirclesNewUrl));

test('open sidebar and detail via double select', t =>
  t
    .useRole(admin)

    .navigateTo(countingCirclesUrl)

    .expect(CountingCirclesOverviewPage.entries.count)
    .eql(1)
    .expect(CountingCirclesOverviewPage.sidebarDrawer.visible)
    .notOk()
    .click(CountingCirclesOverviewPage.entries.nth(0))
    .expect(CountingCirclesOverviewPage.sidebar.visible)
    .ok()
    .expect(CountingCirclesOverviewPage.domainOfInfluenceEntries.count)
    .eql(3)
    .expect(CountingCirclesOverviewPage.domainOfInfluenceEntries.nth(0).textContent)
    .eql('Bund')
    .expect(CountingCirclesOverviewPage.domainOfInfluenceEntries.nth(1).textContent)
    .eql('Kirchgemeinde St. Gallen')
    .expect(CountingCirclesOverviewPage.domainOfInfluenceEntries.nth(2).textContent)
    .eql('Kirchgemeinde Gossau')
    .click(CountingCirclesOverviewPage.sidebarCloser)
    .expect(CountingCirclesOverviewPage.sidebarCloser.visible)
    .notOk()
    .expect(CountingCirclesOverviewPage.sidebarDrawer.visible)
    .ok()
    .click(CountingCirclesOverviewPage.entries.nth(0))
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesDetailUrl));

test('open detail via double click', t =>
  t
    .useRole(admin)

    .navigateTo(countingCirclesUrl)

    .doubleClick(CountingCirclesOverviewPage.entries.nth(0))
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesDetailUrl));

test('open detail via details', t =>
  t
    .useRole(admin)

    .navigateTo(countingCirclesUrl)

    .hover(CountingCirclesOverviewPage.entries.nth(0))
    .click(CountingCirclesOverviewPage.actionMenu.nth(0))
    .click(CountingCirclesOverviewPage.actionMenuItem(0, 'Details'))
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesDetailUrl));

test('no delete as non-admin', t =>
  t
    .useRole(electionAdmin)

    .navigateTo(countingCirclesUrl)

    .hover(CountingCirclesOverviewPage.entries.nth(0))
    .click(CountingCirclesOverviewPage.actionMenu.nth(0))
    .expect(CountingCirclesOverviewPage.actionMenuItem(0, 'Löschen').exists)
    .notOk());

test('delete', t =>
  t
    .useRole(admin)

    .navigateTo(countingCirclesUrl)

    .hover(CountingCirclesOverviewPage.entries.nth(0))
    .click(CountingCirclesOverviewPage.actionMenu.nth(0))
    .click(CountingCirclesOverviewPage.actionMenuItem(0, 'Löschen'))
    .click(ConfirmDialog.cancelButton)
    .expect(AppPage.toast('success', 'Gelöscht').visible)
    .notOk()

    .hover(CountingCirclesOverviewPage.entries.nth(0))
    .click(CountingCirclesOverviewPage.actionMenu.nth(0))
    .click(CountingCirclesOverviewPage.actionMenuItem(0, 'Löschen'))
    .click(ConfirmDialog.confirmButton)
    .expect(AppPage.toast('success', 'Gelöscht').visible)
    .ok());
