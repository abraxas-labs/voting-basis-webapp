/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { CertificateChain as CertificateChainProto } from '@abraxas/voting-basis-service-proto/grpc/models/certificate_pb';
import { User } from './user.model';

export interface CertificateChain {
  infos: CertificateInfo[];
  importedBy: User.AsObject;
  importedAt: Date;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  thumbprint: string;
  notBefore: Date;
  notAfter: Date;
  caThumbprint: string;
}

export function mapToCertificateChain(proto: CertificateChainProto): CertificateChain {
  const infos: CertificateInfo[] = proto.getInfosList().map(l => ({
    ...l.toObject(),
    notBefore: l.getNotBefore()!.toDate(),
    notAfter: l.getNotAfter()!.toDate(),
  }));

  return {
    infos,
    importedBy: proto.getImportedBy()!.toObject(),
    importedAt: proto.getImportedAt()!.toDate(),
  };
}
