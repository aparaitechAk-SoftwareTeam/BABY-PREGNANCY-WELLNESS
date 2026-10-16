import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SavePregnancyProfileDto } from './dto/save-pregnancy-profile.dto';

@Injectable()
export class PregnancyService {
  constructor(private prisma: PrismaService) {}

  async saveProfile(userId: string, dto: SavePregnancyProfileDto) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : undefined;

    // Upsert the pregnancy profile in Neon PostgreSQL
    const profile = await (this.prisma as any).pregnancyProfile.upsert({
      where: { userId },
      update: {
        dueDate,
        calculationMethod: dto.calculationMethod,
        currentWeek: dto.currentWeek ?? 20,
        currentDay: dto.currentDay ?? 0,
        trimester: dto.trimester ?? 2,
        daysRemaining: dto.daysRemaining,
        pregnancyType: dto.pregnancyType || 'SINGLE',
        nickname: dto.nickname || '',
        height: dto.height,
        heightFt: dto.heightFt,
        currentWeight: dto.currentWeight,
        prePregnancyWeight: dto.prePregnancyWeight,
        bloodGroup: dto.bloodGroup,
        motherAge: dto.motherAge,
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
        dueDate,
        calculationMethod: dto.calculationMethod,
        currentWeek: dto.currentWeek ?? 20,
        currentDay: dto.currentDay ?? 0,
        trimester: dto.trimester ?? 2,
        daysRemaining: dto.daysRemaining,
        pregnancyType: dto.pregnancyType || 'SINGLE',
        nickname: dto.nickname || '',
        height: dto.height,
        heightFt: dto.heightFt,
        currentWeight: dto.currentWeight,
        prePregnancyWeight: dto.prePregnancyWeight,
        bloodGroup: dto.bloodGroup,
        motherAge: dto.motherAge,
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

  async getProfile(userId: string) {
    const profile = await (this.prisma as any).pregnancyProfile.findUnique({
      where: { userId },
    });

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
