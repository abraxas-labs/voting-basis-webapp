/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService } from '@abraxas/voting-lib';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ExportConfiguration } from '../../core/models/export.model';
import {
  ExportConfigurationAssignDialogComponent,
  ExportConfigurationAssignDialogData,
} from '../../domain-of-influences/export-configuration-assign-dialog/export-configuration-assign-dialog.component';

@Component({
  selector: 'app-export-configurations',
  templateUrl: './export-configurations.component.html',
  styleUrls: ['./export-configurations.component.scss'],
})
export class ExportConfigurationsComponent {
  @Input()
  public disabled: boolean = false;

  @Input()
  public configurations?: ExportConfiguration[];

  @Output()
  public configurationsChange: EventEmitter<ExportConfiguration[]> = new EventEmitter<ExportConfiguration[]>();

  constructor(private readonly dialogService: DialogService) {}

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
      },
    ];
    this.configurationsChange.emit(this.configurations);
  }
}
