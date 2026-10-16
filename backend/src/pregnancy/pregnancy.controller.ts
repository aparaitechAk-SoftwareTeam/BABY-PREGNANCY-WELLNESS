import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PregnancyService } from './pregnancy.service';
import { SavePregnancyProfileDto } from './dto/save-pregnancy-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pregnancy')
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: SavePregnancyProfileDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.pregnancyService.saveProfile(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(
    @CurrentUser() user: any,
    @Body() dto: SavePregnancyProfileDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.pregnancyService.saveProfile(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('setup')
  async setupProfile(
    @CurrentUser() user: any,
    @Body() dto: SavePregnancyProfileDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.pregnancyService.saveProfile(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.pregnancyService.getProfile(userIdOrIdentifier);
  }

  @Get('week/:week')
  async getWeekData(@Param('week', ParseIntPipe) week: number) {
    return this.pregnancyService.getWeekData(week);
  }
}
