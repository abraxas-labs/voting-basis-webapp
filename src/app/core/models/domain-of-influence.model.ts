/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DomainOfInfluence as DomainOfInfluenceProto } from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_pb';
import {
  DomainOfInfluenceCanton as DomainOfInfluenceCantonProto,
  DomainOfInfluenceType as DomainOfInfluenceTypeProto,
} from '@abraxas/voting-basis-service-proto/grpc/shared/domain_of_influence_pb';
import { newContactPerson } from './contact-person.model';
import { DomainOfInfluenceCountingCircle } from './counting-circle.model';
import { DomainOfInfluenceParty } from './domain-of-influence-party.model';
import { PlausibilisationConfiguration } from './plausibilisation.model';

export { DomainOfInfluenceProto };
export { DomainOfInfluenceTypeProto as DomainOfInfluenceType };
export { DomainOfInfluenceCantonProto as DomainOfInfluenceCanton };

export function newDomainOfInfluence(): DomainOfInfluence {
  return {
    canton: DomainOfInfluenceCantonProto.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED,
    contactPerson: newContactPerson(),
    exportConfigurationsList: [],
    code: '',
    bfs: '',
    type: DomainOfInfluenceTypeProto.DOMAIN_OF_INFLUENCE_TYPE_UNSPECIFIED,
    authorityName: '',
    shortName: '',
    id: '',
    name: '',
    secureConnectId: '',
    parentId: '',
    sortNumber: undefined as unknown as number,
    childrenList: [],
    responsibleForVotingCards: false,
    hasLogo: false,
    parties: [],
    externalPrintingCenter: false,
    externalPrintingCenterEaiMessageType: '',
    sapCustomerOrderNumber: '',
    nameForProtocol: '',
  } as DomainOfInfluence;
}

export interface DomainOfInfluence
  extends Omit<DomainOfInfluenceProto.AsObject, 'info' | 'childrenList' | 'plausibilisationConfiguration' | 'partiesList'> {
  createdOn?: Date;
  modifiedOn?: Date;
  deletedOn?: Date;
  countingCircles?: DomainOfInfluenceCountingCircle[];
  childrenList?: DomainOfInfluence[];
  plausibilisationConfiguration?: PlausibilisationConfiguration;
  parties: DomainOfInfluenceParty[];
}

export interface DomainOfInfluenceLevel {
  level: number;
  desc: string;
}
