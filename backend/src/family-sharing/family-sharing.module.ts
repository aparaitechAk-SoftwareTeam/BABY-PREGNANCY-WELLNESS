import { Module } from '@nestjs/common';
import { FamilySharingController } from './family-sharing.controller';
import { FamilySharingService } from './family-sharing.service';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [AuthModule],
  controllers: [FamilySharingController],
  providers: [FamilySharingService, PrismaService, JwtAuthGuard],
  exports: [FamilySharingService],
})
export class FamilySharingModule {}
