/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CountryServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/country_service_grpc_web_pb';
import { Country, CountryProto } from './models/country.model';
import { ListCountriesRequest } from '@abraxas/voting-basis-service-proto/grpc/requests/country_requests_pb';

@Injectable({
  providedIn: 'root',
})
export class CountryService extends GrpcService<CountryServicePromiseClient> {
  constructor(grpcBackend: GrpcBackendService) {
    super(CountryServicePromiseClient, environment, grpcBackend);
  }

  public list(): Promise<Country[]> {
    const req = new ListCountriesRequest();
    return this.request(
      c => c.list,
      req,
      r => r.getCountriesList().map(x => this.mapToCountry(x)),
    );
  }

  private mapToCountry(country: CountryProto): Country {
    return {
      isoId: country.getIsoId(),
      description: country.getDescription(),
    };
  }
}
