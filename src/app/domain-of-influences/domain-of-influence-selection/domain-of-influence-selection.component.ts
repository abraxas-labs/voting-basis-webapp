/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { Subject } from 'rxjs';
import { AutocompleteComponent } from '@abraxas/base-components';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-domain-of-influence-selection',
  templateUrl: './domain-of-influence-selection.component.html',
})
export class DomainOfInfluenceSelectionComponent {
  private domainOfInfluencesValue: DomainOfInfluence[] = [];
  private domainOfInfluenceSelectionItems: DomainOfInfluenceSelectionItem[] = [];

  @Input()
  public readonly: boolean = false;

  public get domainOfInfluences(): DomainOfInfluence[] {
    return this.domainOfInfluencesValue;
  }

  @Input()
  public set domainOfInfluences(v: DomainOfInfluence[]) {
    this.domainOfInfluencesValue = v;
    this.domainOfInfluenceSelectionItems = v.map(doi => this.mapToSeletionItem(doi)!);
    this.setFilteredDomainOfInfluencesAndEnsureSelected();
  }

  @Output()
  public selectedDomainOfInfluenceChange: EventEmitter<DomainOfInfluence> = new EventEmitter<DomainOfInfluence>();

  @ViewChild(AutocompleteComponent)
  public autocompleteComponent!: AutocompleteComponent;

  public domainOfInfluencesTypeahead: Subject<string> = new Subject<string>();
  public filteredDomainOfInfluenceSelectionItems: DomainOfInfluenceSelectionItem[] = [];
  public selectedDomainOfInfluenceSelectionItem: DomainOfInfluenceSelectionItem | undefined;

  constructor(
    private readonly ref: ChangeDetectorRef,
    private readonly i18n: TranslateService,
  ) {}

  @Input()
  public set selectedDomainOfInfluence(v: DomainOfInfluence | undefined) {
    this.selectedDomainOfInfluenceSelectionItem = this.mapToSeletionItem(v);
    this.setFilteredDomainOfInfluencesAndEnsureSelected(this.filteredDomainOfInfluenceSelectionItems);
  }

  public setSelectedDomainOfInfluenceSelectionItem(v: string): void {
    this.selectedDomainOfInfluenceSelectionItem =
      this.domainOfInfluenceSelectionItems.find(t => t.label === v) || this.selectedDomainOfInfluenceSelectionItem;
    this.ref.detectChanges();

    this.selectedDomainOfInfluenceChange.emit(
      this.domainOfInfluences.find(doi => doi.id == this.selectedDomainOfInfluenceSelectionItem?.id),
    );
  }

  public searchDomainOfInfluences(searchValue: string): void {
    if (searchValue.length < 1) {
      this.setFilteredDomainOfInfluencesAndEnsureSelected();

      // workaround to open autocomplete options after search
      this.autocompleteComponent.filteredItems = this.filteredDomainOfInfluenceSelectionItems;
      this.ref.detectChanges();
      return;
    }

    const filteredDomainOfInfluenceIds = this.domainOfInfluences
      .filter(doi => doi.name.toLowerCase().includes(searchValue.toLowerCase()))
      .map(doi => doi.id);

    const filteredDomainOfInfluenceSelectionItems = this.domainOfInfluenceSelectionItems.filter(doi =>
      filteredDomainOfInfluenceIds.includes(doi.id),
    );
    this.setFilteredDomainOfInfluencesAndEnsureSelected(filteredDomainOfInfluenceSelectionItems);

    // workaround to open autocomplete options after search
    this.autocompleteComponent.filteredItems = this.filteredDomainOfInfluenceSelectionItems;
    this.ref.detectChanges();
  }

  private setFilteredDomainOfInfluencesAndEnsureSelected(filteredDomainOfInfluences: DomainOfInfluenceSelectionItem[] = []): void {
    const selected =
      this.domainOfInfluenceSelectionItems.find(t => t.id === this.selectedDomainOfInfluenceSelectionItem?.id) ||
      this.selectedDomainOfInfluenceSelectionItem;

    if (selected) {
      this.filteredDomainOfInfluenceSelectionItems = [...new Set([...filteredDomainOfInfluences, selected])];
    } else {
      this.filteredDomainOfInfluenceSelectionItems = filteredDomainOfInfluences;
    }
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
