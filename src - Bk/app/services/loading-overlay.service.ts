import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { LoadingOverlayPortalComponent } from './loading-overlay.portal';

@Injectable({ providedIn: 'root' })
export class LoadingOverlayService {
  private overlayRef?: OverlayRef;

  constructor(private overlay: Overlay) {}

  show(patient?: any) {
    if (this.overlayRef) return;

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    const portal = new ComponentPortal(LoadingOverlayPortalComponent);

    const componentRef = this.overlayRef.attach(portal);

    componentRef.instance.patient = patient;
  }

  hide() {
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
  }
}
