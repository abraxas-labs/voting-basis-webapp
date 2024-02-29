/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ContactPerson } from '@abraxas/voting-basis-service-proto/grpc/models/contact_person_pb';
import {
  Authority,
  CountingCircle,
  CountingCircles,
  DomainOfInfluenceCountingCircle,
  DomainOfInfluenceCountingCircles,
} from '@abraxas/voting-basis-service-proto/grpc/models/counting_circle_pb';
import { mock } from './defaults';

const defaultAuthority = new Authority();
defaultAuthority.setName('Staatskanzlei St. Gallen');
defaultAuthority.setSecureConnectId('123123123');

const contactPersonDuringEvent = new ContactPerson();
contactPersonDuringEvent.setFirstName('Hans');
contactPersonDuringEvent.setFamilyName('Muster');

const contactPersonAfterEvent = new ContactPerson();
contactPersonAfterEvent.setFirstName('Rudolph');
contactPersonAfterEvent.setFamilyName('Meier');

const countingCircleDefault = new CountingCircle();
countingCircleDefault.setId('100');
countingCircleDefault.setBfs('3200');
countingCircleDefault.setName('St. Gallen');
countingCircleDefault.setResponsibleAuthority(defaultAuthority);
countingCircleDefault.setContactPersonDuringEvent(contactPersonDuringEvent);
countingCircleDefault.setContactPersonAfterEvent(contactPersonAfterEvent);

export const domainOfInfluenceCountingCircleDefault = new DomainOfInfluenceCountingCircle();
domainOfInfluenceCountingCircleDefault.setId('100');
domainOfInfluenceCountingCircleDefault.setBfs('3200');
domainOfInfluenceCountingCircleDefault.setName('St. Gallen');
domainOfInfluenceCountingCircleDefault.setResponsibleAuthority(defaultAuthority);
domainOfInfluenceCountingCircleDefault.setContactPersonDuringEvent(contactPersonDuringEvent);
domainOfInfluenceCountingCircleDefault.setContactPersonAfterEvent(contactPersonAfterEvent);

const getCountingCirclesResp = new CountingCircles();
getCountingCirclesResp.setCountingCirclesList([countingCircleDefault]);

const getDomainOfInfluenceCountingCircleListResp = new DomainOfInfluenceCountingCircles();
getDomainOfInfluenceCountingCircleListResp.setCountingCirclesList([domainOfInfluenceCountingCircleDefault]);

export const countingCirclesMock = {
  list: mock(/\/abraxas\.voting\.basis\.v1\.CountingCircleService\/List$/, getCountingCirclesResp),
  listAssignable: mock(/\/abraxas\.voting\.basis\.v1\.CountingCircleService\/ListAssignable$/, getCountingCirclesResp),
  listAssigned: mock(
    /\/abraxas\.voting\.basis\.v1\.CountingCircleService\/ListAssigned$/,
    getDomainOfInfluenceCountingCircleListResp,
  ),
  get: mock(/\/abraxas\.voting\.basis\.v1\.CountingCircleService\/Get$/, countingCircleDefault),
  create: mock(/\/abraxas\.voting\.basis\.v1\.CountingCircleService\/Create$/, countingCircleDefault),
  update: mock(/\/abraxas\.voting\.basis\.v1\.CountingCircleService\/Update$/),
  delete: mock(/\/abraxas\.voting\.basis\.v1\.CountingCircleService\/Delete$/),
};
