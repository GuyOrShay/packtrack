import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Delivery, MonthlyClientDeliveryCount } from '@packtrack/shared';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-admin-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-view.component.html',
  styleUrl: './admin-view.component.css',
})
export class AdminViewComponent implements OnInit {
  readonly deliveries = signal<Delivery[]>([]);
  readonly reportRows = signal<MonthlyClientDeliveryCount[]>([]);

  constructor(private readonly deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.deliveryService.listDeliveries().subscribe((rows) => this.deliveries.set(rows));
    this.deliveryService.getMonthlyReport().subscribe((rows) => this.reportRows.set(rows));
  }
}
