/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  ContestImport,
  MajorityElectionImport,
  ProportionalElectionImport,
  ProportionalElectionListImport,
  VoteImport,
} from '@abraxas/voting-basis-service-proto/grpc/models/import_pb';
import { ImportType } from '@abraxas/voting-basis-service-proto/grpc/shared/import_pb';

export { ImportType };
export { ContestImport };
export { ProportionalElectionImport };
export { MajorityElectionImport };
export { VoteImport };
export { ProportionalElectionListImport };

export interface ImportFileContent {
  fileName: string;
  importType: ImportType;
  contest: ContestImport;
}
