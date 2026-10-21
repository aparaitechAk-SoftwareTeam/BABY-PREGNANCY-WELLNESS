import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService, CreateAppointmentDto } from './appointments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateAppointmentDto,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      dto?.userId ||
      req.query?.userId ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.appointmentsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@CurrentUser() user: any, @Req() req: any) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.appointmentsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle')
  async toggleStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.appointmentsService.toggleStatus(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    const userId =
      user?.sub ||
      user?.id ||
      req.query?.userId ||
      req.query?.email ||
      req.headers['x-user-id'] ||
      req.headers['x-user-email'];
    return this.appointmentsService.delete(userId, id);
  }
}
