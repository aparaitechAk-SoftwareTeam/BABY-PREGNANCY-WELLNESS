import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getNotifications(@CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('read-all')
  async markAllRead(@CurrentUser() user: any) {
    const userId = user?.sub || user?.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('broadcast')
  async broadcastNotification(@Body() dto: any) {
    return this.notificationsService.createNotification(dto);
  }
}
