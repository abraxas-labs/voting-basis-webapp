/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AuthenticationService, AuthorizationService, SnackbarComponent } from '@abraxas/base-components';
import { OAuthService } from 'angular-oauth2-oidc';
import { SnackbarService, ThemeService } from '@abraxas/voting-lib';
import { LocationStrategy } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import 'moment/locale/de';
import { Subscription } from 'rxjs';
import { CursorService, CursorType } from './core/cursor.service';
import { LanguageService } from './core/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  public authenticated = false;
  public hasTenant = false;
  public loading = false;
  public theme?: string;

  @HostBinding('style.cursor')
  public cursor?: CursorType;

  @ViewChild('snackbar')
  public snackbarComponent?: SnackbarComponent;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    cursorService: CursorService,
    themeService: ThemeService,
    private readonly translations: TranslateService,
    private readonly oauthService: OAuthService,
    private readonly auth: AuthenticationService,
    private readonly authorization: AuthorizationService,
    private readonly languageService: LanguageService,
    private readonly locationStrategy: LocationStrategy,
    private readonly snackbarService: SnackbarService,
  ) {
    // enable automatic silent refresh
    this.oauthService.setupAutomaticSilentRefresh();

    const cursorSubscription = cursorService.cursor$.subscribe(c => (this.cursor = c));
    this.subscriptions.push(cursorSubscription);

    const snackbarSubscription = this.snackbarService.message$.subscribe(m => {
      if (!this.snackbarComponent) {
        return;
      }

      this.snackbarComponent.message = m.message;
      this.snackbarComponent.variant = m.variant;
      this.snackbarComponent.open();
    });
    this.subscriptions.push(snackbarSubscription);

    // This prevents a short flickering of the default theme (if another theme has been set)
    const themeSubscription = themeService.theme$.subscribe(theme => (this.theme = theme));
    this.subscriptions.push(themeSubscription);
  }

  public async switchTenant(): Promise<void> {
    window.location.reload(); // reload to ensure consistent state across all components, needed due to some base-components
  }

  public async reload(): Promise<void> {
    // reload to ensure consistent state across all components, needed due to some base-components
    window.location.href = this.locationStrategy.getBaseHref();
  }

  public logout(): void {
    this.auth.logout();
  }

  public async ngOnInit(): Promise<void> {
    moment.locale(this.languageService.currentLanguage);
    this.translations.setDefaultLang(this.languageService.currentLanguage);
    this.authenticated = false;
    this.hasTenant = false;
    this.loading = true;

    if (!(await this.auth.authenticate())) {
      this.loading = false;
      return;
    }

    this.authenticated = true;

    try {
      await this.authorization.getActiveTenant();
      this.hasTenant = true;
    } catch (e) {
      this.hasTenant = false;
    } finally {
      this.loading = false;
    }
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
