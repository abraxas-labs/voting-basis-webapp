/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

export interface CheckableItem<T> {
  checked: boolean;
  item: T;
}

export class CheckableItems<T> {
  private atLeastOneCheckedValue: boolean = false;

  constructor(public items: CheckableItem<T>[]) {
    this.refreshState();
  }

  public get atLeastOneChecked(): boolean {
    return this.atLeastOneCheckedValue;
  }

  public get checkedItems(): CheckableItem<T>[] {
    return this.items.filter(i => i.checked);
  }

  public refreshState(): void {
    this.atLeastOneCheckedValue = this.items.filter(i => i.checked).length > 0;
  }

  public updateChecked(item: CheckableItem<T>, checked: boolean): void {
    item.checked = checked;
    this.refreshState();
  }
}
