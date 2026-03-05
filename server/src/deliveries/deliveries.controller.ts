import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateDeliveryResponse, Delivery } from '@packtrack/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { DeliveriesService } from './deliveries.service';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'admin')
  create(@Body() payload: CreateDeliveryDto): Promise<CreateDeliveryResponse> {
    return this.deliveriesService.create(payload);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver', 'admin')
  updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.deliveriesService.updateStatus(id, payload);
  }

  @Patch('tracking/:trackingNumber/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver', 'admin')
  updateStatusByTracking(
    @Param('trackingNumber') trackingNumber: string,
    @Body() payload: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.deliveriesService.updateStatusByTrackingNumber(Number(trackingNumber), payload);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list(): Promise<Delivery[]> {
    return this.deliveriesService.list();
  }
}