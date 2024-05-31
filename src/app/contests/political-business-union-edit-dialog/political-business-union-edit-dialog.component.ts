/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthorizationService } from '@abraxas/base-components';
import { EnumItemDescription, EnumUtil, SnackbarService } from '@abraxas/voting-lib';
import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MajorityElectionUnionService } from '../../core/majority-election-union.service';
import { PoliticalBusinessUnion, PoliticalBusinessUnionType } from '../../core/models/political-business-union.model';
import { ProportionalElectionUnionService } from '../../core/proportional-election-union.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-political-business-union-edit-dialog',
  templateUrl: './political-business-union-edit-dialog.component.html',
})
export class PoliticalBusinessUnionEditDialogComponent implements OnInit {
  public data: PoliticalBusinessUnion;
  public isNew: boolean = false;
  public saving: boolean = false;
  public listUnionTitleType: string = '';
  public politicalBusinessUnionTypes: EnumItemDescription<PoliticalBusinessUnionType>[] = [];

  private readonly enabledPoliticalBusinessUnionTypes: PoliticalBusinessUnionType[];
  private tenantId: string = '';

  constructor(
    private readonly dialogRef: MatDialogRef<PoliticalBusinessUnionEditDialogData>,
    private readonly i18n: TranslateService,
    private readonly snackbarService: SnackbarService,
    private readonly proportionalElectionUnionService: ProportionalElectionUnionService,
    private readonly majorityElectionUnionService: MajorityElectionUnionService,
    private readonly enumUtil: EnumUtil,
    private readonly auth: AuthorizationService,
    @Inject(MAT_DIALOG_DATA) dialogData: PoliticalBusinessUnionEditDialogData,
  ) {
    this.data = dialogData.politicalBusinessUnion;
    this.enabledPoliticalBusinessUnionTypes = dialogData.enabledPoliticalBusinessUnionTypes;
    this.isNew = !this.data.id;
  }

  public get canSave(): boolean {
    return !!this.data && !!this.data.description && this.data.type !== null && this.data.type >= 0;
  }

  public async ngOnInit(): Promise<void> {
    this.politicalBusinessUnionTypes = this.enumUtil
      .getArrayWithDescriptions<PoliticalBusinessUnionType>(PoliticalBusinessUnionType, 'POLITICAL_BUSINESS_UNION.TYPES.')
      .filter(p => this.enabledPoliticalBusinessUnionTypes.includes(p.value));

    this.tenantId = (await this.auth.getActiveTenant()).id;
  }

  public async save(): Promise<void> {
    if (!this.data || !this.canSave) {
      return;
    }

    try {
      this.saving = true;

      if (this.isNew) {
        this.data.id =
          this.data.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION
            ? await this.proportionalElectionUnionService.create(this.data)
            : await this.majorityElectionUnionService.create(this.data);
        this.data.secureConnectId = this.tenantId;
      } else {
        if (this.data.type === PoliticalBusinessUnionType.POLITICAL_BUSINESS_UNION_PROPORTIONAL_ELECTION) {
          await this.proportionalElectionUnionService.update(this.data);
        } else {
          await this.majorityElectionUnionService.update(this.data);
        }
      }

      this.snackbarService.success(this.i18n.instant('APP.SAVED'));
      const result: PoliticalBusinessUnionEditDialogResult = {
        politicalBusinessUnion: this.data,
      };
      this.dialogRef.close(result);
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface PoliticalBusinessUnionEditDialogData {
  politicalBusinessUnion: PoliticalBusinessUnion;
  enabledPoliticalBusinessUnionTypes: PoliticalBusinessUnionType[];
}

export interface PoliticalBusinessUnionEditDialogResult {
  politicalBusinessUnion: PoliticalBusinessUnion;
}
