/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { AuthenticationService, AuthorizationService, SnackbarComponent } from '@abraxas/base-components';
import { OAuthService } from 'angular-oauth2-oidc';
import { SnackbarService, ThemeService } from '@abraxas/voting-lib';
import { LocationStrategy } from '@angular/common';
import { Component, HostBinding, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import 'moment/locale/de';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { CursorService, CursorType } from './core/cursor.service';
import { LanguageService } from './core/language.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  public authenticated = false;
  public hasTenant = false;
  public loading = true;
  public theme?: string;
  public customLogo?: string;
  public appTitle: string = '';

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
    private readonly title: Title,
  ) {
    // enable automatic silent refresh
    this.oauthService.setupAutomaticSilentRefresh({}, 'access_token');

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

    const themeSubscription = themeService.theme$.subscribe(theme => this.onThemeChange(theme));
    this.subscriptions.push(themeSubscription);

    const logoSubscription = themeService.logo$.subscribe(logo => (this.customLogo = logo));
    this.subscriptions.push(logoSubscription);

    const authSubscription = this.auth.authenticationChanged.pipe(filter(isAuthenticated => isAuthenticated)).subscribe(async () => {
      this.authenticated = true;

      try {
        // getActiveTenant is called to initialize the tenant cache, otherwise the authorization endpoint would be called multiple times
        await this.authorization.getActiveTenant();
        this.hasTenant = true;
      } catch (e) {
        this.hasTenant = false;
      } finally {
        this.loading = false;
      }
    });
    this.subscriptions.push(authSubscription);
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
  }

  public ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  private async onThemeChange(theme?: string): Promise<void> {
    if (!theme) {
      return;
    }

    // Cannot use translations.instant here, as the translations may not have been loaded yet
    // It would then just display the non-translated string
    this.appTitle = await firstValueFrom(this.translations.get('APP.APPLICATION_TITLE.' + theme));
    this.title.setTitle(this.appTitle);

    this.theme = theme;
  }
}
