import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateDeliveryResponse, CreateMyDeliveryPayload, Delivery } from '@packtrack/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { DeliveriesService } from './deliveries.service';

interface AuthenticatedRequest {
  user?: {
    username: string;
  };
}

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() payload: CreateDeliveryDto): Promise<CreateDeliveryResponse> {
    return this.deliveriesService.create(payload);
  }

  @Post('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  createMy(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CreateMyDeliveryPayload,
  ): Promise<CreateDeliveryResponse> {
    return this.deliveriesService.createForClientUsername(req.user?.username ?? '', payload);
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

  @Get('tracking/:trackingNumber')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver', 'admin')
  getByTracking(@Param('trackingNumber') trackingNumber: string): Promise<Delivery> {
    const parsedTrackingNumber = Number(trackingNumber);
    if (!Number.isFinite(parsedTrackingNumber)) {
      throw new BadRequestException('trackingNumber must be numeric.');
    }

    return this.deliveriesService.getByTrackingNumber(parsedTrackingNumber);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list(): Promise<Delivery[]> {
    return this.deliveriesService.list();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  listMy(@Req() req: AuthenticatedRequest): Promise<Delivery[]> {
    return this.deliveriesService.listForClientUsername(req.user?.username ?? '');
  }
}
