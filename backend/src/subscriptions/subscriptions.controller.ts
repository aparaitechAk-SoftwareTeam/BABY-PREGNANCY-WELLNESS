import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  // 1. PUBLIC: GET ALL PLANS WITH REALTIME SUBSCRIBER COUNTS FROM DB
  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  // 2. ADMIN/STAFF: GET REALTIME SUBSCRIPTION METRICS DIRECTLY FROM DATABASE
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPPORT')
  @Get('stats')
  async getStats() {
    return this.subscriptionsService.getStats();
  }

  // 3. ADMIN: LIST ALL SUBSCRIPTIONS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('list')
  async listSubscriptions(@Query() query: any) {
    return this.subscriptionsService.listSubscriptions(query);
  }

  // 4. ADMIN: ASSIGN / ACTIVATE SUBSCRIPTION FOR USER
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/assign')
  async assignSubscription(@Body() dto: any) {
    return this.subscriptionsService.assignSubscription(dto);
  }

  // 5. ADMIN: CANCEL SUBSCRIPTION
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/cancel/:id')
  async cancelSubscription(@Param('id') id: string) {
    return this.subscriptionsService.cancelSubscription(id);
  }
}
