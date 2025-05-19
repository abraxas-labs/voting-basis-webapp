/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Country as CountryProto } from '@abraxas/voting-basis-service-proto/grpc/models/country_pb';

export { CountryProto };
export type Country = CountryProto.AsObject;
