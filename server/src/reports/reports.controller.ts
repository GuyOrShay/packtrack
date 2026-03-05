import { Controller, Get, Query } from '@nestjs/common';
import { MonthlyClientDeliveryCount } from '@packtrack/shared';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  getMonthly(@Query('year') year?: string, @Query('month') month?: string): Promise<MonthlyClientDeliveryCount[]> {
    return this.reportsService.getMonthlyClientDeliveryCounts(
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    );
  }
}
