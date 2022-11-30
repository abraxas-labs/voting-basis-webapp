/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import {
  DomainOfInfluence,
  DomainOfInfluences,
} from '@abraxas/voting-basis-service-proto/grpc/models/domain_of_influence_pb';
import {
  DomainOfInfluenceCanton,
  DomainOfInfluenceType,
} from '@abraxas/voting-basis-service-proto/grpc/shared/domain_of_influence_pb';
import { mock } from './defaults';

const sgNeudorf = new DomainOfInfluence();
sgNeudorf.setName('St. Gallen Neudorf');
sgNeudorf.setShortName('SG-ND');
sgNeudorf.setAuthorityName('Staatskanzlei St. Gallen');
sgNeudorf.setSecureConnectId('1234');
sgNeudorf.setId('1');
sgNeudorf.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SK);
sgNeudorf.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_SG);

const sgStFiden = new DomainOfInfluence();
sgStFiden.setName('St. Gallen St. Fiden');
sgStFiden.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_SK);
sgStFiden.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const citySg = new DomainOfInfluence();
citySg.setName('St. Gallen');
citySg.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_MU);
citySg.setChildrenList([sgNeudorf, sgStFiden]);
citySg.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const ktSg = new DomainOfInfluence();
ktSg.setName('Kanton St. Gallen');
ktSg.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_CT);
ktSg.setChildrenList([citySg]);
ktSg.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const ktTg = new DomainOfInfluence();
ktTg.setName('Kanton Thurgau');
ktTg.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_CT);
ktTg.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const bund = new DomainOfInfluence();
bund.setName('Bund');
bund.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_CH);
bund.setChildrenList([ktSg, ktTg]);
bund.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const kircheSg = new DomainOfInfluence();
kircheSg.setName('Kirchgemeinde St. Gallen');
kircheSg.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_KI);
kircheSg.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const kircheGo = new DomainOfInfluence();
kircheGo.setName('Kirchgemeinde Gossau');
kircheGo.setType(DomainOfInfluenceType.DOMAIN_OF_INFLUENCE_TYPE_KI);
kircheGo.setCanton(DomainOfInfluenceCanton.DOMAIN_OF_INFLUENCE_CANTON_UNSPECIFIED);

const listDomainOfInfluenceResponse = new DomainOfInfluences();
listDomainOfInfluenceResponse.setDomainOfInfluencesList([bund, kircheSg, kircheGo]);

export const domainOfInfluencesMock = {
  list: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/List$/, listDomainOfInfluenceResponse),
  listTree: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/ListTree$/, listDomainOfInfluenceResponse),
  get: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/Get$/, sgNeudorf),
  create: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/Create$/, sgNeudorf),
  update: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/Update$/, sgNeudorf),
  updateCountingCircles: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/UpdateCountingCircles$/),
  delete: mock(/\/abraxas\.voting\.basis\.v1\.DomainOfInfluenceService\/Delete$/),
};
