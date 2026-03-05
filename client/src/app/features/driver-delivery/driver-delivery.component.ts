import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Delivery } from '@packtrack/shared';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-driver-delivery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-delivery.component.html',
  styleUrl: './driver-delivery.component.css',
})
export class DriverDeliveryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);

  readonly loading = signal(true);
  readonly updating = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly delivery = signal<Delivery | null>(null);

  private trackingNumber = '';

  ngOnInit(): void {
    this.trackingNumber = this.route.snapshot.paramMap.get('trackingNumber') ?? '';
    if (!this.trackingNumber) {
      this.errorMessage.set('Missing tracking number.');
      this.loading.set(false);
      return;
    }
    this.loadDelivery();
  }

  markDelivered(): void {
    this.updateStatus('delivered');
  }

  markPickedUp(): void {
    this.updateStatus('picked_up');
  }

  backToScanner(): void {
    void this.router.navigate(['/driver']);
  }

  private loadDelivery(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.deliveryService.getDeliveryByTracking(this.trackingNumber).subscribe({
      next: (delivery) => {
        this.delivery.set(delivery);
        this.loading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to load delivery details.');
        this.loading.set(false);
      },
    });
  }

  private updateStatus(status: 'picked_up' | 'delivered'): void {
    const current = this.delivery();
    if (!current || this.updating()) {
      return;
    }

    this.updating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.deliveryService.updateDeliveryStatusByTracking(String(current.tracking_number), { status }).subscribe({
      next: (updated) => {
        this.delivery.set(updated);
        this.successMessage.set(status === 'delivered' ? 'Shipment marked as delivered.' : 'Shipment marked as picked up.');
        this.updating.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage.set(err?.error?.message ?? 'Failed to update shipment status.');
        this.updating.set(false);
      },
    });
  }
}
