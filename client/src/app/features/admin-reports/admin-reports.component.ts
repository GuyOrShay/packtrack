import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MonthlyClientDeliveryCount } from '@packtrack/shared';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.component.html',
  styleUrl: './admin-reports.component.css',
})
export class AdminReportsComponent implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  readonly rows = signal<MonthlyClientDeliveryCount[]>([]);

  ngOnInit(): void {
    this.deliveryService.getMonthlyReport().subscribe((report) => this.rows.set(report));
  }
}