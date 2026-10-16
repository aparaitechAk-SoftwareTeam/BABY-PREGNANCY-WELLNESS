import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SavePregnancyProfileDto } from './dto/save-pregnancy-profile.dto';

@Injectable()
export class PregnancyService {
  constructor(private prisma: PrismaService) {}

  async saveProfile(userIdOrIdentifier: string, dto: SavePregnancyProfileDto) {
    let user: any = null;

    if (userIdOrIdentifier) {
      user = await (this.prisma as any).user.findUnique({
        where: { id: userIdOrIdentifier },
      });
    }

    if (!user && dto.email) {
      user = await (this.prisma as any).user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
    }

    if (!user && dto.userId) {
      user = await (this.prisma as any).user.findUnique({
        where: { id: dto.userId },
      });
    }

    if (!user) {
      throw new NotFoundException('User account not found for profile save');
    }

    const userId = user.id;

    // Ensure due date is computed if missing
    let parsedDueDate: Date;
    if (dto.dueDate) {
      parsedDueDate = new Date(dto.dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        const remainingDays = dto.daysRemaining ?? Math.max(0, 280 - (dto.currentWeek ?? 20) * 7);
        parsedDueDate = new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000);
      }
    } else {
      const remainingDays = dto.daysRemaining ?? Math.max(0, 280 - (dto.currentWeek ?? 20) * 7);
      parsedDueDate = new Date(Date.now() + remainingDays * 24 * 60 * 60 * 1000);
    }

    // Default pre-pregnancy weight to current weight if not separately specified
    const preWeight = dto.prePregnancyWeight ?? dto.currentWeight ?? 60;
    const currWeight = dto.currentWeight ?? dto.prePregnancyWeight ?? 65.5;
    const bloodGroup = dto.bloodGroup && dto.bloodGroup.trim() ? dto.bloodGroup.trim() : 'O+';
    const height = dto.height ?? 165;
    const currentWeek = dto.currentWeek ?? 20;
    const trimester = dto.trimester ?? (currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3);
    const daysRemaining = dto.daysRemaining ?? Math.max(0, 280 - currentWeek * 7);

    // Upsert the pregnancy profile in Neon PostgreSQL
    const profile = await (this.prisma as any).pregnancyProfile.upsert({
      where: { userId },
      update: {
        dueDate: parsedDueDate,
        calculationMethod: dto.calculationMethod || 'EDD',
        currentWeek,
        currentDay: dto.currentDay ?? 0,
        trimester,
        daysRemaining,
        pregnancyType: dto.pregnancyType || 'SINGLE',
        nickname: dto.nickname || '',
        height,
        heightFt: dto.heightFt || '',
        currentWeight: currWeight,
        prePregnancyWeight: preWeight,
        bloodGroup,
        motherAge: dto.motherAge ?? 28,
        doctorName: dto.doctorName || '',
        hospitalName: dto.hospitalName || '',
        doctorPhone: dto.doctorPhone || '',
        nextAppointmentDate: dto.nextAppointmentDate || '',
        emergencyContactName: dto.emergencyContactName || '',
        emergencyContactRelation: dto.emergencyContactRelation || '',
        emergencyContactPhone: dto.emergencyContactPhone || '',
        medicalNotes: dto.medicalNotes || '',
        preferredUnits: dto.preferredUnits || 'METRIC',
      },
      create: {
        userId,
        dueDate: parsedDueDate,
        calculationMethod: dto.calculationMethod || 'EDD',
        currentWeek,
        currentDay: dto.currentDay ?? 0,
        trimester,
        daysRemaining,
        pregnancyType: dto.pregnancyType || 'SINGLE',
        nickname: dto.nickname || '',
        height,
        heightFt: dto.heightFt || '',
        currentWeight: currWeight,
        prePregnancyWeight: preWeight,
        bloodGroup,
        motherAge: dto.motherAge ?? 28,
        doctorName: dto.doctorName || '',
        hospitalName: dto.hospitalName || '',
        doctorPhone: dto.doctorPhone || '',
        nextAppointmentDate: dto.nextAppointmentDate || '',
        emergencyContactName: dto.emergencyContactName || '',
        emergencyContactRelation: dto.emergencyContactRelation || '',
        emergencyContactPhone: dto.emergencyContactPhone || '',
        medicalNotes: dto.medicalNotes || '',
        preferredUnits: dto.preferredUnits || 'METRIC',
      },
    });

    // Mark user's profile as completed
    await (this.prisma as any).user.update({
      where: { id: userId },
      data: { isProfileCompleted: true },
    });

    return {
      success: true,
      message: 'Pregnancy profile saved successfully',
      data: profile,
    };
  }

  async getProfile(userIdOrIdentifier: string) {
    let profile = await (this.prisma as any).pregnancyProfile.findUnique({
      where: { userId: userIdOrIdentifier },
    });

    if (!profile) {
      // Try finding by user email
      const user = await (this.prisma as any).user.findUnique({
        where: { email: userIdOrIdentifier.toLowerCase() },
        include: { profile: true },
      });
      if (user && user.profile) {
        profile = user.profile;
      }
    }

    if (!profile) {
      throw new NotFoundException('Pregnancy profile not found');
    }

    return {
      success: true,
      data: profile,
    };
  }

  async getWeekData(week: number) {
    const safeWeek = Math.max(1, Math.min(42, week));
    const trimester = safeWeek <= 12 ? 1 : safeWeek <= 27 ? 2 : 3;

    return {
      week: safeWeek,
      trimester,
      tips: [
        'Stay well hydrated with at least 8-10 glasses of water daily.',
        'Take your prescribed prenatal vitamins and folic acid regularly.',
        'Engage in gentle exercises like walking or prenatal yoga if cleared by your doctor.',
      ],
    };
  }
}
