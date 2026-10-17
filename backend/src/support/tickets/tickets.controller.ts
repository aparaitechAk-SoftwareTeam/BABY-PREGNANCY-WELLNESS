import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TicketsService, TicketFilterDto } from './tickets.service';

@Controller('support/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async getTickets(@Query() query: TicketFilterDto) {
    return this.ticketsService.getTickets(query);
  }

  @Get('stats')
  async getStats() {
    return this.ticketsService.getStats();
  }

  @Get('escalations')
  async getEscalations() {
    return this.ticketsService.getEscalations();
  }

  @Get(':id')
  async getTicketById(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  @Post()
  async createTicket(@Body() body: any) {
    return this.ticketsService.createTicket(body);
  }

  @Post(':id/messages')
  async addMessage(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.addMessage(id, body);
  }

  @Patch(':id')
  async updateTicket(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.updateTicket(id, body);
  }
}
