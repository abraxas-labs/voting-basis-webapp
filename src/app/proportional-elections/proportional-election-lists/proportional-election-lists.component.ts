/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluenceService } from '../../core/domain-of-influence.service';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';
import {
  newProportionalElection,
  newProportionalElectionList,
  ProportionalElection,
  ProportionalElectionCandidate,
  ProportionalElectionList,
  ProportionalElectionMandateAlgorithm,
  updateProportionalElectionListCandidateCountOk,
} from '../../core/models/proportional-election.model';
import { ProportionalElectionService } from '../../core/proportional-election.service';
import {
  ProportionalElectionListsAndCandidatesImportDialogComponent,
  ProportionalElectionListsAndCandidatesImportDialogData,
} from '../../shared/import/proportional-election-lists-and-candidates-import-dialog/proportional-election-lists-and-candidates-import-dialog.component'; // eslint-disable-line
import {
  ProportionalElectionListEditDialogComponent,
  ProportionalElectionListEditDialogData,
  ProportionalElectionListEditDialogResult,
} from './proportional-election-list-edit-dialog/proportional-election-list-edit-dialog.component';
import {
  ProportionalElectionListUnionsDialogComponent,
  ProportionalElectionListUnionsDialogData,
} from './proportional-election-list-unions-dialog/proportional-election-list-unions-dialog.component';

@Component({
  selector: 'app-proportional-election-lists',
  templateUrl: './proportional-election-lists.component.html',
  styleUrls: ['./proportional-election-lists.component.scss'],
})
export class ProportionalElectionListsComponent implements OnInit {
  public columns: string[] = [];

  @Input()
  public proportionalElection: ProportionalElection = newProportionalElection();

  @Input()
  public testingPhaseEnded: boolean = false;

  @Input()
  public locked: boolean = false;

  public lists: ProportionalElectionList[] = [];
  public selectedList?: ProportionalElectionList;
  public loading: boolean = false;
  public canSave: boolean = false;
  public parties: DomainOfInfluenceParty[] = [];
  public hasHagenbachBischoffDistribution: boolean = false;

  constructor(
    private readonly domainOfInfluenceService: DomainOfInfluenceService,
    private readonly proportionalElectionService: ProportionalElectionService,
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
  ) {}

  public async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      this.parties = await this.domainOfInfluenceService.listParties(this.proportionalElection.domainOfInfluenceId);
      this.hasHagenbachBischoffDistribution =
        this.proportionalElection.mandateAlgorithm ===
        ProportionalElectionMandateAlgorithm.PROPORTIONAL_ELECTION_MANDATE_ALGORITHM_HAGENBACH_BISCHOFF;
      this.updateColumns();
      await this.loadLists();
      this.updateAllListCandidatesOk();
      this.updateCanSave();
    } finally {
      this.loading = false;
    }
  }

  public async createList(): Promise<void> {
    const dialogData: ProportionalElectionListEditDialogData = {
      list: newProportionalElectionList(this.lists.length + 1, this.proportionalElection.id),
      numberOfMandates: this.proportionalElection.numberOfMandates,
      testingPhaseEnded: false,
    };
    const result = await this.dialogService.openForResult(ProportionalElectionListEditDialogComponent, dialogData);
    this.handleCreateList(result);
  }

  public async editList(list: ProportionalElectionList): Promise<void> {
    const dialogData: ProportionalElectionListEditDialogData = {
      list: { ...list },
      numberOfMandates: this.proportionalElection.numberOfMandates,
      testingPhaseEnded: this.testingPhaseEnded,
    };
    const result = await this.dialogService.openForResult(ProportionalElectionListEditDialogComponent, dialogData);
    this.handleEditList(result);
  }

  public async moveList(previousIndex: number, newIndex: number): Promise<void> {
    if (previousIndex === newIndex) {
      return;
    }

    const removedList = this.lists.splice(previousIndex, 1)[0];
    this.lists.splice(newIndex, 0, removedList);
    this.lists = [...this.lists];
    this.updateListPositions();

    await this.proportionalElectionService.reorderLists(this.proportionalElection.id, this.lists);
    this.snackbarService.success(this.i18n.instant('APP.SAVED'));
  }

  public async deleteList(list: ProportionalElectionList): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'PROPORTIONAL_ELECTION.LIST.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    await this.proportionalElectionService.deleteList(list.id);
    this.lists = this.lists.filter(l => l.id !== list.id);
    this.updateListPositions();
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
    this.updateCanSave();
  }

  public selectList(row: ProportionalElectionList): void {
    this.selectedList = row;
  }

  public async manageListUnions(): Promise<void> {
    const dialogData: ProportionalElectionListUnionsDialogData = {
      lists: this.lists,
      proportionalElection: this.proportionalElection,
    };
    await this.dialogService.openForResult(ProportionalElectionListUnionsDialogComponent, dialogData);
    await this.loadLists();
  }

  public candidateCreated(list: ProportionalElectionList, candidate: ProportionalElectionCandidate): void {
    list.countOfCandidates++;
    if (candidate.accumulated) {
      list.countOfCandidates++;
    }
    updateProportionalElectionListCandidateCountOk(list, this.proportionalElection.numberOfMandates);
    this.updateCanSave();
  }

  public candidateAccumulationUpdated(list: ProportionalElectionList, accumulated: boolean, wasAccumulated: boolean): void {
    if (accumulated === wasAccumulated) {
      return;
    }

    if (accumulated) {
      list.countOfCandidates++;
    } else {
      list.countOfCandidates--;
    }

    updateProportionalElectionListCandidateCountOk(list, this.proportionalElection.numberOfMandates);
    this.updateCanSave();
  }

  public candidateDeleted(list: ProportionalElectionList, candidate: ProportionalElectionCandidate): void {
    list.countOfCandidates--;
    if (candidate.accumulated) {
      list.countOfCandidates--;
    }
    updateProportionalElectionListCandidateCountOk(list, this.proportionalElection.numberOfMandates);
    this.updateCanSave();
  }

  public importListsAndCandidates(): void {
    const dialogData: ProportionalElectionListsAndCandidatesImportDialogData = {
      proportionalElection: this.proportionalElection,
    };

    this.dialogService.open(ProportionalElectionListsAndCandidatesImportDialogComponent, dialogData);
  }

  private async loadLists(): Promise<void> {
    this.lists = await this.proportionalElectionService.listLists(this.proportionalElection.id);
  }

  private handleCreateList(data?: ProportionalElectionListEditDialogResult): void {
    if (!data) {
      return;
    }

    this.lists = [...this.lists, data.list];
    this.updateCanSave();
  }

  private handleEditList(data?: ProportionalElectionListEditDialogResult): void {
    if (!data) {
      return;
    }

    const existingListIndex = this.lists.findIndex(l => l.id === data.list.id);
    if (existingListIndex < 0) {
      return;
    }

    this.lists[existingListIndex] = data.list;

    // trigger angular change detection
    this.lists = this.lists.concat([]);
    this.selectedList = data.list;
    this.updateCanSave();
  }

  private updateListPositions(): void {
    for (let i = 1; i <= this.lists.length; i++) {
      this.lists[i - 1].position = i;
    }
  }

  private updateCanSave(): void {
    this.canSave = this.lists.every(l => l.candidateCountOk);
  }

  private updateAllListCandidatesOk(): void {
    for (const list of this.lists) {
      updateProportionalElectionListCandidateCountOk(list, this.proportionalElection.numberOfMandates);
    }
  }

  private updateColumns() {
    this.columns = ['orderNumber', 'shortDescription', 'blankRowCount', 'actions'];

    if (this.hasHagenbachBischoffDistribution) {
      this.columns.splice(3, 0, 'listUnionDescription', 'subListUnionDescription');
    }
  }
}
