/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { DialogService, SnackbarService } from '@abraxas/voting-lib';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CountingCircleService } from '../../core/counting-circle.service';
import { CountingCirclesMerger } from '../../core/models/counting-circle.model';
import { CountingCircleMergerDialogComponent } from '../counting-circle-merger-dialog/counting-circle-merger-dialog.component';

@Component({
  selector: 'app-counting-circle-mergers',
  templateUrl: './counting-circle-mergers.component.html',
  styleUrls: ['./counting-circle-mergers.component.scss'],
})
export class CountingCircleMergersComponent implements OnInit {
  public readonly columns = ['name', 'bfs', 'code', 'activeFrom', 'mergedCountingCircles', 'actions'];
  public loading: boolean = true;

  public mergers: CountingCirclesMerger[] = [];

  constructor(
    private readonly dialogService: DialogService,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
    private readonly countingCirclesService: CountingCircleService,
  ) {}

  public async ngOnInit(): Promise<void> {
    try {
      this.mergers = await this.countingCirclesService.listMergers();
    } finally {
      this.loading = false;
    }
  }

  public async create(): Promise<void> {
    const created = await this.dialogService.openForResult(CountingCircleMergerDialogComponent, {});
    if (created) {
      this.mergers = [created, ...this.mergers];
    }
  }

  public async edit(entry: CountingCirclesMerger): Promise<void> {
    const updated = await this.dialogService.openForResult(CountingCircleMergerDialogComponent, { entry });
    if (updated) {
      const idx = this.mergers.indexOf(entry);
      this.mergers[idx] = updated;
      this.mergers = [...this.mergers];
    }
  }

  public async delete(entry: CountingCirclesMerger): Promise<void> {
    const shouldDelete = await this.dialogService.confirm('APP.DELETE', 'COUNTING_CIRCLE.MERGE.DETAIL.CONFIRM_DELETE', 'APP.DELETE');
    if (!shouldDelete) {
      return;
    }

    await this.countingCirclesService.deleteScheduledMerger(entry);
    this.mergers = this.mergers.filter(m => m.id !== entry.id);
    this.snackbarService.success(this.i18n.instant('APP.DELETED'));
  }
}
