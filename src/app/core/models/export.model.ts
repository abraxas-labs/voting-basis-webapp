/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  ExportConfiguration as ExportConfigurationProto,
  ExportTemplate as ExportTemplateProto,
  ExportSedexConfiguration as ExportSedexConfigurationProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/export_pb';
import { ExportEntityType, ExportFileFormat, ExportGenerator } from '@abraxas/voting-basis-service-proto/grpc/shared/export_pb';

export { ExportEntityType };
export { ExportFileFormat };
export { ExportGenerator };
export { ExportConfigurationProto };
export { ExportSedexConfigurationProto };
export type ExportTemplate = ExportTemplateProto.AsObject;
export interface ExportConfiguration extends Omit<ExportConfigurationProto.AsObject, 'sedexConfiguration'> {
  sedexConfiguration?: ExportSedexConfiguration;
}

export interface ExportSedexConfiguration extends Omit<ExportSedexConfigurationProto.AsObject, 'recipientIdsList'> {
  recipientIds: string;
}

export interface GenerateExportRequest {
  key: string;
  entityId: string;
}
