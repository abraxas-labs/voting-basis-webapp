/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Inject } from '@angular/core';
import { ElectionGroupService } from '../../core/election-group.service';
import { ElectionGroup } from '../../core/models/election-group.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-secondary-election-create-dialog',
  templateUrl: './election-group-edit-dialog.component.html',
})
export class ElectionGroupEditDialogComponent {
  public electionGroup: ElectionGroup;
  public saving: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<ElectionGroupEditDialogComponent>,
    private readonly electionGroupService: ElectionGroupService,
    @Inject(MAT_DIALOG_DATA) dialogData: ElectionGroupEditDialogData,
  ) {
    this.electionGroup = dialogData.electionGroup;
  }

  public get canSave(): boolean {
    return !!this.electionGroup.description;
  }

  public async save(): Promise<void> {
    this.saving = true;

    try {
      await this.electionGroupService.update(this.electionGroup);
    } finally {
      this.saving = false;
    }

    const result: ElectionGroupEditDialogResult = {
      electionGroup: this.electionGroup,
    };
    this.dialogRef.close(result);
  }

  public cancel(): void {
    this.dialogRef.close();
  }
}

export interface ElectionGroupEditDialogData {
  electionGroup: ElectionGroup;
}

export interface ElectionGroupEditDialogResult {
  electionGroup: ElectionGroup;
}
