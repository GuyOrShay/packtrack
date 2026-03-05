import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Client, CreateClientPayload } from '@packtrack/shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ClientsService } from './clients.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() payload: CreateClientPayload): Promise<Client> {
    return this.clientsService.create(payload);
  }

  @Get()
  list(): Promise<Client[]> {
    return this.clientsService.list();
  }
}