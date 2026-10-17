import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { TrackingModule } from './tracking/tracking.module';

import { NotificationsModule } from './notifications/notifications.module';
import { PregnancyContentModule } from './pregnancy-content/pregnancy-content.module';

@Module({
  imports: [
    AuthModule,
    PregnancyModule,
    TrackingModule,
    NotificationsModule,
    PregnancyContentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
