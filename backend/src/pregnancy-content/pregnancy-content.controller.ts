import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PregnancyContentService } from './pregnancy-content.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
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
  @Get('tasks/week/:week')
  async getTasksByWeek(
    @Param('week') week: string,
    @CurrentUser() user: any,
    @Query('userId') queryUserId?: string,
  ) {
    const userId = user?.sub || user?.id || queryUserId;
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

  // 5. ADMIN ONLY: UPSERT CONTENT (Restricted from Support Agents)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/upsert')
  async upsertContent(@Body() dto: any) {
    return this.service.upsertContent(dto);
  }

  // 6. ADMIN ONLY: CREATE WEEKLY TASK (Restricted from Support Agents)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/tasks/create')
  async createWeeklyTask(@Body() dto: any) {
    return this.service.createWeeklyTask(dto);
  }

  // 7. ADMIN ONLY: DELETE WEEKLY TASK
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('admin/tasks/:id')
  async deleteWeeklyTask(@Param('id') id: string) {
    return this.service.deleteWeeklyTask(id);
  }

  // 8. ADMIN: LIST ALL WEEKLY TASKS WITH OPTIONAL FILTERS
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPPORT')
  @Get('admin/tasks/list')
  async listAdminTasks(@Query() query: any) {
    return this.service.listAdminTasks(query);
  }

  // 9. ADMIN ONLY: UPDATE WEEKLY TASK
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('admin/tasks/update/:id')
  async updateWeeklyTask(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.service.updateWeeklyTask(id, dto);
  }
}

