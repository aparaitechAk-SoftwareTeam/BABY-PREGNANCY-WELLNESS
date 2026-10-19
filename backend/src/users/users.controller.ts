import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class CreateStaffDto {
  name: string;
  email: string;
  password: string;
  role?: 'SUPPORT' | 'ADMIN';
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.getUsers({ page, pageSize, search, role });
  }

  @Get('stats')
  async getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('dashboard-stats')
  async getDashboardAnalytics() {
    return this.usersService.getDashboardAnalytics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('staff')
  async getStaffMembers() {
    return this.usersService.getStaffMembers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('staff')
  async createStaffUser(@Body() dto: CreateStaffDto) {
    return this.usersService.createStaffUser(dto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
