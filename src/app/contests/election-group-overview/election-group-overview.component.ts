/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService } from '@abraxas/voting-lib';
import { Component, Input, OnInit } from '@angular/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { ElectionGroup } from '../../core/models/election-group.model';
import {
  ElectionGroupEditDialogComponent,
  ElectionGroupEditDialogData,
  ElectionGroupEditDialogResult,
} from '../election-group-edit-dialog/election-group-edit-dialog.component';

@Component({
  selector: 'app-election-group-overview',
  templateUrl: './election-group-overview.component.html',
})
export class ElectionGroupOverviewComponent implements OnInit {
  public readonly columns = ['number', 'description', 'primaryBusinessNumber', 'secondaryElections', 'actions'];

  @Input()
  public electionGroups: ElectionGroup[] = [];

  @Input()
  public readonly: boolean = false;

  public loading: boolean = false;
  private tenantDomainOfInfluences: DomainOfInfluence[] = [];

  constructor(private readonly domainOfInfluenceService: DomainOfInfluenceService, private readonly dialogService: DialogService) {}

  public async ngOnInit(): Promise<void> {
    this.loading = true;
    try {
      this.tenantDomainOfInfluences = await this.domainOfInfluenceService.listForCurrentTenant();
    } finally {
      this.loading = false;
    }
  }

  public canEdit(electionGroup: ElectionGroup): boolean {
    return !!this.tenantDomainOfInfluences.find(doi => doi.id === electionGroup.primaryMajorityElection?.domainOfInfluenceId);
  }

  public getSecondaryElectionPoliticalBusinessNumbers(electionGroup: ElectionGroup): string {
    return electionGroup.secondaryPoliticalBusinessNumbersList.join(' / ');
  }

  public async edit(electionGroup: ElectionGroup): Promise<void> {
    const dialogData: ElectionGroupEditDialogData = {
      electionGroup: { ...electionGroup },
    };
    const result = await this.dialogService.openForResult<ElectionGroupEditDialogComponent, ElectionGroupEditDialogResult>(
      ElectionGroupEditDialogComponent,
      dialogData,
    );

    if (result?.electionGroup) {
      Object.assign(electionGroup, result.electionGroup);
    }
  }
}
