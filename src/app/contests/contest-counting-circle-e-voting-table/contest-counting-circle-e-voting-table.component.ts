/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AdvancedTablePaginatorComponent } from '@abraxas/base-components';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ContestCountingCircleOption } from '../../core/models/contest.model';

@Component({
  selector: 'app-contest-counting-circle-e-voting-table',
  templateUrl: './contest-counting-circle-e-voting-table.component.html',
  styleUrls: ['./contest-counting-circle-e-voting-table.component.scss'],
})
export class ContestCountingCircleEVotingTableComponent implements AfterViewInit {
  public readonly columns = ['description', 'eVoting'];
  public dataSource: MatTableDataSource<ContestCountingCircleOption> = new MatTableDataSource<ContestCountingCircleOption>();

  public allEVoting: boolean = false;

  @ViewChild(AdvancedTablePaginatorComponent)
  public paginator!: AdvancedTablePaginatorComponent;

  @Input()
  public set options(v: ContestCountingCircleOption[]) {
    this.dataSource.data = v;
    this.updateAllEVoting();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public updateAllEVoting(): void {
    this.allEVoting = this.dataSource.data.every(x => x.eVoting);
  }

  public setAllEVoting(v: boolean): void {
    for (const option of this.dataSource.data) {
      option.eVoting = v;
    }
    this.allEVoting = v;
  }
}
