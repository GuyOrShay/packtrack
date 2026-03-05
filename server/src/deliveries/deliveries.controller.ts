import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateDeliveryResponse, Delivery } from '@packtrack/shared';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { DeliveriesService } from './deliveries.service';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  create(@Body() payload: CreateDeliveryDto): Promise<CreateDeliveryResponse> {
    return this.deliveriesService.create(payload);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() payload: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.deliveriesService.updateStatus(id, payload);
  }

  @Patch('tracking/:trackingNumber/status')
  updateStatusByTracking(
    @Param('trackingNumber') trackingNumber: string,
    @Body() payload: UpdateDeliveryStatusDto,
  ): Promise<Delivery> {
    return this.deliveriesService.updateStatusByTrackingNumber(Number(trackingNumber), payload);
  }

  @Get()
  list(): Promise<Delivery[]> {
    return this.deliveriesService.list();
  }
}
