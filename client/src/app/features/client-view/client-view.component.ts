import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxBarcode6 } from 'ngx-barcode6';
import { CreateDeliveryResponse } from '@packtrack/shared';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-client-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxBarcode6],
  templateUrl: './client-view.component.html',
  styleUrl: './client-view.component.css',
})
export class ClientViewComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly deliveryService = inject(DeliveryService);

  readonly submitResult = signal<CreateDeliveryResponse | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    client_id: ['', [Validators.required]],
    recipient_name: ['', [Validators.required]],
    recipient_address: ['', [Validators.required]],
    recipient_phone: ['', [Validators.required]],
    notes: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.deliveryService.createDelivery(this.form.getRawValue()).subscribe((response) => {
      this.submitResult.set(response);
    });
  }
}