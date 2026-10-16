import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateKickSessionDto } from './dto/kick-session.dto';
import { CreateWaterLogDto } from './dto/water-log.dto';
import { CreateWeightLogDto } from './dto/weight-log.dto';
import { CreateSymptomLogDto } from './dto/symptom-log.dto';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  private async resolveUserId(identifier?: string, email?: string): Promise<string> {
    if (identifier) {
      const user = await (this.prisma as any).user.findUnique({
        where: { id: identifier },
      });
      if (user) return user.id;
    }

    if (email) {
      const user = await (this.prisma as any).user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (user) return user.id;
    }

    throw new NotFoundException('User not found for tracking operation');
  }

  // 1. KICK SESSIONS
  async createKickSession(userIdOrIdentifier: string, dto: CreateKickSessionDto) {
    const userId = await this.resolveUserId(userIdOrIdentifier || dto.userId, dto.email);

    const record = await (this.prisma as any).kickSession.create({
      data: {
        userId,
        kicks: dto.kicks,
        durationSeconds: dto.durationSeconds,
        reachedTen: dto.reachedTen ?? dto.kicks >= 10,
        startTime: dto.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: dto.notes || '',
      },
    });

    return {
      success: true,
      message: 'Kick counting session recorded',
      data: record,
    };
  }

  async getKickSessions(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const records = await (this.prisma as any).kickSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, data: records };
  }

  // 2. WATER LOGS
  async createWaterLog(userIdOrIdentifier: string, dto: CreateWaterLogDto) {
    const userId = await this.resolveUserId(userIdOrIdentifier || dto.userId, dto.email);

    const record = await (this.prisma as any).waterLog.create({
      data: {
        userId,
        amountMl: dto.amountMl,
        timeStr: dto.timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        label: dto.label || 'Hydration',
      },
    });

    return {
      success: true,
      message: 'Water intake recorded',
      data: record,
    };
  }

  async getWaterLogs(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const records = await (this.prisma as any).waterLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { success: true, data: records };
  }

  // 3. WEIGHT LOGS
  async createWeightLog(userIdOrIdentifier: string, dto: CreateWeightLogDto) {
    const userId = await this.resolveUserId(userIdOrIdentifier || dto.userId, dto.email);

    const record = await (this.prisma as any).weightLog.create({
      data: {
        userId,
        weightKg: dto.weightKg,
        week: dto.week,
        dateStr: dto.dateStr || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        note: dto.note || '',
      },
    });

    // Also update currentWeight on the PregnancyProfile
    await (this.prisma as any).pregnancyProfile.updateMany({
      where: { userId },
      data: { currentWeight: dto.weightKg },
    });

    return {
      success: true,
      message: 'Weight log recorded',
      data: record,
    };
  }

  async getWeightLogs(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const records = await (this.prisma as any).weightLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, data: records };
  }

  // 4. SYMPTOM LOGS
  async createSymptomLog(userIdOrIdentifier: string, dto: CreateSymptomLogDto) {
    const userId = await this.resolveUserId(userIdOrIdentifier || dto.userId, dto.email);

    const record = await (this.prisma as any).symptomLog.create({
      data: {
        userId,
        symptoms: dto.symptoms,
        severity: dto.severity || 'mild',
        notes: dto.notes || '',
        isUrgent: dto.isUrgent ?? false,
      },
    });

    return {
      success: true,
      message: 'Symptom log recorded',
      data: record,
    };
  }

  async getSymptomLogs(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const records = await (this.prisma as any).symptomLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { success: true, data: records };
  }
}
