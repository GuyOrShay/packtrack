import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { ReportsModule } from './reports/reports.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    ClientsModule,
    DeliveriesModule,
    ReportsModule,
  ],
})
export class AppModule {}