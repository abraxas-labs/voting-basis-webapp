/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Component } from '@angular/core';
import { ThemeService } from '@abraxas/voting-lib';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent {
  public theme: string = '';

  constructor(themeService: ThemeService) {
    themeService.theme$.subscribe(theme => (this.theme = theme ?? ''));
  }
}
