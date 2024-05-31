/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { PoliticalAssembly as PoliticalAssemblyProto } from '@abraxas/voting-basis-service-proto/grpc/models/political_assembly_pb';
import { DomainOfInfluence } from './domain-of-influence.model';

export { PoliticalAssemblyProto };
export type PoliticalAssembly = {
  id: string;
  date?: Date;
  description: Map<string, string>;
  domainOfInfluenceId: string;
  domainOfInfluence: DomainOfInfluence;
};

export function newPoliticalAssembly(): PoliticalAssembly {
  return {
    date: new Date(),
    description: new Map<string, string>(),
  } as PoliticalAssembly;
}
