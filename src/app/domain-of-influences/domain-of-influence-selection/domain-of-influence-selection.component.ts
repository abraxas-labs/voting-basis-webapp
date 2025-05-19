/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-domain-of-influence-selection',
  templateUrl: './domain-of-influence-selection.component.html',
  standalone: false,
})
export class DomainOfInfluenceSelectionComponent {
  private domainOfInfluencesValue: DomainOfInfluence[] = [];

  @Input()
  public readonly: boolean = false;

  public get domainOfInfluences(): DomainOfInfluence[] {
    return this.domainOfInfluencesValue;
  }

  @Input()
  public set domainOfInfluences(v: DomainOfInfluence[]) {
    this.domainOfInfluencesValue = v;
    this.domainOfInfluenceSelectionItems = v.map(doi => this.mapToSeletionItem(doi)!);
  }

  @Output()
  public selectedDomainOfInfluenceChange: EventEmitter<DomainOfInfluence> = new EventEmitter<DomainOfInfluence>();

  public domainOfInfluenceSelectionItems: DomainOfInfluenceSelectionItem[] = [];
  public selectedDomainOfInfluenceSelectionItem: DomainOfInfluenceSelectionItem | undefined;

  constructor(private readonly i18n: TranslateService) {}

  @Input()
  public set selectedDomainOfInfluence(v: DomainOfInfluence | undefined) {
    this.selectedDomainOfInfluenceSelectionItem = this.mapToSeletionItem(v);
  }

  public setSelectedDomainOfInfluenceSelectionItem(v: string): void {
    this.selectedDomainOfInfluenceSelectionItem =
      this.domainOfInfluenceSelectionItems.find(t => t.label === v) || this.selectedDomainOfInfluenceSelectionItem;

    this.selectedDomainOfInfluenceChange.emit(
      this.domainOfInfluences.find(doi => doi.id == this.selectedDomainOfInfluenceSelectionItem?.id),
    );
  }

  public filterDomainOfInfluences(item: DomainOfInfluenceSelectionItem, filterValue: string): boolean {
    return item.label.toLowerCase().includes(filterValue.toLowerCase());
  }

  private mapToSeletionItem(doi?: DomainOfInfluence): DomainOfInfluenceSelectionItem | undefined {
    if (!doi) {
      return undefined;
    }

    const bfs = !!doi.bfs ? `, ${this.i18n.instant('DOMAIN_OF_INFLUENCE.BFS_SHORT')} ${doi.bfs}` : '';

    return {
      id: doi.id,
      label: `${doi.name} (${this.i18n.instant('DOMAIN_OF_INFLUENCE.SHORT_TYPES.' + doi.type)}${bfs})`,
    };
  }
}

interface DomainOfInfluenceSelectionItem {
  id: string;
  label: string;
}
