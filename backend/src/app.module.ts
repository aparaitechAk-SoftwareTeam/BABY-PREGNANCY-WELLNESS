import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [AuthModule, PregnancyModule, TrackingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
