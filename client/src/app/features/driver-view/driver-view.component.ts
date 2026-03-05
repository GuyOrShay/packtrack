import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, signal } from '@angular/core';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-driver-view',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './driver-view.component.html',
  styleUrl: './driver-view.component.css',
})
export class DriverViewComponent {
  readonly scanning = signal(false);
  readonly statusMessage = signal('');

  constructor(private readonly deliveryService: DeliveryService) {}

  startScan(): void {
    this.scanning.set(true);
    this.statusMessage.set('Point the camera at a barcode/QR code.');
  }

  onScanSuccess(scanEvent: string | Event): void {
    const trackingId =
      typeof scanEvent === 'string'
        ? scanEvent
        : (scanEvent as CustomEvent<string>).detail ?? '';

    if (!trackingId) {
      this.statusMessage.set('No tracking number found in scan result.');
      return;
    }

    this.deliveryService.updateDeliveryStatusByTracking(trackingId, { status: 'delivered' }).subscribe({
      next: () => {
        this.statusMessage.set(`Delivery ${trackingId} marked as delivered.`);
        this.scanning.set(false);
      },
      error: () => {
        this.statusMessage.set(`Failed to update delivery ${trackingId}.`);
      },
    });
  }
}
