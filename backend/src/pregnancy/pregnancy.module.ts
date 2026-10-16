import { Module } from '@nestjs/common';
import { PregnancyController } from './pregnancy.controller';
import { PregnancyService } from './pregnancy.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [PregnancyController],
  providers: [PregnancyService, PrismaService, JwtAuthGuard],
  exports: [PregnancyService],
})
export class PregnancyModule {}
