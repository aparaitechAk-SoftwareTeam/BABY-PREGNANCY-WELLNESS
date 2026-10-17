import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: { page?: number; pageSize?: number; search?: string; role?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 20);
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (query.search) {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.role && query.role !== 'all') {
      where.role = query.role.toUpperCase();
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: true,
        },
      }),
    ]);

    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        displayName: u.name,
        email: u.email,
        role: u.role,
        isEmailVerified: u.isEmailVerified,
        isProfileCompleted: u.isProfileCompleted,
        registrationDate: u.createdAt.toISOString(),
        lastActiveDate: u.updatedAt.toISOString(),
        accountStatus: 'active',
        subscriptionStatus: 'free',
        weekOfPregnancy: u.profile?.currentWeek || 1,
        dueDate: u.profile?.dueDate ? u.profile.dueDate.toISOString() : null,
        bloodGroup: u.profile?.bloodGroup || null,
        currentWeight: u.profile?.currentWeight || null,
      })),
      total,
      page,
      pageSize,
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        waterLogs: { take: 5, orderBy: { createdAt: 'desc' } },
        weightLogs: { take: 5, orderBy: { createdAt: 'desc' } },
        appointments: { take: 5, orderBy: { createdAt: 'desc' } },
        stepLogs: { take: 7, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      success: true,
      data: {
        id: user.id,
        displayName: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isProfileCompleted: user.isProfileCompleted,
        registrationDate: user.createdAt.toISOString(),
        lastActiveDate: user.updatedAt.toISOString(),
        profile: user.profile,
        recentWater: user.waterLogs,
        recentWeight: user.weightLogs,
        recentAppointments: user.appointments,
        recentSteps: user.stepLogs,
      },
    };
  }

  async getUserStats() {
    const [totalUsers, mothers, caregivers, partners, admins] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'MOTHER' } }),
      this.prisma.user.count({ where: { role: 'CAREGIVER' } }),
      this.prisma.user.count({ where: { role: 'PARTNER' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        mothers,
        caregivers,
        partners,
        admins,
      },
    };
  }
}
