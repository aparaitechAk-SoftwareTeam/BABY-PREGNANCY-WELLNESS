import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PregnancyContentService } from './pregnancy-content.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pregnancy-content')
export class PregnancyContentController {
  constructor(private readonly service: PregnancyContentService) {}

  // 1. GET WEEKLY CLINICAL & MILESTONE CONTENT
  @Get('week/:week')
  async getContentByWeek(@Param('week') week: string) {
    return this.service.getContentByWeek(parseInt(week, 10));
  }

  // 2. GET WEEKLY ROUTINE TASKS (USER OR GLOBAL)
  @UseGuards(JwtAuthGuard)
  @Get('tasks/week/:week')
  async getTasksByWeek(
    @Param('week') week: string,
    @CurrentUser() user: any,
  ) {
    const userId = user?.sub || user?.id;
    return this.service.getTasksByWeek(parseInt(week, 10), userId);
  }

  // Public/caregiver fallback if no auth token passed
  @Get('public/tasks/week/:week')
  async getPublicTasksByWeek(@Param('week') week: string) {
    return this.service.getTasksByWeek(parseInt(week, 10));
  }

  // 3. TOGGLE TASK COMPLETION
  @Post('tasks/toggle/:id')
  async toggleTask(
    @Param('id') id: string,
    @Body() body: { isCompleted: boolean },
  ) {
    return this.service.toggleTask(id, body.isCompleted);
  }

  // 4. ADMIN: LIST ALL CONTENT
  @Get('admin/list')
  async listAllContent(@Query() query: any) {
    return this.service.listAllContent(query);
  }

  // 5. ADMIN: UPSERT CONTENT
  @Post('admin/upsert')
  async upsertContent(@Body() dto: any) {
    return this.service.upsertContent(dto);
  }

  // 6. ADMIN: CREATE WEEKLY TASK
  @Post('admin/tasks/create')
  async createWeeklyTask(@Body() dto: any) {
    return this.service.createWeeklyTask(dto);
  }
}
