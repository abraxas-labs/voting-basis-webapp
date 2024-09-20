/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  Authority as AuthorityProto,
  CountingCircle as CountingCircleProto,
  CountingCircleChangeMessage as CountingCircleChangeMessageProto,
  CountingCircleElectorate as CountingCircleElectorateProto,
  CountingCirclesMerger as CountingCirclesMergerProto,
  DomainOfInfluenceCountingCircle as DomainOfInfluenceCountingCircleProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/counting_circle_pb';
import { newContactPerson } from './contact-person.model';
import { DomainOfInfluenceCanton } from '@abraxas/voting-basis-service-proto/grpc/shared/domain_of_influence_pb';
import { BaseEntityMessage } from './message.model';

export {
  AuthorityProto,
  CountingCircleProto,
  DomainOfInfluenceCountingCircleProto,
  CountingCirclesMergerProto,
  CountingCircleElectorateProto,
};

export type Authority = AuthorityProto.AsObject;
export type DomainOfInfluenceCountingCircle = DomainOfInfluenceCountingCircleProto.AsObject;
export type CountingCircleElectorate = CountingCircleElectorateProto.AsObject;

export { CountingCircleChangeMessageProto };

export type CountingCircleMessage = BaseEntityMessage<CountingCircle>;
export interface CountingCircleChangeMessage {
  countingCircle: CountingCircleMessage;
}

export interface CountingCircle extends Omit<CountingCircleProto.AsObject, 'info' | 'eVotingActiveFrom'> {
  createdOn?: Date;
  modifiedOn?: Date;
  deletedOn?: Date;
  eVotingActiveFrom?: Date;
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
    electoratesList: [] as CountingCircleElectorate[],
    canton: DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED,
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
