import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateDeliveryResponse, Delivery, DeliveryStatus } from '@packtrack/shared';
import JsBarcode from 'jsbarcode';
import { PDFDocument } from 'pdf-lib';
import { DeliveryService } from '../../core/services/delivery.service';

@Component({
  selector: 'app-client-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-view.component.html',
  styleUrl: './client-view.component.css',
})
export class ClientViewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly deliveryService = inject(DeliveryService);

  readonly deliveries = signal<Delivery[]>([]);
  readonly isLoading = signal(true);
  readonly popupOpen = signal(false);
  readonly submitResult = signal<CreateDeliveryResponse | null>(null);
  readonly error = signal('');
  readonly selectedIds = signal<Set<string>>(new Set<string>());
  readonly statusFilter = signal<'all' | DeliveryStatus>('all');

  readonly filteredDeliveries = computed(() => {
    const filter = this.statusFilter();
    const rows = this.deliveries();
    if (filter === 'all') {
      return rows;
    }
    return rows.filter((row) => row.status === filter);
  });

  readonly selectedCount = computed(() => this.selectedIds().size);
  readonly allSelected = computed(() => {
    const rows = this.filteredDeliveries();
    if (rows.length === 0) {
      return false;
    }
    return rows.every((row) => this.selectedIds().has(row.id));
  });

  readonly form = this.fb.nonNullable.group({
    recipient_name: ['', [Validators.required]],
    recipient_address: ['', [Validators.required]],
    recipient_phone: ['', [Validators.required]],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadDeliveries();
  }

  openPopup(): void {
    this.error.set('');
    this.popupOpen.set(true);
  }

  closePopup(): void {
    this.popupOpen.set(false);
  }

  toggleSelectAll(checked: boolean): void {
    if (!checked) {
      this.selectedIds.set(new Set<string>());
      return;
    }

    const ids = this.filteredDeliveries().map((delivery) => delivery.id);
    this.selectedIds.set(new Set<string>(ids));
  }

  setStatusFilter(value: string): void {
    if (value === 'pending' || value === 'picked_up' || value === 'delivered') {
      this.statusFilter.set(value);
      return;
    }
    this.statusFilter.set('all');
  }

  toggleDelivery(id: string, checked: boolean): void {
    const next = new Set<string>(this.selectedIds());
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.selectedIds.set(next);
  }

  async generateLabelsPdf(): Promise<void> {
    const chosen = this.deliveries().filter((delivery) => this.selectedIds().has(delivery.id));
    if (chosen.length === 0) {
      this.error.set('Select at least one delivery for label generation.');
      return;
    }

    const mmToPt = (mm: number): number => mm * 2.834645669;
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const marginMm = 8;
    const colGapMm = 6;
    const rowGapMm = 6;
    const cols = 2;
    const rows = 4;
    const labelsPerPage = cols * rows;
    const slotWidthMm = (pageWidthMm - marginMm * 2 - colGapMm * (cols - 1)) / cols;
    const slotHeightMm = (pageHeightMm - marginMm * 2 - rowGapMm * (rows - 1)) / rows;

    const pageWidthPt = mmToPt(pageWidthMm);
    const pageHeightPt = mmToPt(pageHeightMm);

    const pdf = await PDFDocument.create();

    for (let i = 0; i < chosen.length; i += 1) {
      if (i % labelsPerPage === 0) {
        pdf.addPage([pageWidthPt, pageHeightPt]);
      }

      const page = pdf.getPages()[Math.floor(i / labelsPerPage)];
      const delivery = chosen[i];
      const indexOnPage = i % labelsPerPage;
      const row = Math.floor(indexOnPage / cols);
      const col = indexOnPage % cols;

      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = Math.round(slotWidthMm * 10);
      labelCanvas.height = Math.round(slotHeightMm * 10);
      const ctx = labelCanvas.getContext('2d');
      if (!ctx) {
        this.error.set('Failed to generate label canvas.');
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, labelCanvas.width - 4, labelCanvas.height - 4);

      const padX = Math.round(labelCanvas.width * 0.06);
      const trackingY = Math.round(labelCanvas.height * 0.12);
      const nameY = Math.round(labelCanvas.height * 0.24);
      const addressY = Math.round(labelCanvas.height * 0.36);
      const phoneY = Math.round(labelCanvas.height * 0.56);
      const barcodeY = Math.round(labelCanvas.height * 0.66);

      ctx.fillStyle = '#111827';
      ctx.font = `bold ${Math.max(18, Math.round(labelCanvas.width * 0.055))}px Arial, sans-serif`;
      ctx.fillText(`Tracking #${delivery.tracking_number}`, padX, trackingY);

      ctx.font = `${Math.max(14, Math.round(labelCanvas.width * 0.04))}px Arial, sans-serif`;
      ctx.fillText(delivery.recipient_name, padX, nameY);

      ctx.font = `${Math.max(12, Math.round(labelCanvas.width * 0.032))}px Arial, sans-serif`;
      this.drawWrappedText(
        ctx,
        delivery.recipient_address,
        padX,
        addressY,
        labelCanvas.width - padX * 2,
        Math.max(14, Math.round(labelCanvas.height * 0.07)),
      );

      ctx.font = `${Math.max(12, Math.round(labelCanvas.width * 0.033))}px Arial, sans-serif`;
      ctx.fillText(`Phone: ${delivery.recipient_phone}`, padX, phoneY);

      const barcodeCanvas = document.createElement('canvas');
      const barcodeTargetWidth = labelCanvas.width - padX * 2;
      let barWidth = 4;
      const barcodeText = String(delivery.tracking_number);
      while (barWidth >= 1) {
        JsBarcode(barcodeCanvas, barcodeText, {
          format: 'CODE128',
          displayValue: true,
          width: barWidth,
          height: Math.max(70, Math.round(labelCanvas.height * 0.18)),
          margin: 0,
          fontSize: Math.max(16, Math.round(labelCanvas.height * 0.04)),
          lineColor: '#000000',
          background: '#ffffff',
        });
        if (barcodeCanvas.width <= barcodeTargetWidth) {
          break;
        }
        barWidth -= 0.5;
      }

      const barcodeX = padX + Math.floor((barcodeTargetWidth - barcodeCanvas.width) / 2);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(barcodeCanvas, barcodeX, barcodeY);
      ctx.imageSmoothingEnabled = true;

      const labelImage = labelCanvas.toDataURL('image/png');
      const pngBytes = await fetch(labelImage).then(async (res) => new Uint8Array(await res.arrayBuffer()));
      const png = await pdf.embedPng(pngBytes);

      const xMm = marginMm + col * (slotWidthMm + colGapMm);
      const yTopMm = marginMm + row * (slotHeightMm + rowGapMm);
      const xPt = mmToPt(xMm);
      const yPt = pageHeightPt - mmToPt(yTopMm + slotHeightMm);

      page.drawImage(png, {
        x: xPt,
        y: yPt,
        width: mmToPt(slotWidthMm),
        height: mmToPt(slotHeightMm),
      });
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const bytes = await pdf.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `packtrack-labels-${timestamp}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    startY: number,
    maxWidth: number,
    lineHeight: number,
  ): void {
    const words = text.split(' ');
    let line = '';
    let y = startY;

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
      } else {
        ctx.fillText(line, x, y);
        line = word;
        y += lineHeight;
      }
    }

    if (line) {
      ctx.fillText(line, x, y);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');

    this.deliveryService.createMyDelivery(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.submitResult.set(response);
        this.form.patchValue({
          recipient_name: '',
          recipient_address: '',
          recipient_phone: '',
          notes: '',
        });
        this.popupOpen.set(false);
        this.loadDeliveries();
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to create delivery.');
      },
    });
  }

  private loadDeliveries(): void {
    this.isLoading.set(true);
    this.deliveryService.listMyDeliveries().subscribe({
      next: (rows) => {
        this.deliveries.set(rows);
        this.selectedIds.set(new Set<string>());
        this.isLoading.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Failed to load deliveries.');
        this.isLoading.set(false);
      },
    });
  }
}
