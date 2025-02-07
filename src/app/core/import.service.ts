/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { ImportServicePromiseClient } from '@abraxas/voting-basis-service-proto/grpc/import_service_grpc_web_pb';
import {
  ImportContestRequest,
  ImportMajorityElectionCandidatesRequest,
  ImportPoliticalBusinessesRequest,
  ImportProportionalElectionListsAndCandidatesRequest,
} from '@abraxas/voting-basis-service-proto/grpc/requests/import_requests_pb';
import { GrpcBackendService, GrpcService } from '@abraxas/voting-lib';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import {
  ContestImport,
  ImportFileContent,
  ImportType,
  ProportionalElectionListImport,
  ResolveImportFileRequest,
} from './models/import.model';
import { MajorityElectionCandidateProto } from './models/majority-election.model';
import { ProportionalElectionListUnionProto } from './models/proportional-election.model';
import { MultipartFormDataHttpService } from './http/multipart-form-data-http.service';

@Injectable({
  providedIn: 'root',
})
export class ImportService extends GrpcService<ImportServicePromiseClient> {
  private readonly restApiUrl: string = '';

  constructor(
    grpcBackend: GrpcBackendService,
    private readonly http: MultipartFormDataHttpService,
  ) {
    super(ImportServicePromiseClient, environment, grpcBackend);
    this.restApiUrl = `${environment.restApiEndpoint}/imports`;
  }

  public async resolveImportFiles(importType: ImportType, files: FileList): Promise<ImportFileContent[]> {
    const resolvedFiles: ImportFileContent[] = [];

    // cannot us for-of with FileList here
    for (let i = 0; i < files.length; i++) {
      const resolvedFile = await this.resolveImportFile(importType, files[i]);
      resolvedFiles.push(resolvedFile);
    }

    return resolvedFiles;
  }

  private async resolveImportFile(importType: ImportType, file: File): Promise<ImportFileContent> {
    const response = await this.http.postWithArrayBufferResponse<ResolveImportFileRequest>(this.restApiUrl, { importType }, file);
    return {
      importType,
      fileName: file.name,
      contest: ContestImport.deserializeBinary(response),
    };
  }

  public async importContest(contestImport: ContestImport): Promise<void> {
    const req = new ImportContestRequest();
    req.setContest(contestImport);

    await this.request(
      c => c.importContest,
      req,
      r => r.toObject(),
    );
  }

  public async importPoliticalBusinesses(contestId: string, contestImport: ContestImport): Promise<void> {
    const votes = contestImport.getVotesList();
    const majorityElections = contestImport.getMajorityElectionsList();
    const proportionalElections = contestImport.getProportionalElectionsList();

    const req = new ImportPoliticalBusinessesRequest();
    req.setContestId(contestId);
    req.setVotesList(votes);
    req.setMajorityElectionsList(majorityElections);
    req.setProportionalElectionsList(proportionalElections);

    await this.request(
      c => c.importPoliticalBusinesses,
      req,
      r => r.toObject(),
    );
  }

  public async importMajorityElectionCandidates(
    majorityElectionId: string,
    majorityElectionCandidates: MajorityElectionCandidateProto[],
  ): Promise<void> {
    const req = new ImportMajorityElectionCandidatesRequest();
    req.setMajorityElectionId(majorityElectionId);
    req.setCandidatesList(majorityElectionCandidates);

    await this.request(
      c => c.importMajorityElectionCandidates,
      req,
      r => r.toObject(),
    );
  }

  public async importProportionalElectionListsAndCandidates(
    proportionalElectionId: string,
    proportionalElectionLists: ProportionalElectionListImport[],
    proportionalElectionListUnions: ProportionalElectionListUnionProto[],
  ): Promise<void> {
    const req = new ImportProportionalElectionListsAndCandidatesRequest();
    req.setProportionalElectionId(proportionalElectionId);
    req.setListsList(proportionalElectionLists);
    req.setListUnionsList(proportionalElectionListUnions);

    await this.request(
      c => c.importProportionalElectionListsAndCandidates,
      req,
      r => r.toObject(),
    );
  }
}
