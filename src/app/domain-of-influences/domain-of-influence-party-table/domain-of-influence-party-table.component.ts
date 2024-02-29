/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomainOfInfluenceParty } from '../../core/models/domain-of-influence-party.model';

@Component({
  selector: 'app-domain-of-influence-party-table',
  templateUrl: './domain-of-influence-party-table.component.html',
  styleUrls: ['./domain-of-influence-party-table.component.scss'],
})
export class DomainOfInfluencePartyTableComponent {
  public readonly columns = ['name', 'shortDescription', 'actions'];

  @Input()
  public parties: DomainOfInfluenceParty[] = [];

  @Input()
  public disabled: boolean = false;

  @Output()
  public edit: EventEmitter<DomainOfInfluenceParty> = new EventEmitter<DomainOfInfluenceParty>();

  @Output()
  public delete: EventEmitter<DomainOfInfluenceParty> = new EventEmitter<DomainOfInfluenceParty>();
}
