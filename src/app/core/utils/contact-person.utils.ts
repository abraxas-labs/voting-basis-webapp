/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ContactPerson, ContactPersonProto } from '../models/contact-person.model';

export function mapToProtoContactPerson(data?: ContactPerson): ContactPersonProto {
  const result = new ContactPersonProto();
  if (!data) {
    return result;
  }

  result.setFirstName(data.firstName);
  result.setFamilyName(data.familyName);
  result.setPhone(data.phone);
  result.setMobilePhone(data.mobilePhone);
  result.setEmail(data.email);
  return result;
}
