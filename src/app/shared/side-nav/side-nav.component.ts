/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, OnDestroy } from '@angular/core';
import { ThemeService } from '@abraxas/voting-lib';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, startWith, Subscription } from 'rxjs';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
})
export class SideNavComponent implements OnDestroy {
  public readonly contestNavIndex: number = 1;
  public readonly contestUrl: string = 'contests';
  public readonly countingCircleNavIndex: number = 2;
  public readonly countingCircleUrl: string = 'counting-circles';
  public readonly domainOfInfluenceNavIndex: number = 3;
  public readonly domainOfInfluenceUrl: string = 'domain-of-influences';
  public readonly activityNavIndex: number = 4;
  public readonly activityUrl: string = 'activities';
  public readonly cantonSettingsNavIndex: number = 5;
  public readonly cantonSettingsUrl: string = 'canton-settings';

  public theme: string = '';
  public active: number = 0;

  private routerSubscription: Subscription;

  constructor(
    themeService: ThemeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    themeService.theme$.subscribe(theme => (this.theme = theme ?? ''));
    this.routerSubscription = this.router.events
      .pipe(
        filter(evt => evt instanceof NavigationEnd),
        startWith(this.router),
      )
      .subscribe(event => {
        // get third url param, as the type of route is stored there
        const navigationUrl = (event as NavigationEnd).url.split('/')[2];
        switch (navigationUrl) {
          case this.contestUrl:
            this.active = this.contestNavIndex;
            break;
          case this.countingCircleUrl:
            this.active = this.countingCircleNavIndex;
            break;
          case this.domainOfInfluenceUrl:
            this.active = this.domainOfInfluenceNavIndex;
            break;
          case this.activityUrl:
            this.active = this.activityNavIndex;
            break;
          case this.cantonSettingsUrl:
            this.active = this.cantonSettingsNavIndex;
            break;
        }
      });
  }

  public ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }
}
