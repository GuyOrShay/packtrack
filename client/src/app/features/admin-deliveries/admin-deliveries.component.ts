import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Delivery } from '@packtrack/shared';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-admin-deliveries',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-deliveries.component.html',
  styleUrl: './admin-deliveries.component.css',
})
export class AdminDeliveriesComponent implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  readonly deliveries = signal<Delivery[]>([]);

  ngOnInit(): void {
    this.deliveryService.listDeliveries().subscribe((rows) => this.deliveries.set(rows));
  }
}