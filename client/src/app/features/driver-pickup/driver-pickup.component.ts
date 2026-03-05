import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Delivery } from '@packtrack/shared';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { catchError, forkJoin, map, of } from 'rxjs';
import { DeliveryService } from '../../core/services/delivery.service';

interface PickupUpdateResult {
  ok: boolean;
  tracking: number;
  message?: string;
}

@Component({
  selector: 'app-driver-pickup',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './driver-pickup.component.html',
  styleUrl: './driver-pickup.component.css',
})
export class DriverPickupComponent implements OnDestroy {
  private readonly deliveryService = inject(DeliveryService);

  readonly isSecureContextWarning = signal(!window.isSecureContext);
  readonly scanning = signal(false);
  readonly loadingItem = signal(false);
  readonly updatingAll = signal(false);
  readonly statusMessage = signal('');
  readonly scannedDeliveries = signal<Delivery[]>([]);

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
        'driver-pickup-scanner',
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
      this.statusMessage.set('Scanner started. Scan packages continuously to build the pickup list.');
    } catch {
      this.scanning.set(false);
      this.scanner = null;
      this.statusMessage.set('Failed to start scanner. Please allow camera permission and retry.');
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

  markAllPickedUp(): void {
    const deliveries = this.scannedDeliveries();
    if (deliveries.length === 0 || this.updatingAll()) {
      return;
    }

    this.updatingAll.set(true);
    this.statusMessage.set('Updating statuses...');

    const requests = deliveries.map((delivery) =>
      this.deliveryService
        .updateDeliveryStatusByTracking(String(delivery.tracking_number), { status: 'picked_up' })
        .pipe(
          map(
            (): PickupUpdateResult => ({
              ok: true,
              tracking: delivery.tracking_number,
            }),
          ),
          catchError((err: { error?: { message?: string } }) =>
            of({
              ok: false,
              tracking: delivery.tracking_number,
              message: err?.error?.message ?? 'Update failed.',
            } satisfies PickupUpdateResult),
          ),
        ),
    );

    forkJoin(requests).subscribe({
      next: (results) => {
        const failedTrackings = new Set(results.filter((r) => !r.ok).map((r) => r.tracking));
        const failedCount = failedTrackings.size;
        const successCount = results.length - failedCount;

        if (failedCount > 0) {
          this.scannedDeliveries.set(deliveries.filter((d) => failedTrackings.has(d.tracking_number)));
          this.statusMessage.set(`Updated ${successCount} successfully. ${failedCount} failed and stayed in list.`);
        } else {
          this.scannedDeliveries.set([]);
          this.statusMessage.set(`All ${successCount} shipments marked as picked up.`);
        }

        this.updatingAll.set(false);
      },
      error: () => {
        this.statusMessage.set('Failed to update pickup list.');
        this.updatingAll.set(false);
      },
    });
  }

  clearList(): void {
    if (this.updatingAll()) {
      return;
    }
    this.scannedDeliveries.set([]);
    this.statusMessage.set('Pickup list cleared.');
  }

  removeItem(trackingNumber: number): void {
    if (this.updatingAll()) {
      return;
    }
    this.scannedDeliveries.set(this.scannedDeliveries().filter((d) => d.tracking_number !== trackingNumber));
  }

  ngOnDestroy(): void {
    if (this.scanner) {
      void this.scanner.clear();
      this.scanner = null;
    }
  }

  private handleDecoded(decodedText: string): void {
    const trackingRaw = decodedText.trim();
    if (!trackingRaw) {
      return;
    }

    const now = Date.now();
    if (trackingRaw === this.lastScan && now - this.lastScanTime < 1200) {
      return;
    }
    this.lastScan = trackingRaw;
    this.lastScanTime = now;

    const trackingNumber = Number(trackingRaw);
    if (!Number.isFinite(trackingNumber)) {
      this.statusMessage.set('Scanned barcode is not a valid tracking number.');
      return;
    }

    if (this.scannedDeliveries().some((item) => item.tracking_number === trackingNumber)) {
      this.statusMessage.set(`Tracking #${trackingNumber} already in list.`);
      return;
    }

    this.loadingItem.set(true);
    this.statusMessage.set(`Loading tracking #${trackingNumber}...`);

    this.deliveryService.getDeliveryByTracking(String(trackingNumber)).subscribe({
      next: (delivery) => {
        this.scannedDeliveries.set([delivery, ...this.scannedDeliveries()]);
        this.loadingItem.set(false);
        this.statusMessage.set(`Added tracking #${trackingNumber} to pickup list.`);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loadingItem.set(false);
        this.statusMessage.set(err?.error?.message ?? `Tracking #${trackingNumber} was not found.`);
      },
    });
  }
}
