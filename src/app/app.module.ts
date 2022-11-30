/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { AuthenticationModule, AuthorizationModule, AuthStorageService, TenantModule, UserModule } from '@abraxas/base-components';
import { ENV_INJECTION_TOKEN, VotingLibModule } from '@abraxas/voting-lib';
import { registerLocaleData } from '@angular/common';
import localeDeCh from '@angular/common/locales/de-CH';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService as CoreTranslateService } from '@ngx-translate/core';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateService } from './core/translate.service';
import { WebpackTranslateLoader } from './core/webpack-translate-loader';
import { SharedModule } from './shared/shared.module';

registerLocaleData(localeDeCh);

@NgModule({
  declarations: [AppComponent],
  imports: [
    AuthenticationModule.forAuthentication(environment.authenticationConfig),
    AuthorizationModule.forAuthorization(environment),
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: environment.authAllowedUrls ?? [],
        sendAccessToken: true,
      },
    }),
    UserModule.forRoot(environment),
    TenantModule.forRoot(environment),
    VotingLibModule.forRoot(environment.restApiEndpoint),
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: WebpackTranslateLoader,
      },
    }),
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: ENV_INJECTION_TOKEN,
      useValue: environment.env,
    },
    {
      provide: OAuthStorage,
      useClass: AuthStorageService,
    },
    {
      provide: CoreTranslateService,
      useClass: TranslateService,
    },
  ],
})
export class AppModule {}
