/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, EnumItemDescription, EnumUtil } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExportConfiguration } from '../../core/models/export.model';
import {
  ExportConfigurationAssignDialogComponent,
  ExportConfigurationAssignDialogData,
} from '../export-configuration-assign-dialog/export-configuration-assign-dialog.component';
import { ExportProvider } from '@abraxas/voting-basis-service-proto/grpc/shared/export_pb';

@Component({
  selector: 'app-export-configurations',
  templateUrl: './export-configurations.component.html',
  styleUrls: ['./export-configurations.component.scss'],
  standalone: false,
})
export class ExportConfigurationsComponent {
  public providers: EnumItemDescription<ExportProvider>[] = [];

  @Input()
  public readonly: boolean = false;

  @Input()
  public configurations?: ExportConfiguration[];

  @Output()
  public configurationsChange: EventEmitter<ExportConfiguration[]> = new EventEmitter<ExportConfiguration[]>();

  constructor(
    private readonly dialogService: DialogService,
    private readonly enumUtil: EnumUtil,
  ) {
    this.providers = enumUtil.getArrayWithDescriptions<ExportProvider>(
      ExportProvider,
      'DOMAIN_OF_INFLUENCE.AUSMITTLUNG.EXPORT_CONFIGURATION.PROVIDERS.',
    );
  }

  public async assign(config: ExportConfiguration): Promise<void> {
    const data: ExportConfigurationAssignDialogData = {
      assignedKeys: config.exportKeysList,
    };
    const result = await this.dialogService.openForResult(ExportConfigurationAssignDialogComponent, data);
    if (result) {
      config.exportKeysList = result;
    }
  }

  public remove(idx: number): void {
    const updatedConfigs = [...(this.configurations ?? [])];
    updatedConfigs.splice(idx, 1);
    this.configurations = updatedConfigs;
    this.configurationsChange.emit(this.configurations);
  }

  public add(): void {
    this.configurations = [
      ...(this.configurations ?? []),
      {
        description: '',
        id: '',
        exportKeysList: [],
        eaiMessageType: '',
        domainOfInfluenceId: '',
        provider: ExportProvider.EXPORT_PROVIDER_STANDARD,
      },
    ];
    this.configurationsChange.emit(this.configurations);
  }
}
