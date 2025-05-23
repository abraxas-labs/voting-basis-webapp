/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Tenant } from '@abraxas/base-components';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CountingCirclesMerger } from '../../core/models/counting-circle.model';

@Component({
  selector: 'app-counting-circle-merger-general-informations',
  templateUrl: './counting-circle-merger-general-informations.component.html',
  standalone: false,
})
export class CountingCircleMergerGeneralInformationsComponent implements OnInit, AfterViewInit {
  @Input()
  public merger!: CountingCirclesMerger;

  public showEVotingActiveFrom: boolean = false;

  private viewInitialized: boolean = false;
  private eVotingActiveFromString: string = '';
  private selectedResponsibleAuthorityValue: Tenant | undefined;

  public get selectedResponsibleAuthority(): Tenant | undefined {
    return this.selectedResponsibleAuthorityValue;
  }

  public set selectedResponsibleAuthority(v: Tenant | undefined) {
    if (v === this.selectedResponsibleAuthorityValue) {
      return;
    }

    this.merger.newCountingCircle.responsibleAuthority!.secureConnectId = v?.id || '';
    this.merger.newCountingCircle.responsibleAuthority!.name = v?.name || '';
    this.selectedResponsibleAuthorityValue = v;
  }

  public ngOnInit(): void {
    if (!this.merger.newCountingCircle.responsibleAuthority) {
      return;
    }

    this.selectedResponsibleAuthority = {
      id: this.merger.newCountingCircle.responsibleAuthority.secureConnectId,
      name: this.merger.newCountingCircle.responsibleAuthority.name,
    } as Tenant;
  }

  public ngAfterViewInit(): void {
    this.viewInitialized = true;
  }

  public setActiveFrom(activeFromString: string): void {
    if (!activeFromString) {
      return;
    }

    this.merger.activeFrom = new Date(activeFromString);
  }

  public copyFromChange(countingCircleId: string): void {
    // this event emits before the view is initialized and therefore would override if editing an existing entry.
    if (!countingCircleId || !this.viewInitialized) {
      return;
    }

    const countingCircle = this.merger.mergedCountingCircles.find(cc => cc.id === countingCircleId)!;

    this.merger.copyFromCountingCircleId = countingCircleId;
    this.merger.newCountingCircle.name = countingCircle.name;
    this.merger.newCountingCircle.bfs = countingCircle.bfs;
    this.merger.newCountingCircle.code = countingCircle.code;
    this.merger.newCountingCircle.responsibleAuthority = countingCircle.responsibleAuthority;
    this.merger.newCountingCircle.nameForProtocol = countingCircle.nameForProtocol;
    this.merger.newCountingCircle.sortNumber = countingCircle.sortNumber;
    this.merger.newCountingCircle.eCounting = countingCircle.eCounting;
    this.merger.newCountingCircle.eVotingActiveFrom = countingCircle.eVotingActiveFrom;

    this.showEVotingActiveFrom = !!countingCircle.eVotingActiveFrom;

    this.selectedResponsibleAuthority = {
      name: countingCircle.responsibleAuthority!.name,
      id: countingCircle.responsibleAuthority!.secureConnectId,
    } as Tenant;
  }

  public updateShowEVotingActiveFrom(showEVotingActiveFrom: boolean): void {
    if (!this.merger.newCountingCircle) {
      return;
    }

    this.showEVotingActiveFrom = showEVotingActiveFrom;

    if (!this.showEVotingActiveFrom) {
      this.merger.newCountingCircle.eVotingActiveFrom = undefined;
    } else {
      this.merger.newCountingCircle.eVotingActiveFrom ??= new Date();
    }
  }

  public updateEVotingActiveFrom(eVotingActiveFrom: string): void {
    if (!this.merger.newCountingCircle || !eVotingActiveFrom || this.eVotingActiveFromString === eVotingActiveFrom) {
      return;
    }

    this.eVotingActiveFromString = eVotingActiveFrom;
    this.merger.newCountingCircle.eVotingActiveFrom = new Date(eVotingActiveFrom);
  }
}
