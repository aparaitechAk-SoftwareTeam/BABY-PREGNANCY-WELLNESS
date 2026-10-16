import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [TrackingController],
  providers: [TrackingService, PrismaService, JwtAuthGuard],
  exports: [TrackingService],
})
export class TrackingModule {}
