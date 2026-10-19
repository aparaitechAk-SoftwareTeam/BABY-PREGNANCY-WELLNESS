import { Module } from '@nestjs/common';
import { FamilySharingController } from './family-sharing.controller';
import { FamilySharingService } from './family-sharing.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [FamilySharingController],
  providers: [FamilySharingService, PrismaService],
  exports: [FamilySharingService],
})
export class FamilySharingModule {}
