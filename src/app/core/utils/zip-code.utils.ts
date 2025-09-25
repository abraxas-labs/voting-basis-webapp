/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

const swissCountry = 'CH';

export function isValidZipCode(zipCode: string, country: string): boolean {
  if (!zipCode) {
    // We allow empty zip codes
    return true;
  }

  if (country !== swissCountry) {
    return true;
  }

  const zipCodeValue = Number(zipCode);
  if (!Number.isInteger(zipCodeValue)) {
    return false;
  }

  return zipCodeValue >= 1000 && zipCodeValue <= 9999;
}
