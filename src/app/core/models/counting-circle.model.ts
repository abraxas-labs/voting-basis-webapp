/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  Authority as AuthorityProto,
  CountingCircle as CountingCircleProto,
  CountingCirclesMerger as CountingCirclesMergerProto,
  DomainOfInfluenceCountingCircle as DomainOfInfluenceCountingCircleProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/counting_circle_pb';
import { newContactPerson } from './contact-person.model';

export { AuthorityProto, CountingCircleProto, DomainOfInfluenceCountingCircleProto, CountingCirclesMergerProto };

export type Authority = AuthorityProto.AsObject;
export type DomainOfInfluenceCountingCircle = DomainOfInfluenceCountingCircleProto.AsObject;

export interface CountingCircle extends Omit<CountingCircleProto.AsObject, 'info'> {
  createdOn?: Date;
  modifiedOn?: Date;
  deletedOn?: Date;
}

export interface CountingCirclesMerger {
  id: string;
  copyFromCountingCircleId: string;
  newCountingCircle: CountingCircle;
  mergedCountingCircles: CountingCircle[];
  activeFrom: Date;
  merged: boolean;
}

export function newCountingCircle(): CountingCircle {
  return {
    responsibleAuthority: {} as Authority,
    contactPersonSameDuringEventAsAfter: true,
    contactPersonDuringEvent: newContactPerson(),
    contactPersonAfterEvent: newContactPerson(),
    code: '',
    nameForProtocol: '',
  } as CountingCircle;
}

export function newCountingCirclesMerger(): CountingCirclesMerger {
  return {
    id: '',
    newCountingCircle: newCountingCircle(),
    copyFromCountingCircleId: '',
    mergedCountingCircles: [],
    activeFrom: new Date(),
    merged: true,
  };
}
