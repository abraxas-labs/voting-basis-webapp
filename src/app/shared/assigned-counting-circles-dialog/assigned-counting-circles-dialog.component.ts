/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FilterDirective, PaginatorComponent, SortDirective, TableDataSource } from '@abraxas/base-components';
import { DomainOfInfluenceCountingCircle } from '../../core/models/counting-circle.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CountingCircleService } from '../../core/counting-circle.service';

@Component({
  selector: 'app-assigned-counting-circles-dialog',
  templateUrl: './assigned-counting-circles-dialog.component.html',
  standalone: false,
})
export class AssignedCountingCirclesDialogComponent implements OnInit, AfterViewInit {
  private readonly countingCircleService = inject(CountingCircleService);

  public readonly nameColumn = 'name';
  public readonly columns = [this.nameColumn];

  @ViewChild('paginator')
  public paginator!: PaginatorComponent;

  @ViewChild(SortDirective)
  public sort!: SortDirective;

  @ViewChild(FilterDirective)
  public filter!: FilterDirective;

  public dataSource = new TableDataSource<DomainOfInfluenceCountingCircle>();
  public loading: boolean = false;

  private readonly domainOfInfluenceId: string;

  constructor() {
    const dialogData = inject<AssignedCountingCirclesDialogData>(MAT_DIALOG_DATA);

    this.domainOfInfluenceId = dialogData.domainOfInfluenceId;
  }

  public async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filter;
    this.dataSource.sort = this.sort;
  }

  private async loadData(): Promise<void> {
    try {
      this.loading = true;
      this.dataSource.data = await this.countingCircleService.listAssignedForDomainOfInfluence(this.domainOfInfluenceId);
    } finally {
      this.loading = false;
    }
  }
}

export interface AssignedCountingCirclesDialogData {
  domainOfInfluenceId: string;
}
