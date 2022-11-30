/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { authenticator } from 'otplib';
import { Selector } from 'testcafe';

export abstract class LoginPage {
  public static readonly usernameInput: Selector = Selector('input[name="user"]');
  public static readonly passwordInput: Selector = Selector('input[name="password"]');
  public static readonly otpInput: Selector = Selector('input[name="secondFactorCode"]');

  public static readonly nextButton: Selector = Selector('button').withAttribute('type', 'submit');
  public static readonly loginButton: Selector = Selector('button').withAttribute('type', 'submit');
  public static readonly verifyButton: Selector = Selector('button').withAttribute('type', 'submit');

  public static get otpWait(): number {
    if (authenticator.timeRemaining() <= 3) {
      // in 3 seconds, the token will change, so we wait 5 seconds.
      return 5000;
    }
    return 0;
  }

  public static getOtpToken(secret: string): string {
    return authenticator.generate(secret);
  }
}
