/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SimpleStepperComponent } from '@abraxas/base-components';
import { SnackbarService } from '@abraxas/voting-lib';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { Component, ViewChild, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { ImportService } from '../../../core/import.service';
import { PartyMappingContainer } from '../../../core/models/domain-of-influence-party.model';
import { ImportFileContent, ImportType, ProportionalElectionListImport } from '../../../core/models/import.model';
import { ProportionalElection, ProportionalElectionListUnionProto } from '../../../core/models/proportional-election.model';
import { ProportionalElectionPartyMappingService } from '../../../core/proportional-election-party-mapping.service';
import { flatMap } from '../../../core/utils/array.utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-proportional-election-lists-and-candidates-import-dialog',
  templateUrl: './proportional-election-lists-and-candidates-import-dialog.component.html',
  styleUrls: ['./proportional-election-lists-and-candidates-import-dialog.component.scss'],
  standalone: false,
})
export class ProportionalElectionListsAndCandidatesImportDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<ProportionalElectionListsAndCandidatesImportDialogComponent>>(MatDialogRef);
  private readonly importService = inject(ImportService);
  private readonly snackbarService = inject(SnackbarService);
  private readonly i18n = inject(TranslateService);
  private readonly domainOfInfluenceService = inject(DomainOfInfluenceService);
  private readonly partyMappingService = inject(ProportionalElectionPartyMappingService);

  public saving: boolean = false;
  public loadingParties: boolean = false;
  public lastStep: boolean = false;
  public partyMappings?: PartyMappingContainer;
  public readonly importTypes: ImportType[] = [ImportType.IMPORT_TYPE_ECH_157];
  private readonly proportionalElection: ProportionalElection;

  private proportionalElectionLists?: ProportionalElectionListImport[];
  private proportionalElectionListUnions?: ProportionalElectionListUnionProto[];

  @ViewChild(SimpleStepperComponent, { static: true })
  public stepper!: SimpleStepperComponent;

  constructor() {
    const dialogData = inject<ProportionalElectionListsAndCandidatesImportDialogData>(MAT_DIALOG_DATA);

    this.proportionalElection = dialogData.proportionalElection;
  }

  public get canSave(): boolean {
    return (
      (!!this.proportionalElectionLists && this.proportionalElectionLists.length > 0) ||
      (!!this.proportionalElectionListUnions && this.proportionalElectionListUnions.length > 0)
    );
  }

  public importFilesChanged(files: ImportFileContent[]): void {
    if (files.length === 0) {
      delete this.proportionalElectionLists;
      delete this.proportionalElectionListUnions;
      return;
    }

    const proportionalElections = flatMap(files.map(c => c.contest.getProportionalElectionsList()));
    this.proportionalElectionLists = flatMap(proportionalElections.map(m => m.getListsList()));
    this.proportionalElectionListUnions = flatMap(proportionalElections.map(m => m.getListUnionsList()));
  }

  public async save(): Promise<void> {
    if (!this.canSave) {
      return;
    }

    this.saving = true;
    try {
      this.partyMappingService.applyMappings(this.partyMappings);
      await this.importService.importProportionalElectionListsAndCandidates(
        this.proportionalElection.id,
        this.proportionalElectionLists ?? [],
        this.proportionalElectionListUnions ?? [],
      );

      const message = this.i18n.instant('IMPORT.IMPORT_SUCCESSFUL');
      this.snackbarService.success(message);
      this.dialogRef.close();
    } finally {
      this.saving = false;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public async stepChange(event: StepperSelectionEvent): Promise<void> {
    this.lastStep = event.selectedIndex === this.stepper.steps.length - 1;

    if (this.lastStep) {
      await this.loadParties();
    }
  }

  private async loadParties(): Promise<void> {
    try {
      this.loadingParties = true;
      const parties = await this.domainOfInfluenceService.listParties(this.proportionalElection.domainOfInfluenceId);
      this.partyMappings = this.partyMappingService.buildImportPartyMappingGroups(this.proportionalElectionLists ?? [], parties);
    } finally {
      this.loadingParties = false;
    }
  }
}

export interface ProportionalElectionListsAndCandidatesImportDialogData {
  proportionalElection: ProportionalElection;
}
