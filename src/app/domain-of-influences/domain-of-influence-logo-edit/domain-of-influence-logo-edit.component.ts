/*!
 * (c) Copyright 2022 by Abraxas Informatik AG
 * For license information see LICENSE file
 */

import { SnackbarService } from '@abraxas/voting-lib';
import { Component, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { DomainOfInfluence } from '../../core/models/domain-of-influence.model';

@Component({
  selector: 'app-domain-of-influence-logo-edit',
  templateUrl: './domain-of-influence-logo-edit.component.html',
  styleUrls: ['./domain-of-influence-logo-edit.component.scss'],
})
export class DomainOfInfluenceLogoEditComponent implements OnDestroy {
  @Input()
  public disabled: boolean = false;

  @Input()
  public domainOfInfluence!: DomainOfInfluence;

  @Output()
  public logoChanged: EventEmitter<File> = new EventEmitter<File>();

  public allowedContentTypes: string[] = ['image/png', 'image/svg+xml'];
  public allowedContentTypesCommaSeparated: string = this.allowedContentTypes.join(',');

  public draggingLogo: boolean = false;
  public uploadedLogoPreviewSrc?: SafeUrl;
  private uploadedLogoPreviewUrl?: string;

  private readonly maxSizeInBytes: number = 3000000; // 3MB

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly snackbarService: SnackbarService,
    private readonly i18n: TranslateService,
  ) {}

  public ngOnDestroy(): void {
    this.disposeUploadedLogoPreviewSrcIfNeeded();
  }

  public setLogo(files: FileList): void {
    if (files.length !== 1) {
      return;
    }

    const file = files[0];
    if (!this.allowedContentTypes.includes(file.type)) {
      this.snackbarService.error(this.i18n.instant('DOMAIN_OF_INFLUENCE.STIMMUNTERLAGEN.LOGO.ERRORS.NON_ALLOWED_TYPE'));
      return;
    }

    if (file.size > this.maxSizeInBytes) {
      this.snackbarService.error(this.i18n.instant('DOMAIN_OF_INFLUENCE.STIMMUNTERLAGEN.LOGO.ERRORS.SIZE_LIMIT'));
      return;
    }

    const reader = new FileReader();
    reader.onload = result => {
      if (!result.target?.result) {
        return;
      }

      this.disposeUploadedLogoPreviewSrcIfNeeded();
      this.uploadedLogoPreviewUrl = URL.createObjectURL(new Blob([result.target.result], { type: file.type }));
      // By default, Angular does not allow using URL values in templates. But since we need to pass an URL to the img tag,
      // we are forced to bypass this Angular security mechanism. This is still secure, since we are sure that uploadedLogoPreviewUrl
      // is an URL. Since the URL is used as the source for an img tag, the image content cannot be used for an XSS attack,
      // since browsers do not allow script execution inside img tags.
      this.uploadedLogoPreviewSrc = this.sanitizer.bypassSecurityTrustUrl(this.uploadedLogoPreviewUrl);
      this.logoChanged.emit(file);
      this.domainOfInfluence.hasLogo = true;
    };
    reader.readAsArrayBuffer(files[0]);
  }

  public removeLogo(): void {
    this.domainOfInfluence.hasLogo = false;
    this.logoChanged.emit();
  }

  @HostListener('window:drop', ['$event'])
  public async onDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    this.draggingLogo = false;

    if (!e.dataTransfer) {
      return;
    }

    this.setLogo(e.dataTransfer.files);
  }

  @HostListener('window:dragover', ['$event'])
  public onDragOver(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggingLogo = true;
  }

  @HostListener('window:dragleave', ['$event'])
  public onDragLeave(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.draggingLogo = false;
  }

  private disposeUploadedLogoPreviewSrcIfNeeded(): void {
    if (this.uploadedLogoPreviewUrl === undefined) {
      return;
    }

    URL.revokeObjectURL(this.uploadedLogoPreviewUrl);
    delete this.uploadedLogoPreviewUrl;
    delete this.uploadedLogoPreviewSrc;
  }
}
