import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MonthlyClientDeliveryCount } from '@packtrack/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getMonthly(@Query('year') year?: string, @Query('month') month?: string): Promise<MonthlyClientDeliveryCount[]> {
    return this.reportsService.getMonthlyClientDeliveryCounts(
      year ? Number(year) : undefined,
      month ? Number(month) : undefined,
    );
  }
}