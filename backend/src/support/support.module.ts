import { Module } from '@nestjs/common';
import { TicketsController } from './tickets/tickets.controller';
import { TicketsService } from './tickets/tickets.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [],
  controllers: [TicketsController],
  providers: [TicketsService, PrismaService],
  exports: [TicketsService],
})
export class SupportModule {}
