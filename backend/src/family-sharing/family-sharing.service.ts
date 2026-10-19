import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface UpdatePermissionsDto {
  milestones?: boolean;
  appointments?: boolean;
  kicks?: boolean;
  emergency?: boolean;
}

@Injectable()
export class FamilySharingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper to generate a clean, unique 6-8 character code like "MOM-8492"
   */
  private generateRandomCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude easily confused chars (0, O, 1, I)
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MOM-${randomPart}`;
  }

  /**
   * Mother generates or retrieves her unique active pairing code
   */
  async getOrCreateMotherCode(motherId: string) {
    const mother = await (this.prisma as any).user.findUnique({
      where: { id: motherId },
      include: {
        profile: true,
      },
    });

    if (!mother) {
      throw new NotFoundException('Mother account not found');
    }

    // Look for an existing pending or active pairing code for this mother
    let pairing = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        motherId,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If none exists, create a fresh unique pairing code
    if (!pairing) {
      let code = this.generateRandomCode();
      // Ensure uniqueness
      let exists = await (this.prisma as any).caregiverPairing.findUnique({
        where: { pairingCode: code },
      });
      while (exists) {
        code = this.generateRandomCode();
        exists = await (this.prisma as any).caregiverPairing.findUnique({
          where: { pairingCode: code },
        });
      }

      pairing = await (this.prisma as any).caregiverPairing.create({
        data: {
          motherId,
          pairingCode: code,
          status: 'PENDING',
          permissions: {
            milestones: true,
            appointments: true,
            kicks: true,
            emergency: true,
          },
        },
      });
    }

    // Also get all paired members for this mother
    const allMembers = await (this.prisma as any).caregiverPairing.findMany({
      where: {
        motherId,
        status: 'ACTIVE',
      },
      include: {
        caregiver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      success: true,
      pairingCode: pairing.pairingCode,
      status: pairing.status,
      pairedMembers: allMembers.map((m: any) => ({
        id: m.id,
        name: m.caregiver?.name || 'Partner',
        email: m.caregiver?.email,
        relationship: m.relationship || 'Partner',
        status: m.status,
        permissions: m.permissions || {
          milestones: true,
          appointments: true,
          kicks: true,
          emergency: true,
        },
        pairedAt: m.pairedAt,
        connectedDate: m.pairedAt
          ? new Date(m.pairedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Recent',
      })),
    };
  }

  /**
   * Mother explicitly generates a new pairing code (e.g. to invite an additional partner/caregiver)
   */
  async generateNewCode(motherId: string, relationship?: string) {
    const mother = await (this.prisma as any).user.findUnique({
      where: { id: motherId },
    });
    if (!mother) throw new NotFoundException('Mother account not found');

    let code = this.generateRandomCode();
    let exists = await (this.prisma as any).caregiverPairing.findUnique({
      where: { pairingCode: code },
    });
    while (exists) {
      code = this.generateRandomCode();
      exists = await (this.prisma as any).caregiverPairing.findUnique({
        where: { pairingCode: code },
      });
    }

    const pairing = await (this.prisma as any).caregiverPairing.create({
      data: {
        motherId,
        pairingCode: code,
        relationship: relationship || 'Partner / Caregiver',
        status: 'PENDING',
        permissions: {
          milestones: true,
          appointments: true,
          kicks: true,
          emergency: true,
        },
      },
    });

    return {
      success: true,
      message: 'New pairing code generated',
      pairingCode: pairing.pairingCode,
    };
  }

  /**
   * Caregiver submits code (e.g. "MOM-8492") to link with the mother
   */
  async pairWithMother(caregiverId: string, pairingCode: string, relationship?: string) {
    const caregiver = await (this.prisma as any).user.findUnique({
      where: { id: caregiverId },
    });
    if (!caregiver) throw new NotFoundException('Caregiver account not found');

    const cleanCode = (pairingCode || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new BadRequestException('Pairing code is required');
    }

    const pairing = await (this.prisma as any).caregiverPairing.findUnique({
      where: { pairingCode: cleanCode },
      include: {
        mother: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!pairing) {
      throw new BadRequestException('Invalid pairing code. Please double check the code provided by the mother.');
    }

    if (pairing.status === 'REVOKED') {
      throw new BadRequestException('This pairing code has been revoked by the mother.');
    }

    if (pairing.motherId === caregiverId) {
      throw new BadRequestException('You cannot pair with yourself as caregiver.');
    }

    // Check if this caregiver is already linked to this mother
    const alreadyLinked = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        motherId: pairing.motherId,
        caregiverId,
        status: 'ACTIVE',
      },
    });

    if (alreadyLinked) {
      return {
        success: true,
        message: 'You are already linked with this mother.',
        pairing: alreadyLinked,
        mother: {
          name: pairing.mother.name,
          email: pairing.mother.email,
        },
      };
    }

    // Update the pairing record to ACTIVE with caregiver's ID
    const updated = await (this.prisma as any).caregiverPairing.update({
      where: { id: pairing.id },
      data: {
        caregiverId,
        status: 'ACTIVE',
        relationship: relationship || pairing.relationship || 'Partner',
        pairedAt: new Date(),
      },
      include: {
        mother: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Successfully linked with ${pairing.mother.name}!`,
      pairing: updated,
      mother: {
        name: pairing.mother.name,
        email: pairing.mother.email,
      },
    };
  }

  /**
   * Caregiver checks if they are currently linked with a mother
   */
  async getCaregiverStatus(caregiverId: string) {
    const pairing = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        caregiverId,
        status: 'ACTIVE',
      },
      include: {
        mother: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!pairing) {
      return {
        isPaired: false,
        pairing: null,
        mother: null,
      };
    }

    return {
      isPaired: true,
      pairing: {
        id: pairing.id,
        pairingCode: pairing.pairingCode,
        relationship: pairing.relationship,
        status: pairing.status,
        permissions: pairing.permissions,
        pairedAt: pairing.pairedAt,
      },
      mother: {
        id: pairing.mother.id,
        name: pairing.mother.name,
        email: pairing.mother.email,
        profile: pairing.mother.profile,
      },
    };
  }

  /**
   * Caregiver retrieves ALL live clinical & tracking data of the paired mother from Neon DB
   */
  async getMotherLiveComprehensiveData(caregiverId: string) {
    // 1. Find active pairing
    const pairing = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        caregiverId,
        status: 'ACTIVE',
      },
      include: {
        mother: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!pairing || !pairing.mother) {
      throw new ForbiddenException(
        'Caregiver is not currently paired with a mother. Please enter the pairing code from the mother to link accounts.',
      );
    }

    const motherId = pairing.motherId;
    const mother = pairing.mother;
    const profile = mother.profile;
    const permissions: any = pairing.permissions || {
      milestones: true,
      appointments: true,
      kicks: true,
      emergency: true,
    };

    const todayDateStr = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));

    // 2. Query all mother metrics in parallel directly from Neon PostgreSQL
    const [
      todaySteps,
      todaySleep,
      todayWaterLogs,
      latestKickSession,
      recentWeightLogs,
      recentSymptoms,
      upcomingAppointments,
      weeklyTasks,
      maternalNotes,
    ] = await Promise.all([
      (this.prisma as any).stepLog.findUnique({
        where: { userId_dateStr: { userId: motherId, dateStr: todayDateStr } },
      }),
      (this.prisma as any).sleepLog.findUnique({
        where: { userId_dateStr: { userId: motherId, dateStr: todayDateStr } },
      }),
      (this.prisma as any).waterLog.findMany({
        where: {
          userId: motherId,
          loggedAt: { gte: startOfToday },
        },
        orderBy: { loggedAt: 'desc' },
      }),
      (this.prisma as any).kickSession.findFirst({
        where: { userId: motherId },
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).weightLog.findMany({
        where: { userId: motherId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      (this.prisma as any).symptomLog.findMany({
        where: { userId: motherId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      (this.prisma as any).appointment.findMany({
        where: {
          userId: motherId,
        },
        orderBy: { appointmentDate: 'asc' },
        take: 10,
      }),
      (this.prisma as any).weeklyTask.findMany({
        where: {
          userId: motherId,
          week: profile?.currentWeek || 20,
        },
        orderBy: { createdAt: 'asc' },
      }),
      (this.prisma as any).maternalNote.findMany({
        where: { userId: motherId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Hydration calculation
    const totalWaterMl = (todayWaterLogs || []).reduce(
      (acc: number, item: any) => acc + (item.amountMl || 0),
      0,
    );
    const waterGoalMl = 2500;
    const waterPercentage = Math.min(100, Math.round((totalWaterMl / waterGoalMl) * 100));

    // Weight gain calculation
    const initialWeight = profile?.prePregnancyWeight || profile?.currentWeight || 60;
    const currentWeight = profile?.currentWeight || initialWeight;
    const weightGained = Number((currentWeight - initialWeight).toFixed(1));

    // Urgent symptom alert
    const hasUrgentSymptom = (recentSymptoms || []).some((s: any) => s.isUrgent);

    return {
      success: true,
      isPaired: true,
      relationship: pairing.relationship,
      pairedSince: pairing.pairedAt,
      permissions,

      // Mother Identity & Profile
      mother: {
        id: mother.id,
        name: mother.name,
        email: mother.email,
        nickname: profile?.nickname || mother.name,
        currentWeek: profile?.currentWeek || 20,
        currentDay: profile?.currentDay || 0,
        trimester: profile?.trimester || 2,
        daysRemaining: profile?.daysRemaining || Math.max(0, 280 - (profile?.currentWeek || 20) * 7),
        dueDate: profile?.dueDate,
        bloodGroup: profile?.bloodGroup || 'O+',
        height: profile?.height || 165,
        heightFt: profile?.heightFt || '',
        currentWeight: currentWeight,
        prePregnancyWeight: initialWeight,
        weightGainedKg: weightGained,
        motherAge: profile?.motherAge || 28,
        doctorName: profile?.doctorName || 'Not configured',
        hospitalName: profile?.hospitalName || 'Not configured',
        doctorPhone: profile?.doctorPhone || '',
        emergencyContactName: profile?.emergencyContactName || '',
        emergencyContactRelation: profile?.emergencyContactRelation || '',
        emergencyContactPhone: profile?.emergencyContactPhone || '',
        medicalNotes: profile?.medicalNotes || '',
      },

      // Today's Vitals
      today: {
        dateStr: todayDateStr,
        steps: todaySteps?.steps || 0,
        stepGoal: todaySteps?.goal || 5000,
        distanceKm: todaySteps?.distanceKm || 0,
        caloriesKcal: todaySteps?.caloriesKcal || 0,
        activeMinutes: todaySteps?.activeMinutes || 0,
        stepPercentage: Math.min(
          100,
          Math.round(((todaySteps?.steps || 0) / (todaySteps?.goal || 5000)) * 100),
        ),

        sleepMinutes: todaySleep?.durationMinutes || 0,
        sleepQuality: todaySleep?.quality || 'Not logged yet',
        sleepHoursFormatted: todaySleep?.durationMinutes
          ? `${Math.floor(todaySleep.durationMinutes / 60)}h ${todaySleep.durationMinutes % 60}m`
          : '0h',

        waterMl: totalWaterMl,
        waterGoalMl,
        waterPercentage,
        waterGlasses: Math.round(totalWaterMl / 250),

        kicks: permissions.kicks && latestKickSession
          ? {
              count: latestKickSession.kicks,
              durationSeconds: latestKickSession.durationSeconds,
              durationFormatted: `${Math.floor(latestKickSession.durationSeconds / 60)}m ${latestKickSession.durationSeconds % 60}s`,
              reachedTen: latestKickSession.reachedTen,
              startTime: latestKickSession.startTime,
              notes: latestKickSession.notes,
              recordedAt: latestKickSession.createdAt,
            }
          : null,
      },

      // Clinical Alerts
      clinicalAlerts: {
        hasUrgentSymptom,
        recentSymptoms: (recentSymptoms || []).map((s: any) => ({
          id: s.id,
          symptoms: s.symptoms,
          severity: s.severity,
          notes: s.notes,
          isUrgent: s.isUrgent,
          createdAt: s.createdAt,
          dateStr: new Date(s.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        })),
      },

      // Appointments
      appointments: permissions.appointments
        ? (upcomingAppointments || []).map((a: any) => ({
            id: a.id,
            title: a.title,
            doctorName: a.doctorName || profile?.doctorName || 'Doctor',
            hospitalName: a.hospitalName || profile?.hospitalName || 'Clinic',
            doctorPhone: a.doctorPhone || profile?.doctorPhone || '',
            appointmentDate: a.appointmentDate,
            timeStr: a.timeStr || '10:00 AM',
            notes: a.notes,
            status: a.status,
            dateStr: new Date(a.appointmentDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          }))
        : [],

      // Weekly tasks & checklist
      routineChecklist: {
        week: profile?.currentWeek || 20,
        tasks: (weeklyTasks || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          timeOfDay: t.timeOfDay,
          isCompleted: t.isCompleted,
        })),
        totalTasks: weeklyTasks?.length || 0,
        completedTasks: (weeklyTasks || []).filter((t: any) => t.isCompleted).length,
      },

      // Maternal Notes / Questions for Doctor
      doctorNotes: (maternalNotes || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        dateStr: n.dateStr,
      })),
    };
  }

  /**
   * Unlink a pairing (can be invoked by either Mother or Caregiver)
   */
  async unlinkPairing(userId: string, pairingId: string) {
    const pairing = await (this.prisma as any).caregiverPairing.findUnique({
      where: { id: pairingId },
    });

    if (!pairing) {
      throw new NotFoundException('Pairing record not found');
    }

    if (pairing.motherId !== userId && pairing.caregiverId !== userId) {
      throw new ForbiddenException('You are not authorized to unlink this pairing');
    }

    await (this.prisma as any).caregiverPairing.update({
      where: { id: pairingId },
      data: {
        status: 'REVOKED',
        caregiverId: null,
      },
    });

    return {
      success: true,
      message: 'Pairing successfully unlinked',
    };
  }

  /**
   * Mother updates permissions granted to the caregiver
   */
  async updatePermissions(motherId: string, pairingId: string, permissions: UpdatePermissionsDto) {
    const pairing = await (this.prisma as any).caregiverPairing.findUnique({
      where: { id: pairingId },
    });

    if (!pairing || pairing.motherId !== motherId) {
      throw new ForbiddenException('Unauthorized to modify permissions for this pairing');
    }

    const currentPerms = (pairing.permissions as any) || {};
    const updatedPerms = { ...currentPerms, ...permissions };

    const updated = await (this.prisma as any).caregiverPairing.update({
      where: { id: pairingId },
      data: {
        permissions: updatedPerms,
      },
    });

    return {
      success: true,
      message: 'Permissions updated successfully',
      permissions: updated.permissions,
    };
  }
}
