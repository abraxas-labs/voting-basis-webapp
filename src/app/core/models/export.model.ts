/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import {
  ExportConfiguration as ExportConfigurationProto,
  ExportTemplate as ExportTemplateProto,
} from '@abraxas/voting-basis-service-proto/grpc/models/export_pb';
import { ExportEntityType, ExportFileFormat, ExportGenerator } from '@abraxas/voting-basis-service-proto/grpc/shared/export_pb';

export { ExportEntityType };
export { ExportFileFormat };
export { ExportGenerator };
export { ExportConfigurationProto };
export type ExportTemplate = ExportTemplateProto.AsObject;
export type ExportConfiguration = ExportConfigurationProto.AsObject;

export interface GenerateExportRequest {
  key: string;
  entityId: string;
}
