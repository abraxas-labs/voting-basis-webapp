/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-truncated-value',
  templateUrl: './truncated-value.component.html',
})
export class TruncatedValueComponent {
  @Input()
  public value?: string;
}
