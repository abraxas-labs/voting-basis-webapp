/**
 * (c) Copyright by Abraxas Informatik AG
 *
 * For license information see LICENSE file.
 */

import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CertificateChain } from '../../core/models/certificate.model';
import { SnackbarService } from '@abraxas/voting-lib';
import { TranslateService } from '../../core/translate.service';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss',
  standalone: false,
})
export class CertificatesComponent {
  private readonly snackbarService = inject(SnackbarService);
  private readonly i18n = inject(TranslateService);

  @Input()
  public certificateChain?: CertificateChain;

  @Output()
  public certificateChainChanged: EventEmitter<CertificateChain> = new EventEmitter<CertificateChain>();

  @Output()
  public importClick: EventEmitter<void> = new EventEmitter();

  @Input()
  public disabled: boolean = false;

  protected async copy(data: string): Promise<void> {
    await navigator.clipboard.writeText(data);
    this.snackbarService.success(this.i18n.instant('CERTIFICATE.COPIED'));
  }
}
