/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MultipartFormDataHttpService {
  constructor(private readonly http: HttpClient) {}

  public async postWithArrayBufferResponse<TData>(url: string, data: TData, file?: File): Promise<Uint8Array> {
    const response = await firstValueFrom(this.http.post(url, this.buildFormData(data, file), { responseType: 'arraybuffer' }));
    return new Uint8Array(response);
  }

  private buildFormData(data: any, file?: File): FormData {
    const formData = new FormData();

    formData.append('data', JSON.stringify(data));

    if (!!file) {
      formData.append('file', file);
    }

    return formData;
  }
}
