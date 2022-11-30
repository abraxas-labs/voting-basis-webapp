/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type CursorType = 'wait';

@Injectable({
  providedIn: 'root',
})
export class CursorService {
  private readonly cursorSubject: Subject<CursorType | undefined> = new BehaviorSubject<CursorType | undefined>(undefined);

  public get cursor$(): Observable<CursorType | undefined> {
    return this.cursorSubject;
  }

  public async loadingWhile<T>(p: Promise<T>): Promise<T> {
    this.cursorSubject.next('wait');
    try {
      return await p;
    } finally {
      this.cursorSubject.next(undefined);
    }
  }
}
