/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Role } from 'testcafe';
import { environment } from '../environment';
import { LoginPage } from '../page-models';

async function login(t: TestController, username: string, password: string, otpSecret: string): Promise<any> {
  await t
    .typeText(LoginPage.usernameInput, username)
    .click(LoginPage.nextButton)
    .typeText(LoginPage.passwordInput, password)
    .click(LoginPage.loginButton);

  if (await LoginPage.otpInput.exists) {
    await t
      .wait(LoginPage.otpWait)
      .typeText(LoginPage.otpInput, LoginPage.getOtpToken(otpSecret))
      .click(LoginPage.verifyButton);
  }

  return t.wait(1000);
}

export const electionAdmin = Role(environment.appUrl, t =>
  login(t, 'angulare2e', '<password>', '<otp-secret>'),
);

export const admin = Role(environment.appUrl, t =>
  login(t, 'angulare2e-admin', '<password>', '<otp-secret>'),
);
