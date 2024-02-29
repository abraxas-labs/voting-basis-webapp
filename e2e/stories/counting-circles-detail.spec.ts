/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { environment } from '../environment';
import { countingCirclesMock } from '../http-mocks/counting-circle.service.mock';
import { AppPage } from '../page-models';
import { CountingCirclesDetailPage } from '../page-models/counting-circles-detail';
import { admin, electionAdmin } from '../roles/roles';

const countingCirclesUrl = environment.appUrl + 'e2e/counting-circles';
const countingCirclesNewUrl = countingCirclesUrl + '/new';
const countingCirclesDetailUrl = countingCirclesUrl + '/100';

fixture`counting circles detail`
  .requestHooks(countingCirclesMock.get, countingCirclesMock.update, countingCirclesMock.create)
  .page(environment.appUrl);

test('new', t =>
  t
    .useRole(admin)
    .navigateTo(countingCirclesNewUrl)
    .expect(CountingCirclesDetailPage.title.textContent)
    .eql('Auszählungskreis erstellen')
    .expect(CountingCirclesDetailPage.saveButton.hasAttribute('disabled'))
    .ok()
    .typeText(CountingCirclesDetailPage.nameInput, 'test-name')
    .typeText(CountingCirclesDetailPage.bfsInput, 'test-bfs')
    .typeText(CountingCirclesDetailPage.responsibleAuthorityInput, 'e2e')
    .click(CountingCirclesDetailPage.responsibleAuthorityOptions.withText('e2e'))
    .expect(CountingCirclesDetailPage.saveButton.hasAttribute('disabled'))
    .notOk()
    .click(CountingCirclesDetailPage.saveButton)
    .expect(AppPage.toast('success', 'Gespeichert').visible)
    .ok()
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesUrl));

test('edit', t =>
  t
    .useRole(admin)
    .navigateTo(countingCirclesDetailUrl)
    .expect(CountingCirclesDetailPage.title.textContent)
    .eql('St. Gallen')
    .selectText(CountingCirclesDetailPage.nameInput)
    .typeText(CountingCirclesDetailPage.nameInput, 'test-name')
    .selectText(CountingCirclesDetailPage.bfsInput)
    .typeText(CountingCirclesDetailPage.bfsInput, 'test-bfs')
    .typeText(CountingCirclesDetailPage.responsibleAuthorityInput, 'e2e')
    .click(CountingCirclesDetailPage.responsibleAuthorityOptions.withText('e2e'))
    .click(CountingCirclesDetailPage.saveButton)
    .expect(AppPage.toast('success', 'Gespeichert').visible)
    .ok()
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesUrl));

test('existing and back as electionAdmin', t =>
  t
    .useRole(electionAdmin)
    .navigateTo(countingCirclesDetailUrl)
    .expect(CountingCirclesDetailPage.title.textContent)
    .eql('St. Gallen')
    .expect(CountingCirclesDetailPage.nameInput.hasAttribute('disabled'))
    .ok()
    .expect(CountingCirclesDetailPage.bfsInput.hasAttribute('disabled'))
    .ok()
    .expect(CountingCirclesDetailPage.responsibleAuthorityInput.hasAttribute('disabled'))
    .ok()
    .click(CountingCirclesDetailPage.backButton)
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesUrl));

test('cancel', t =>
  t
    .useRole(admin)
    .navigateTo(countingCirclesDetailUrl)
    .click(CountingCirclesDetailPage.cancelButton)
    .expect(AppPage.getLocationHref())
    .eql(countingCirclesUrl));
