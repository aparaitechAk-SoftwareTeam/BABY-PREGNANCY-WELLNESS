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

  // 5. STEPS
  async upsertStepLog(userIdOrIdentifier: string, dto: any) {
    const userId = await this.resolveUserId(userIdOrIdentifier || dto.userId, dto.email);
    const dateStr = dto.dateStr || new Date().toISOString().slice(0, 10);
    const steps = Number(dto.steps) || 0;
    const goal = Number(dto.goal) || 5000;
    const distanceKm = Number((steps * 0.00075).toFixed(2));
    const caloriesKcal = Math.round(steps * 0.04);
    const activeMinutes = Math.round(steps / 110);

    const record = await (this.prisma as any).stepLog.upsert({
      where: {
        userId_dateStr: { userId, dateStr },
      },
      update: {
        steps,
        goal,
        distanceKm,
        caloriesKcal,
        activeMinutes,
      },
      create: {
        userId,
        dateStr,
        steps,
        goal,
        distanceKm,
        caloriesKcal,
        activeMinutes,
      },
    });

    return {
      success: true,
      message: 'Steps recorded successfully',
      data: record,
    };
  }

  async getTodaySteps(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const dateStr = new Date().toISOString().slice(0, 10);
    const record = await (this.prisma as any).stepLog.findUnique({
      where: {
        userId_dateStr: { userId, dateStr },
      },
    });

    return {
      success: true,
      data: record || {
        steps: 0,
        goal: 5000,
        distanceKm: 0,
        caloriesKcal: 0,
        activeMinutes: 0,
        dateStr,
      },
    };
  }

  async getStepsHistory(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const records = await (this.prisma as any).stepLog.findMany({
      where: { userId },
      orderBy: { dateStr: 'desc' },
      take: 14,
    });
    return { success: true, data: records };
  }

  // 6. SLEEP
  async upsertSleepLog(userIdOrIdentifier: string, dto: any) {
    const userId = await this.resolveUserId(userIdOrIdentifier || dto.userId, dto.email);
    const dateStr = dto.dateStr || new Date().toISOString().slice(0, 10);
    const durationMinutes = Number(dto.durationMinutes) || 0;
    const quality = dto.quality || 'Restful';

    const record = await (this.prisma as any).sleepLog.upsert({
      where: {
        userId_dateStr: { userId, dateStr },
      },
      update: {
        durationMinutes,
        quality,
      },
      create: {
        userId,
        dateStr,
        durationMinutes,
        quality,
      },
    });

    return {
      success: true,
      message: 'Sleep log recorded',
      data: record,
    };
  }

  async getTodaySleep(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const dateStr = new Date().toISOString().slice(0, 10);
    const record = await (this.prisma as any).sleepLog.findUnique({
      where: {
        userId_dateStr: { userId, dateStr },
      },
    });

    return {
      success: true,
      data: record || {
        durationMinutes: 0,
        quality: 'Not logged yet',
        dateStr,
      },
    };
  }

  // 7. COMBINED TODAY'S DASHBOARD SUMMARY
  async getTodaySummary(userIdOrIdentifier: string) {
    const userId = await this.resolveUserId(userIdOrIdentifier);
    const dateStr = new Date().toISOString().slice(0, 10);

    const [steps, sleep, waterToday, latestKicks] = await Promise.all([
      (this.prisma as any).stepLog.findUnique({ where: { userId_dateStr: { userId, dateStr } } }),
      (this.prisma as any).sleepLog.findUnique({ where: { userId_dateStr: { userId, dateStr } } }),
      (this.prisma as any).waterLog.findMany({
        where: {
          userId,
          loggedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      (this.prisma as any).kickSession.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const totalWaterMl = waterToday.reduce((acc: number, item: any) => acc + (item.amountMl || 0), 0);

    return {
      success: true,
      data: {
        dateStr,
        steps: steps ? steps.steps : 0,
        stepGoal: steps ? steps.goal : 5000,
        distanceKm: steps ? steps.distanceKm : 0,
        caloriesKcal: steps ? steps.caloriesKcal : 0,
        sleepMinutes: sleep ? sleep.durationMinutes : 0,
        sleepQuality: sleep ? sleep.quality : 'Not logged yet',
        totalWaterMl,
        waterGlasses: Math.round(totalWaterMl / 250),
        latestKicks: latestKicks ? latestKicks.kicks : 0,
      },
    };
  }
}
