import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { TrackingModule } from './tracking/tracking.module';

import { NotificationsModule } from './notifications/notifications.module';
import { PregnancyContentModule } from './pregnancy-content/pregnancy-content.module';
import { UsersModule } from './users/users.module';
import { SupportModule } from './support/support.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    AuthModule,
    PregnancyModule,
    TrackingModule,
    NotificationsModule,
    PregnancyContentModule,
    UsersModule,
    SupportModule,
    AppointmentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
