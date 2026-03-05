import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateDeliveryPayload,
  CreateDeliveryResponse,
  CreateMyDeliveryPayload,
  Delivery,
  MonthlyClientDeliveryCount,
  UpdateDeliveryStatusPayload,
} from '@packtrack/shared';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly baseUrl = `${environment.apiBaseUrl}`;

  constructor(private readonly http: HttpClient) {}

  createDelivery(payload: CreateDeliveryPayload): Observable<CreateDeliveryResponse> {
    return this.http.post<CreateDeliveryResponse>(`${this.baseUrl}/deliveries`, payload);
  }

  createMyDelivery(payload: CreateMyDeliveryPayload): Observable<CreateDeliveryResponse> {
    return this.http.post<CreateDeliveryResponse>(`${this.baseUrl}/deliveries/my`, payload);
  }

  updateDeliveryStatus(id: string, payload: UpdateDeliveryStatusPayload): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.baseUrl}/deliveries/${id}/status`, payload);
  }

  updateDeliveryStatusByTracking(trackingNumber: string, payload: UpdateDeliveryStatusPayload): Observable<Delivery> {
    return this.http.patch<Delivery>(`${this.baseUrl}/deliveries/tracking/${trackingNumber}/status`, payload);
  }

  getDeliveryByTracking(trackingNumber: string): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.baseUrl}/deliveries/tracking/${trackingNumber}`);
  }

  listDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries`);
  }

  listMyDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.baseUrl}/deliveries/my`);
  }

  getMonthlyReport(year?: number, month?: number): Observable<MonthlyClientDeliveryCount[]> {
    const queryParts: string[] = [];
    if (year) queryParts.push(`year=${year}`);
    if (month) queryParts.push(`month=${month}`);

    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return this.http.get<MonthlyClientDeliveryCount[]>(`${this.baseUrl}/reports/monthly${query}`);
  }
}
