import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  CreateDeliveryPayload,
  CreateDeliveryResponse,
  Delivery,
  UpdateDeliveryStatusPayload,
} from '@packtrack/shared';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class DeliveriesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(payload: CreateDeliveryPayload): Promise<CreateDeliveryResponse> {
    const { data, error } = await this.supabaseService.client
      .from('deliveries')
      .insert({
        client_id: payload.client_id,
        recipient_name: payload.recipient_name,
        recipient_address: payload.recipient_address,
        recipient_phone: payload.recipient_phone,
        status: 'pending',
        notes: payload.notes ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(error?.message ?? 'Failed to create delivery.');
    }

    return {
      trackingNumber: data.tracking_number,
      delivery: data as Delivery,
    };
  }

  async updateStatus(id: string, payload: UpdateDeliveryStatusPayload): Promise<Delivery> {
    return this.updateWhere('id', id, payload);
  }

  async updateStatusByTrackingNumber(
    trackingNumber: number,
    payload: UpdateDeliveryStatusPayload,
  ): Promise<Delivery> {
    return this.updateWhere('tracking_number', trackingNumber, payload);
  }

  private async updateWhere(
    key: 'id' | 'tracking_number',
    value: string | number,
    payload: UpdateDeliveryStatusPayload,
  ): Promise<Delivery> {
    const updatePayload: Record<string, string> = {
      status: payload.status,
    };

    if (payload.status === 'picked_up') {
      updatePayload.picked_up_at = new Date().toISOString();
    }

    if (payload.status === 'delivered') {
      updatePayload.delivered_at = new Date().toISOString();
    }

    const { data, error } = await this.supabaseService.client
      .from('deliveries')
      .update(updatePayload)
      .eq(key, value)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Delivery not found for ${key}: ${value}.`);
      }

      throw new InternalServerErrorException(error.message);
    }

    return data as Delivery;
  }

  async list(): Promise<Delivery[]> {
    const { data, error } = await this.supabaseService.client
      .from('deliveries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as Delivery[];
  }
}
