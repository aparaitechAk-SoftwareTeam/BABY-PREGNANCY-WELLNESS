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
   * Helper to generate a clean, unique 6-digit numeric pairing code (e.g. "849201")
   */
  private generateRandomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Mother generates or retrieves her unique active pairing code
   */
  async getOrCreateMotherCode(motherId?: string) {
    let mother: any = null;
    const cleanId = (motherId || '').trim();

    if (cleanId) {
      mother = await (this.prisma as any).user.findFirst({
        where: {
          OR: [{ id: cleanId }, { email: cleanId }],
        },
        include: {
          profile: true,
        },
      });
    }

    if (!mother) {
      mother = await (this.prisma as any).user.findFirst({
        where: { role: 'MOTHER' },
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!mother) {
      // Fallback in edge cases where no user exists yet
      return {
        success: true,
        pairingCode: this.generateRandomCode(),
        status: 'PENDING',
        pairedMembers: [],
        pendingRequests: [],
      };
    }

    const effectiveMotherId = mother.id;

    // Look for an existing unassigned pairing code for this mother
    let unassignedPairing = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        motherId: effectiveMotherId,
        caregiverId: null,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    // If none exists, create a fresh unique pairing code
    if (!unassignedPairing) {
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

      unassignedPairing = await (this.prisma as any).caregiverPairing.create({
        data: {
          motherId: effectiveMotherId,
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

    // Get all accepted active members for this mother
    const activeMembers = await (this.prisma as any).caregiverPairing.findMany({
      where: {
        motherId: effectiveMotherId,
        status: 'ACTIVE',
        caregiverId: { not: null },
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
      orderBy: { pairedAt: 'desc' },
    });

    // Get all pending requests awaiting mother's approval
    const pendingRequests = await (this.prisma as any).caregiverPairing.findMany({
      where: {
        motherId: effectiveMotherId,
        status: 'PENDING',
        caregiverId: { not: null },
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
      pairingCode: unassignedPairing.pairingCode,
      status: unassignedPairing.status,
      pairedMembers: activeMembers.map((m: any) => ({
        id: m.id,
        name: m.caregiver?.name || 'Partner',
        email: m.caregiver?.email || '',
        relationship: m.relationship || 'Partner',
        status: 'Active',
        permissions: m.permissions || {
          milestones: true,
          appointments: true,
          kicks: true,
          emergency: true,
        },
        pairedAt: m.pairedAt,
        connectedDate: m.pairedAt
          ? new Date(m.pairedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Connected',
      })),
      pendingRequests: pendingRequests.map((r: any) => ({
        id: r.id,
        caregiverId: r.caregiverId,
        name: r.caregiver?.name || 'Caregiver Applicant',
        email: r.caregiver?.email || '',
        relationship: r.relationship || 'Partner / Family',
        status: 'Pending',
        permissions: r.permissions || {
          milestones: true,
          appointments: true,
          kicks: true,
          emergency: true,
        },
        requestedAt: r.updatedAt,
        connectedDate: new Date(r.updatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
    };
  }

  /**
   * Mother explicitly generates a new pairing code (e.g. to invite an additional partner/caregiver)
   */
  async generateNewCode(motherId?: string, relationship?: string) {
    let mother: any = null;
    const cleanId = (motherId || '').trim();

    if (cleanId) {
      mother = await (this.prisma as any).user.findFirst({
        where: {
          OR: [{ id: cleanId }, { email: cleanId }],
        },
      });
    }

    if (!mother) {
      mother = await (this.prisma as any).user.findFirst({
        where: { role: 'MOTHER' },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!mother) throw new NotFoundException('Mother account not found');

    const effectiveMotherId = mother.id;

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
        motherId: effectiveMotherId,
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
   * Caregiver submits code (e.g. "MOM-XXXX") to link with the mother
   * Sets status to PENDING until the mother explicitly approves the request
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

    // Check if this caregiver is already linked (ACTIVE) or already requested (PENDING)
    const existingPairing = await (this.prisma as any).caregiverPairing.findFirst({
      where: {
        motherId: pairing.motherId,
        caregiverId,
        status: { in: ['ACTIVE', 'PENDING'] },
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

    if (existingPairing) {
      if (existingPairing.status === 'ACTIVE') {
        return {
          success: true,
          status: 'ACTIVE',
          message: `You are already connected with ${existingPairing.mother.name}!`,
          pairing: existingPairing,
          mother: {
            name: existingPairing.mother.name,
            email: existingPairing.mother.email,
          },
        };
      }
      return {
        success: true,
        status: 'PENDING',
        message: `Your pairing request is pending approval by ${existingPairing.mother.name}. Please ask her to tap 'Accept' in her app.`,
        pairing: existingPairing,
        mother: {
          name: existingPairing.mother.name,
          email: existingPairing.mother.email,
        },
      };
    }

    // Link caregiver to this pairing record in PENDING status
    const updated = await (this.prisma as any).caregiverPairing.update({
      where: { id: pairing.id },
      data: {
        caregiverId,
        status: 'PENDING',
        relationship: relationship || pairing.relationship || 'Partner / Caregiver',
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

    // Record security audit log
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: 'CAREGIVER_PAIR_REQUEST',
          entity: 'CaregiverPairing',
          entityId: updated.id,
          userId: caregiver.id,
          userName: caregiver.name,
          details: `${caregiver.name} requested caregiver pairing with ${pairing.mother.name}`,
        },
      });
    } catch (e) {
      console.warn('Audit log write error:', e);
    }

    return {
      success: true,
      status: 'PENDING',
      message: `Pairing request submitted! ${pairing.mother.name} must approve your request before you can view her dashboard.`,
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
        status: { in: ['ACTIVE', 'PENDING'] },
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
        status: 'NONE',
        pairing: null,
        mother: null,
      };
    }

    return {
      isPaired: pairing.status === 'ACTIVE',
      status: pairing.status, // 'ACTIVE' or 'PENDING'
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
      include: {
        caregiver: { select: { id: true, name: true } },
        mother: { select: { id: true, name: true } },
      },
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

    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: 'CAREGIVER_REVOKED',
          entity: 'CaregiverPairing',
          entityId: pairingId,
          userId,
          userName: pairing.motherId === userId ? pairing.mother?.name || 'Mother' : pairing.caregiver?.name || 'Caregiver',
          details: `Caregiver access revoked for ${pairing.caregiver?.name || 'Caregiver'}`,
        },
      });
    } catch (e) {
      console.warn('Audit log write error:', e);
    }

    return {
      success: true,
      message: 'Pairing successfully unlinked',
    };
  }

  /**
   * Mother explicitly approves a pending caregiver request
   */
  async acceptPairingRequest(motherId: string, pairingId: string) {
    const pairing = await (this.prisma as any).caregiverPairing.findUnique({
      where: { id: pairingId },
      include: {
        caregiver: {
          select: { id: true, name: true, email: true },
        },
        mother: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!pairing || pairing.motherId !== motherId) {
      throw new ForbiddenException('Unauthorized to approve this pairing request');
    }

    const updated = await (this.prisma as any).caregiverPairing.update({
      where: { id: pairingId },
      data: {
        status: 'ACTIVE',
        pairedAt: new Date(),
      },
    });

    // Record audit log
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: 'CAREGIVER_ACCEPTED',
          entity: 'CaregiverPairing',
          entityId: pairing.id,
          userId: motherId,
          userName: pairing.mother?.name || 'Mother',
          details: `Mother approved caregiver access for ${pairing.caregiver?.name || 'Caregiver'}`,
        },
      });
    } catch (e) {
      console.warn('Audit log write error:', e);
    }

    return {
      success: true,
      message: `Successfully accepted ${pairing.caregiver?.name || 'Caregiver'}! They can now view authorized pregnancy vitals.`,
      pairing: updated,
    };
  }

  /**
   * Mother rejects a pending caregiver request
   */
  async rejectPairingRequest(motherId: string, pairingId: string) {
    const pairing = await (this.prisma as any).caregiverPairing.findUnique({
      where: { id: pairingId },
      include: {
        caregiver: {
          select: { id: true, name: true, email: true },
        },
        mother: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!pairing || pairing.motherId !== motherId) {
      throw new ForbiddenException('Unauthorized to reject this pairing request');
    }

    const updated = await (this.prisma as any).caregiverPairing.update({
      where: { id: pairingId },
      data: {
        status: 'REVOKED',
        caregiverId: null,
      },
    });

    // Record audit log
    try {
      await (this.prisma as any).auditLog.create({
        data: {
          action: 'CAREGIVER_REJECTED',
          entity: 'CaregiverPairing',
          entityId: pairing.id,
          userId: motherId,
          userName: pairing.mother?.name || 'Mother',
          details: `Mother rejected caregiver access request for ${pairing.caregiver?.name || 'Caregiver'}`,
        },
      });
    } catch (e) {
      console.warn('Audit log write error:', e);
    }

    return {
      success: true,
      message: `Pairing request rejected.`,
      pairing: updated,
    };
  }

  /**
   * Retrieve recent security audit logs for caregiver access
   */
  async getAuditLogs(userId: string) {
    const logs = await (this.prisma as any).auditLog.findMany({
      where: {
        entity: 'CaregiverPairing',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      success: true,
      data: logs.map((l: any) => ({
        id: l.id,
        action: l.details || l.action,
        user: l.userName || 'User',
        timeStr: new Date(l.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
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

  // FAMILY TASKS
  async getFamilyTasks(userIdOrIdentifier: string) {
    const user = await (this.prisma as any).user.findFirst({
      where: {
        OR: [{ id: userIdOrIdentifier }, { email: userIdOrIdentifier }],
      },
    });
    if (!user) return { success: true, data: [] };

    let targetMotherId = user.id;
    if (user.role === 'CAREGIVER' || user.role === 'caregiver') {
      const pairing = await (this.prisma as any).caregiverPairing.findFirst({
        where: { caregiverId: user.id, status: 'ACTIVE' },
      });
      if (pairing) targetMotherId = pairing.motherId;
    }

    const tasks = await (this.prisma as any).familyTask.findMany({
      where: { userId: targetMotherId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: tasks,
    };
  }

  async createFamilyTask(userIdOrIdentifier: string, dto: any) {
    const user = await (this.prisma as any).user.findFirst({
      where: {
        OR: [{ id: userIdOrIdentifier }, { email: userIdOrIdentifier }],
      },
    });
    if (!user) throw new NotFoundException('User not found');

    let targetMotherId = user.id;
    if (user.role === 'CAREGIVER' || user.role === 'caregiver') {
      const pairing = await (this.prisma as any).caregiverPairing.findFirst({
        where: { caregiverId: user.id, status: 'ACTIVE' },
      });
      if (pairing) targetMotherId = pairing.motherId;
    }

    const task = await (this.prisma as any).familyTask.create({
      data: {
        userId: targetMotherId,
        title: dto.title,
        assignedTo: dto.assignedTo || 'Partner / Caregiver',
        assignedBy: dto.assignedBy || user.name || 'Mother',
        category: dto.category || 'transport',
        priority: dto.priority || 'medium',
        dueDate: dto.dueDate || 'Today',
        notes: dto.notes || '',
        isCompleted: false,
      },
    });

    return {
      success: true,
      message: 'Family task created successfully',
      data: task,
    };
  }

  async toggleFamilyTask(userIdOrIdentifier: string, taskId: string, completedBy?: string) {
    const existing = await (this.prisma as any).familyTask.findUnique({
      where: { id: taskId },
    });

    if (!existing) {
      throw new NotFoundException('Family task not found');
    }

    const nextCompleted = !existing.isCompleted;
    const updated = await (this.prisma as any).familyTask.update({
      where: { id: taskId },
      data: {
        isCompleted: nextCompleted,
        completedAt: nextCompleted
          ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null,
        completedBy: nextCompleted ? completedBy || 'Caregiver Partner' : null,
      },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async deleteFamilyTask(userIdOrIdentifier: string, taskId: string) {
    const existing = await (this.prisma as any).familyTask.findUnique({
      where: { id: taskId },
    });

    if (!existing) {
      throw new NotFoundException('Family task not found');
    }

    await (this.prisma as any).familyTask.delete({
      where: { id: taskId },
    });

    return {
      success: true,
      message: 'Family task deleted successfully',
    };
  }
}
