import { Module } from '@nestjs/common';
import { PregnancyContentController } from './pregnancy-content.controller';
import { PregnancyContentService } from './pregnancy-content.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [PregnancyContentController],
  providers: [PregnancyContentService, PrismaService, JwtAuthGuard],
  exports: [PregnancyContentService],
})
export class PregnancyContentModule {}
