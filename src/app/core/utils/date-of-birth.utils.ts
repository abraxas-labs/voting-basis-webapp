/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

const minDateOfBirthYear = 1900;

export function isValidDateOfBirth(dateOfBirth?: Date): boolean {
  if (!dateOfBirth) {
    return false;
  }

  const dateOfBirthYear = dateOfBirth.getFullYear();
  return dateOfBirthYear > minDateOfBirthYear && dateOfBirthYear <= new Date().getFullYear();
}
