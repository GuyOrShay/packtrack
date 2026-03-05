import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MonthlyClientDeliveryCount } from '@packtrack/shared';
import { SupabaseService } from '../supabase/supabase.service';

interface DeliveryClientRow {
  client_id: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getMonthlyClientDeliveryCounts(year?: number, month?: number): Promise<MonthlyClientDeliveryCount[]> {
    const now = new Date();
    const reportYear = Number.isInteger(year) ? year! : now.getUTCFullYear();
    const reportMonth = Number.isInteger(month) ? month! : now.getUTCMonth() + 1;

    const startDate = new Date(Date.UTC(reportYear, reportMonth - 1, 1));
    const endDate = new Date(Date.UTC(reportYear, reportMonth, 1));

    const { data, error } = await this.supabaseService.client
      .from('deliveries')
      .select('client_id')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as DeliveryClientRow[]) {
      counts.set(row.client_id, (counts.get(row.client_id) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([client_id, total_deliveries]) => ({
      client_id,
      total_deliveries,
    }));
  }
}
