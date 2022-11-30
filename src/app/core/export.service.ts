/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { ExportServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/export_service_grpc_web_pb';
import { GetExportTemplatesRequest } from '@abraxas/voting-basis-service-proto/grpc/requests/export_requests_pb';
import { DialogService, FileDownloadService, GrpcBackendService, GrpcService, SnackbarService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { ExportDialogComponent, ExportDialogData } from '../shared/export-dialog/export-dialog.component';
import { CursorService } from './cursor.service';
import { ExportEntityType, ExportGenerator, ExportTemplate, GenerateExportRequest } from './models/export.model';

@Injectable({
  providedIn: 'root',
})
export class ExportService extends GrpcService<ExportServicePromiseClient> {
  private readonly restApiUrl: string = '';
  private readonly templatesByGeneratorCache: { [key in ExportGenerator]?: ExportTemplate[] } = {};
  private readonly templatesByGeneratorAndEntityTypeCache: {
    [key in ExportGenerator]?: { [key2 in ExportEntityType]?: ExportTemplate[] };
  } = {};

  constructor(
    grpcBackend: GrpcBackendService,
    private readonly dialog: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly cursor: CursorService,
    private readonly fileDownloadService: FileDownloadService,
  ) {
    super(ExportServicePromiseClient, environment, grpcBackend);
    this.restApiUrl = `${environment.restApiEndpoint}/exports`;
  }

  public async getTemplates(generator: ExportGenerator): Promise<ExportTemplate[]> {
    const templatesByGenerator = this.templatesByGeneratorCache[generator];
    if (templatesByGenerator !== undefined) {
      return templatesByGenerator;
    }

    const request = new GetExportTemplatesRequest();
    request.setGenerator(generator);
    const templates = await this.request(
      c => c.getTemplates,
      request,
      r => r.toObject().exportTemplatesList,
    );

    this.templatesByGeneratorCache[generator] = templates;
    return templates;
  }

  public async downloadExportOrShowDialog(entityType: ExportEntityType, entityId: string): Promise<void> {
    const templates = await this.getTemplatesWithEntityType(ExportGenerator.EXPORT_GENERATOR_VOTING_BASIS, entityType);
    if (templates.length === 1) {
      const downloadExportPromise = this.downloadExport(templates[0], entityId);
      await this.cursor.loadingWhile(downloadExportPromise);
      this.snackbarService.success(this.i18n.instant('EXPORTS.SUCCESS'));
      return;
    }

    const dialogData: ExportDialogData = {
      templates,
      download: t => this.downloadExport(t, entityId),
    };
    this.dialog.open(ExportDialogComponent, dialogData);
  }

  public async downloadExport(exportTemplate: ExportTemplate, entityId: string): Promise<void> {
    const req: GenerateExportRequest = {
      entityId,
      ...exportTemplate,
    };
    await this.fileDownloadService.postDownloadFile(this.restApiUrl, req);
  }

  private async getTemplatesWithEntityType(generator: ExportGenerator, entityType: ExportEntityType): Promise<ExportTemplate[]> {
    const templatesByEntityType = this.templatesByGeneratorAndEntityTypeCache[generator];
    if (templatesByEntityType !== undefined) {
      const cachedTemplates = templatesByEntityType[entityType];
      if (cachedTemplates !== undefined) {
        return cachedTemplates;
      }
    } else {
      this.templatesByGeneratorAndEntityTypeCache[generator] = {};
    }

    const request = new GetExportTemplatesRequest();
    request.setGenerator(generator);
    request.setEntityType(entityType);
    const templates = await this.request(
      c => c.getTemplates,
      request,
      r => r.toObject().exportTemplatesList,
    );

    this.templatesByGeneratorAndEntityTypeCache[generator]![entityType] = templates;
    return templates;
  }
}
