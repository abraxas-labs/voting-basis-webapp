/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PoliticalAssembly as PoliticalAssemblyProto } from '@abraxas/voting-basis-service-proto/grpc/models/political_assembly_pb';
import { DomainOfInfluence } from './domain-of-influence.model';
import { PoliticalAssemblyState } from '@abraxas/voting-basis-service-proto/grpc/shared/political_assembly_pb';

export { PoliticalAssemblyState };
export { PoliticalAssemblyProto };
export type PoliticalAssembly = {
  id: string;
  date?: Date;
  description: Map<string, string>;
  domainOfInfluenceId: string;
  domainOfInfluence: DomainOfInfluence;
  state: PoliticalAssemblyState;
  archivePer?: Date;
};

export function newPoliticalAssembly(): PoliticalAssembly {
  return {
    date: new Date(),
    description: new Map<string, string>(),
  } as PoliticalAssembly;
}
