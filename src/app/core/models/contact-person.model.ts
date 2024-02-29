/**
 * (c) Copyright 2024 by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ContactPerson as ContactPersonProto } from '@abraxas/voting-basis-service-proto/grpc/models/contact_person_pb';

export { ContactPersonProto };

export type ContactPerson = ContactPersonProto.AsObject;

export function newContactPerson(): ContactPerson {
  return {
    email: '',
    familyName: '',
    firstName: '',
    mobilePhone: '',
    phone: '',
  };
}
