/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  PoliticalBusiness as PoliticalBusinessProto,
  PoliticalBusinessSummary as PoliticalBusinessSummaryProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/political_business_pb';
import {
  PoliticalBusinessType as PoliticalBusinessTypeProto,
  PoliticalBusinessSubType as PoliticalBusinessSubTypeProto,
} from '@abraxas/voting-basis-service-proto/grpc/shared/political_business_pb';
import { DomainOfInfluence } from './domain-of-influence.model';

export { PoliticalBusinessProto };
export { PoliticalBusinessTypeProto as PoliticalBusinessType };
export { PoliticalBusinessSubTypeProto as PoliticalBusinessSubType };
export type PoliticalBusiness = Omit<
  PoliticalBusinessProto.AsObject,
  'shortDescriptionMap' | 'officialDescriptionMap' | 'domainOfInfluence'
> & {
  shortDescription: Map<string, string>;
  officialDescription: Map<string, string>;
  domainOfInfluence: DomainOfInfluence;
};
export interface PoliticalBusinessBase {
  id: string;
  politicalBusinessNumber: string;
  officialDescription: Map<string, string>;
  shortDescription: Map<string, string>;
  domainOfInfluenceId: string;
  contestId: string;
  active: boolean;
}

export { PoliticalBusinessSummaryProto };
export type PoliticalBusinessSummary = Omit<
  PoliticalBusinessSummaryProto.AsObject,
  'shortDescriptionMap' | 'officialDescriptionMap' | 'domainOfInfluence'
> & {
  shortDescription: Map<string, string>;
  officialDescription: Map<string, string>;
  domainOfInfluence: DomainOfInfluence;
};
