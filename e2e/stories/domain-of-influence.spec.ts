/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { environment } from '../environment';
import { countingCirclesMock } from '../http-mocks/counting-circle.service.mock';
import { domainOfInfluencesMock } from '../http-mocks/domain-of-influence.service.mock';
import { AppPage } from '../page-models';
import { ConfirmDialog } from '../page-models/confirm-dialog';
import { DomainOfInfluencesPage } from '../page-models/domain-of-influences';
import { DomainOfInfluencesAssignDialog } from '../page-models/domain-of-influences-assign-dialog';
import { DomainOfInfluencesEditDialog } from '../page-models/domain-of-influences-edit-dialog';
import { admin, electionAdmin } from '../roles/roles';

const domainOfInflunecesUrl = environment.appUrl + 'e2e/domain-of-influences';

fixture`domain of influences`
  .requestHooks(
    domainOfInfluencesMock.listTree,
    domainOfInfluencesMock.get,
    domainOfInfluencesMock.update,
    domainOfInfluencesMock.updateCountingCircles,
    domainOfInfluencesMock.create,
    domainOfInfluencesMock.delete,
    countingCirclesMock.list,
    countingCirclesMock.listAssignable,
    countingCirclesMock.listAssigned,
  )
  .page(environment.appUrl);

test('navigation and detail as admin', t =>
  t
    .useRole(admin)

    .click(AppPage.navDomainOfInfluences)

    .expect(AppPage.getLocationHref())
    .eql(domainOfInflunecesUrl)
    .expect(DomainOfInfluencesPage.titleLeft.textContent)
    .eql('Wahlkreise')
    .expect(DomainOfInfluencesPage.titleRight.textContent)
    .eql('Zugeordnete Auszählungskreise')
    .expect(DomainOfInfluencesPage.createDomainOfInfluenceButton.hasAttribute('disabled'))
    .notOk());

test('search, select domain of influence, assign counting circles', t =>
  t
    .useRole(admin)
    .navigateTo(domainOfInflunecesUrl)

    .expect(DomainOfInfluencesPage.domainOfInfluenceEntries.count)
    .eql(3)
    .typeText(DomainOfInfluencesPage.searchInput, 'Neudorf')
    .click(DomainOfInfluencesPage.domainOfInfluenceEntry('St. Gallen Neudorf (SK)'))
    .expect(DomainOfInfluencesPage.domainOfInfluenceEntries.count)
    .eql(4)
    .expect(DomainOfInfluencesPage.assignCountingCirclesButton.hasAttribute('disabled'))
    .notOk()
    .expect(DomainOfInfluencesPage.countingCircleEntries.count)
    .eql(1)

    .click(DomainOfInfluencesPage.assignCountingCirclesButton)

    .expect(DomainOfInfluencesAssignDialog.allEntries.count)
    .eql(1)
    .expect(DomainOfInfluencesAssignDialog.selectedEntries.count)
    .eql(1)

    // deselect all
    .click(DomainOfInfluencesAssignDialog.selectAllInput)
    .expect(DomainOfInfluencesAssignDialog.selectedEntries.count)
    .eql(0)

    // select single via checkbox
    .click(DomainOfInfluencesAssignDialog.allEntries.nth(0))
    .expect(DomainOfInfluencesAssignDialog.selectedEntries.count)
    .eql(1)

    // deselect single via x on the right table
    .click(DomainOfInfluencesAssignDialog.deselectButton(0))
    .expect(DomainOfInfluencesAssignDialog.selectedEntries.count)
    .eql(0)

    // cancel, should still have one counting circle
    .click(DomainOfInfluencesAssignDialog.cancelButton)
    .expect(DomainOfInfluencesPage.countingCircleEntries.count)
    .eql(1)

    // deselect all
    .click(DomainOfInfluencesPage.assignCountingCirclesButton)
    .click(DomainOfInfluencesAssignDialog.selectAllInput)
    .click(DomainOfInfluencesAssignDialog.assignButton)
    .expect(AppPage.toast('success', 'Gespeichert').visible)
    .ok()
    .expect(DomainOfInfluencesPage.countingCircleEntries.count)
    .eql(0));

// https://github.com/protocolbuffers/protobuf/pull/7379
test.skip('edit', t =>
  t
    .useRole(admin)
    .navigateTo(domainOfInflunecesUrl)

    .typeText(DomainOfInfluencesPage.searchInput, 'Neudorf')
    .click(DomainOfInfluencesPage.domainOfInfluenceEntry('St. Gallen Neudorf (SK)'))
    .click(DomainOfInfluencesPage.editDomainOfInfluenceButton)

    .selectText(DomainOfInfluencesEditDialog.nameInput)
    .pressKey('delete')
    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .ok()
    .typeText(DomainOfInfluencesEditDialog.nameInput, 'St. Gallen St. Fiden')
    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .notOk()

    .selectText(DomainOfInfluencesEditDialog.shortNameInput)
    .pressKey('delete')
    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .ok()
    .typeText(DomainOfInfluencesEditDialog.shortNameInput, 'SG-SF')
    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .notOk()

    .typeText(DomainOfInfluencesEditDialog.authorityInput, 'e2e')
    .click(DomainOfInfluencesEditDialog.authorityOptions.nth(0))
    .expect(DomainOfInfluencesEditDialog.typeInput.hasAttribute('disabled'))
    .ok()

    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .notOk()

    .click(DomainOfInfluencesEditDialog.saveButton)
    .expect(AppPage.toast('success', 'Gespeichert').visible)
    .ok());

test('delete', t =>
  t
    .useRole(admin)
    .navigateTo(domainOfInflunecesUrl)

    .typeText(DomainOfInfluencesPage.searchInput, 'Neudorf')
    .click(DomainOfInfluencesPage.domainOfInfluenceEntry('St. Gallen Neudorf (SK)'))

    .click(DomainOfInfluencesPage.deleteDomainOfInfluenceButton)
    .click(ConfirmDialog.cancelButton)
    .expect(AppPage.toast('success', 'Gelöscht').visible)
    .notOk()
    .expect(DomainOfInfluencesPage.domainOfInfluenceEntry('St. Gallen Neudorf (SK)').exists)
    .ok()

    .click(DomainOfInfluencesPage.deleteDomainOfInfluenceButton)
    .click(ConfirmDialog.confirmButton)
    .expect(AppPage.toast('success', 'Gelöscht').visible)
    .ok()
    .expect(DomainOfInfluencesPage.domainOfInfluenceEntry('St. Gallen Neudorf (SK)').exists)
    .notOk());

// https://github.com/protocolbuffers/protobuf/pull/7379
test.skip('new', t =>
  t
    .useRole(admin)
    .navigateTo(domainOfInflunecesUrl)

    .click(DomainOfInfluencesPage.createDomainOfInfluenceButton)

    .typeText(DomainOfInfluencesEditDialog.nameInput, 'St. Gallen St. Fiden')
    .typeText(DomainOfInfluencesEditDialog.shortNameInput, 'SG-SF')
    .typeText(DomainOfInfluencesEditDialog.authorityInput, 'e2e')
    .click(DomainOfInfluencesEditDialog.authorityOptions.nth(0))

    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .ok()
    .typeText(DomainOfInfluencesEditDialog.typeInput, 'KI')
    .click(DomainOfInfluencesEditDialog.typeOptions.nth(0))
    .typeText(DomainOfInfluencesEditDialog.cantonInput, 'St.Gallen')
    .click(DomainOfInfluencesEditDialog.cantonOptions.nth(0))

    .expect(DomainOfInfluencesEditDialog.saveButton.hasAttribute('disabled'))
    .notOk()
    .click(DomainOfInfluencesEditDialog.saveButton)
    .expect(AppPage.toast('success', 'Gespeichert').visible)
    .ok());

test('no edit/delete/assign as electionAdmin', t =>
  t
    .useRole(electionAdmin)
    .navigateTo(domainOfInflunecesUrl)

    .typeText(DomainOfInfluencesPage.searchInput, 'Neudorf')
    .click(DomainOfInfluencesPage.domainOfInfluenceEntry('St. Gallen Neudorf (SK)'))
    .expect(DomainOfInfluencesPage.editDomainOfInfluenceButton.exists)
    .notOk()
    .expect(DomainOfInfluencesPage.deleteDomainOfInfluenceButton.exists)
    .notOk()
    .expect(DomainOfInfluencesPage.assignCountingCirclesButton.exists)
    .notOk());

test('no new as electionAdmin', t =>
  t
    .useRole(electionAdmin)
    .navigateTo(domainOfInflunecesUrl)

    .expect(DomainOfInfluencesPage.createDomainOfInfluenceButton.exists)
    .notOk());
