import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
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

  // 5. STEPS
  @UseGuards(JwtAuthGuard)
  @Post('steps')
  async recordSteps(
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.upsertStepLog(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('steps/today')
  async getTodaySteps(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getTodaySteps(userIdOrIdentifier);
  }

  @UseGuards(JwtAuthGuard)
  @Get('steps/history')
  async getStepsHistory(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getStepsHistory(userIdOrIdentifier);
  }

  // 6. SLEEP
  @UseGuards(JwtAuthGuard)
  @Post('sleep')
  async recordSleep(
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.upsertSleepLog(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sleep/today')
  async getTodaySleep(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getTodaySleep(userIdOrIdentifier);
  }

  @UseGuards(JwtAuthGuard)
  @Get('sleep/history')
  async getSleepHistory(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getSleepHistory(userIdOrIdentifier);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sleep/:id')
  async deleteSleepLog(@CurrentUser() user: any, @Param('id') id: string) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.deleteSleepLog(userIdOrIdentifier, id);
  }

  // 7. TODAY SUMMARY
  @UseGuards(JwtAuthGuard)
  @Get('today-summary')
  async getTodaySummary(@CurrentUser() user: any) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getTodaySummary(userIdOrIdentifier);
  }

  // 8. NOTES & QUESTIONS
  @UseGuards(JwtAuthGuard)
  @Post('notes')
  async recordNote(
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id || dto.userId || dto.email;
    return this.trackingService.createNote(userIdOrIdentifier, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('notes')
  async getNotes(
    @CurrentUser() user: any,
    @Query('category') category?: string,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.getNotes(userIdOrIdentifier, category);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('notes/:id')
  async deleteNote(
    @CurrentUser() user: any,
    @Param('id') noteId: string,
  ) {
    const userIdOrIdentifier = user?.sub || user?.id;
    return this.trackingService.deleteNote(userIdOrIdentifier, noteId);
  }
}
