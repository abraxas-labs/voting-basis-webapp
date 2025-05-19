/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { DomainOfInfluenceService } from '../../../core/domain-of-influence.service';
import { ContestProto } from '../../../core/models/contest.model';
import { DomainOfInfluence } from '../../../core/models/domain-of-influence.model';
import { ContestImport, ImportFileContent } from '../../../core/models/import.model';
import { flatMap } from '../../../core/utils/array.utils';
import { toJsMap } from '../../../core/utils/map.utils';
import { TableDataSource } from '@abraxas/base-components';

@Component({
  selector: 'app-import-contest-edit',
  templateUrl: './import-contest-edit.component.html',
  styleUrls: ['./import-contest-edit.component.scss'],
  standalone: false,
})
export class ImportContestEditComponent implements OnInit {
  @Output()
  public contestImport: EventEmitter<ContestImport | undefined> = new EventEmitter<ContestImport | undefined>();

  public readonly columns = ['select', 'filename', 'date', 'description', 'eVotingFrom', 'eVotingTo'];
  public dataSource: TableDataSource<ContestImportFile> = new TableDataSource<ContestImportFile>();
  public domainOfInfluences: DomainOfInfluence[] = [];
  public domainOfInfluenceId: string = '';
  public endOfTestingPhaseString: string = '';
  public loading: boolean = false;
  public selection = new SelectionModel<ContestImportFile>(false, []);
  private _importFiles: ImportFileContent[] = [];

  constructor(private readonly domainOfInfluenceService: DomainOfInfluenceService) {}

  @Input()
  public set importFiles(importFiles: ImportFileContent[]) {
    this._importFiles = importFiles;
    this.dataSource.data = importFiles.map(i => this.toContestImportFile(i));
  }

  public async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      this.domainOfInfluences = await this.domainOfInfluenceService.listForCurrentTenant();
      if (this.domainOfInfluences.length === 1) {
        this.domainOfInfluenceId = this.domainOfInfluences[0].id;
      }
    } finally {
      this.loading = false;
    }
  }

  public setSelected(importFile: ContestImportFile, selected: boolean = true): void {
    // ignore deselected events and cannot use toggle for the same reason:
    // since the selection is single selection only
    // and automatically deselects others on selection of an item
    // and fires events for the selection as well as the deselection.
    // if the deselection event happens first, everything works,
    // but if the selection event happens first, the other item is automatically deselected,
    // which leads to two toggle calls, which then leads to another selection.
    if (!selected) {
      return;
    }

    this.selection.select(importFile);
    this.emitContestImport();
  }

  public emitContestImport(): void {
    const selected = this.selection.selected;
    if (selected.length !== 1 || !this.domainOfInfluenceId || !this.endOfTestingPhaseString) {
      this.contestImport.emit();
      return;
    }

    const contest = selected[0].contest;
    contest.setDomainOfInfluenceId(this.domainOfInfluenceId);
    const endOfTestingPhase = new Timestamp();
    endOfTestingPhase.fromDate(new Date(this.endOfTestingPhaseString));
    contest.setEndOfTestingPhase(endOfTestingPhase);

    const majorityElections = flatMap(this._importFiles.map(c => c.contest.getMajorityElectionsList()));
    const proportionalElections = flatMap(this._importFiles.map(c => c.contest.getProportionalElectionsList()));
    const votes = flatMap(this._importFiles.map(c => c.contest.getVotesList()));

    const contestImport = new ContestImport();
    contestImport.setContest(contest);
    contestImport.setMajorityElectionsList(majorityElections);
    contestImport.setProportionalElectionsList(proportionalElections);
    contestImport.setVotesList(votes);
    this.contestImport.emit(contestImport);
  }

  private toContestImportFile(importContent: ImportFileContent): ContestImportFile {
    const contest = importContent.contest.getContest()!;
    return {
      fileName: importContent.fileName,
      contestDate: contest.getDate()!.toDate(),
      description: toJsMap(contest.getDescriptionMap()),
      eVotingFrom: contest.getEVotingFrom()?.toDate(),
      eVotingTo: contest.getEVotingTo()?.toDate(),
      contest,
    };
  }
}

export interface ContestImportFile {
  fileName: string;
  contestDate: Date;
  description: Map<string, string>;
  eVotingFrom?: Date;
  eVotingTo?: Date;
  contest: ContestProto;
}
