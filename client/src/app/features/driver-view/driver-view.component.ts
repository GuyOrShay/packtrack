import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-driver-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-view.component.html',
  styleUrl: './driver-view.component.css',
})
export class DriverViewComponent implements OnDestroy {
  private readonly deliveryService = inject(DeliveryService);
  private readonly ngZone = inject(NgZone);

  readonly statusMessage = signal('');
  readonly isSecureContextWarning = signal(!window.isSecureContext);
  readonly scanning = signal(false);

  private scanner: Html5QrcodeScanner | null = null;
  private lastScan = '';
  private lastScanTime = 0;

  async startScan(): Promise<void> {
    this.statusMessage.set('');

    if (this.scanning()) {
      return;
    }

    if (!window.isSecureContext) {
      this.statusMessage.set('Camera is blocked on insecure origin. Use HTTPS or localhost.');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.statusMessage.set('Camera API is not available in this browser.');
      return;
    }

    this.scanning.set(true);

    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      this.scanner = new Html5QrcodeScanner(
        'driver-scanner',
        {
          fps: 12,
          qrbox: { width: 320, height: 130 },
          aspectRatio: 1.777,
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: true,
        },
        false,
      );

      this.scanner.render(
        (decodedText) => this.handleDecoded(decodedText),
        () => {
          // ignore live decode errors
        },
      );

      this.statusMessage.set('Scanner started. Select camera and point to barcode.');
    } catch {
      this.statusMessage.set('Failed to start scanner. Please allow camera permission and retry.');
      this.scanning.set(false);
      this.scanner = null;
    }
  }

  stopScan(): void {
    if (this.scanner) {
      void this.scanner.clear();
      this.scanner = null;
    }
    this.scanning.set(false);
    this.statusMessage.set('Scanner stopped.');
  }

  ngOnDestroy(): void {
    if (this.scanner) {
      void this.scanner.clear();
      this.scanner = null;
    }
  }

  private handleDecoded(decodedText: string): void {
    const trackingId = decodedText.trim();
    if (!trackingId) {
      return;
    }

    const now = Date.now();
    if (trackingId === this.lastScan && now - this.lastScanTime < 2500) {
      return;
    }
    this.lastScan = trackingId;
    this.lastScanTime = now;

    this.ngZone.run(() => {
      this.statusMessage.set(`Updating delivery ${trackingId}...`);
    });

    this.deliveryService.updateDeliveryStatusByTracking(trackingId, { status: 'delivered' }).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.statusMessage.set(`Delivery ${trackingId} marked as delivered.`);
        });
      },
      error: (err: { error?: { message?: string } }) => {
        this.ngZone.run(() => {
          this.statusMessage.set(err?.error?.message ?? `Failed to update delivery ${trackingId}.`);
        });
      },
    });
  }
}