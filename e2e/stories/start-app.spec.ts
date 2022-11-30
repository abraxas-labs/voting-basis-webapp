/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { environment } from '../environment';
import { AppPage } from '../page-models';
import { electionAdmin } from '../roles/roles';

fixture`login`.page(environment.appUrl);

test('open page', t =>
  t
    .useRole(electionAdmin)

    .expect(AppPage.title.textContent)
    .eql('VOTING Basis-Services')

    .expect(AppPage.tenant.textContent)
    .eql('e2e'));
