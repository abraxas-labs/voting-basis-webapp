/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';
import { Subject } from 'rxjs';
import { AutocompleteComponent } from '@abraxas/base-components';

@Component({
  selector: 'app-domain-of-influence-selection',
  templateUrl: './domain-of-influence-selection.component.html',
})
export class DomainOfInfluenceSelectionComponent {
  private domainOfInfluencesValue: DomainOfInfluence[] = [];

  @Input()
  public disabled: boolean = false;

  public get domainOfInfluences(): DomainOfInfluence[] {
    return this.domainOfInfluencesValue;
  }

  @Input()
  public set domainOfInfluences(v: DomainOfInfluence[]) {
    this.domainOfInfluencesValue = v;
    this.setFilteredDomainOfInfluencesAndEnsureSelected();
  }

  @Output()
  public selectedDomainOfInfluenceChange: EventEmitter<DomainOfInfluence> = new EventEmitter<DomainOfInfluence>();

  @ViewChild(AutocompleteComponent)
  public autocompleteComponent!: AutocompleteComponent;

  public selectedDomainOfInfluenceValue: DomainOfInfluence | undefined;
  public domainOfInfluencesTypeahead: Subject<string> = new Subject<string>();
  public filteredDomainOfInfluences: DomainOfInfluence[] = [];

  constructor(private readonly ref: ChangeDetectorRef) {}

  @Input()
  public set selectedDomainOfInfluence(v: DomainOfInfluence | undefined) {
    this.selectedDomainOfInfluenceValue = v;
    this.setFilteredDomainOfInfluencesAndEnsureSelected(this.filteredDomainOfInfluences);
  }

  public setSelectedDomainOfInfluence(v: string): void {
    this.selectedDomainOfInfluenceValue = this.domainOfInfluences.find(t => t.name === v) || this.selectedDomainOfInfluenceValue;
    this.ref.detectChanges();
    this.selectedDomainOfInfluenceChange.emit(this.selectedDomainOfInfluenceValue);
  }

  public searchDomainOfInfluences(searchValue: string): void {
    if (searchValue.length < 1) {
      this.setFilteredDomainOfInfluencesAndEnsureSelected();

      // workaround to open autocomplete options after search
      this.autocompleteComponent.filteredItems = this.filteredDomainOfInfluences;
      this.ref.detectChanges();
      return;
    }

    const filteredDomainOfInfluences = this.domainOfInfluences.filter(doi => doi.name.toLowerCase().includes(searchValue.toLowerCase()));

    this.setFilteredDomainOfInfluencesAndEnsureSelected(filteredDomainOfInfluences);

    // workaround to open autocomplete options after search
    this.autocompleteComponent.filteredItems = this.filteredDomainOfInfluences;
    this.ref.detectChanges();
  }

  private setFilteredDomainOfInfluencesAndEnsureSelected(filteredDomainOfInfluences: DomainOfInfluence[] = []): void {
    const selected =
      this.domainOfInfluences.find(t => t.id === this.selectedDomainOfInfluenceValue?.id) || this.selectedDomainOfInfluenceValue;

    if (selected) {
      this.filteredDomainOfInfluences = [...new Set([...filteredDomainOfInfluences, selected])];
    } else {
      this.filteredDomainOfInfluences = filteredDomainOfInfluences;
    }
  }
}
