import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { CreateKickSessionDto } from './dto/kick-session.dto';
import { CreateWaterLogDto } from './dto/water-log.dto';
import { CreateWeightLogDto } from './dto/weight-log.dto';
import { CreateSymptomLogDto } from './dto/symptom-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  // 1. KICKS
  @UseGuards(JwtAuthGuard)
  @Post('kicks')
  async recordKickSession(
    @CurrentUser() user: any,
    @Body() dto: CreateKickSessionDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.createKickSession(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('kicks')
  async getKickSessions(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getKickSessions(userIdOrIdentifier);
  }

  // 2. WATER / HYDRATION
  @UseGuards(JwtAuthGuard)
  @Post('water')
  async recordWaterLog(
    @CurrentUser() user: any,
    @Body() dto: CreateWaterLogDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.createWaterLog(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('water')
  async getWaterLogs(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getWaterLogs(userIdOrIdentifier);
  }

  // 3. WEIGHT
  @UseGuards(JwtAuthGuard)
  @Post('weight')
  async recordWeightLog(
    @CurrentUser() user: any,
    @Body() dto: CreateWeightLogDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.createWeightLog(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('weight')
  async getWeightLogs(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getWeightLogs(userIdOrIdentifier);
  }

  // 4. SYMPTOMS
  @UseGuards(JwtAuthGuard)
  @Post('symptoms')
  async recordSymptomLog(
    @CurrentUser() user: any,
    @Body() dto: CreateSymptomLogDto,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.createSymptomLog(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('symptoms')
  async getSymptomLogs(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getSymptomLogs(userIdOrIdentifier);
  }
}
