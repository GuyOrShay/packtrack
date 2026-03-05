import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { ReportsModule } from './reports/reports.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    DeliveriesModule,
    ReportsModule,
  ],
})
export class AppModule {}
