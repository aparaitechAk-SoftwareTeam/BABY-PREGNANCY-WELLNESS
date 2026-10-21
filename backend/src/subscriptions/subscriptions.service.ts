import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

const INITIAL_PLANS = [
  {
    code: 'free',
    name: 'Free Starter Plan',
    price: 0,
    billingCycle: 'monthly',
    features: [
      'Week-by-week fetal growth updates',
      'Daily water & kick tracker',
      'Basic pregnancy health articles',
      'Medical emergency SOS triggers',
    ],
  },
  {
    code: 'premium_monthly',
    name: 'Maternal Premium (Monthly)',
    price: 9.99,
    billingCycle: 'monthly',
    features: [
      'All Free features included',
      'Unrestricted Partner & Caregiver real-time sync',
      '24/7 Obstetric AI guidance',
      'Clinical contraction timer & smart birth plan exporter',
      'Medical records vault & PDF clinic sharing',
    ],
  },
  {
    code: 'premium_yearly',
    name: 'Maternal Premium (Annual / Full Trimester Journey)',
    price: 89.99,
    billingCycle: 'yearly',
    features: [
      'Full 40-week complete pregnancy journey coverage',
      'Includes 3 postpartum recovery months',
      'Priority triage support & fast escalation',
      'Dedicated birth companion checklist',
    ],
  },
];

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedPlansIfEmpty();
  }

  private async seedPlansIfEmpty() {
    try {
      for (const p of INITIAL_PLANS) {
        const existing = await (this.prisma as any).subscriptionPlan.findUnique({
          where: { code: p.code },
        });
        if (!existing) {
          await (this.prisma as any).subscriptionPlan.create({
            data: p,
          });
        }
      }
    } catch (e) {
      // quiet fallback
    }
  }

  /**
   * 1. GET ALL SUBSCRIPTION PLANS DIRECTLY FROM DATABASE
   * Includes real-time count of active subscriptions for each plan
   */
  async getPlans() {
    const plans = await (this.prisma as any).subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    const results = await Promise.all(
      plans.map(async (plan: any) => {
        const activeCount = await (this.prisma as any).subscription.count({
          where: {
            planId: plan.id,
            status: 'ACTIVE',
          },
        });

        return {
          id: plan.id,
          code: plan.code,
          name: plan.name,
          price: plan.price,
          billingCycle: plan.billingCycle,
          features: plan.features || [],
          activeCount,
          isActive: plan.isActive,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        };
      }),
    );

    return {
      success: true,
      data: results,
    };
  }

  /**
   * 2. REALTIME SUBSCRIPTION STATS DIRECTLY FROM NEON DATABASE
   */
  async getStats() {
    const [totalActive, paidActive, freeActive, totalSubscribers, allSubscriptions] = await Promise.all([
      (this.prisma as any).subscription.count({
        where: { status: 'ACTIVE' },
      }),
      (this.prisma as any).subscription.count({
        where: {
          status: 'ACTIVE',
          plan: { price: { gt: 0 } },
        },
      }),
      (this.prisma as any).subscription.count({
        where: {
          status: 'ACTIVE',
          plan: { price: 0 },
        },
      }),
      (this.prisma as any).subscription.count(),
      (this.prisma as any).subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
    ]);

    // Calculate real monthly revenue estimate from active paid subscriptions
    const monthlyRevenue = allSubscriptions.reduce((sum: number, sub: any) => {
      const price = sub.plan?.price || 0;
      if (price <= 0) return sum;
      if (sub.plan?.billingCycle === 'yearly') {
        return sum + price / 12;
      }
      return sum + price;
    }, 0);

    return {
      success: true,
      data: {
        totalActive,
        paidActive,
        freeActive,
        totalSubscribers,
        monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      },
    };
  }

  /**
   * 3. LIST ALL SUBSCRIPTIONS (ADMIN CONSOLE)
   */
  async listSubscriptions(query?: {
    status?: string;
    planId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = {};
    if (query?.status && query.status !== 'all') {
      where.status = query.status.toUpperCase();
    }
    if (query?.planId && query.planId !== 'all') {
      where.planId = query.planId;
    }
    if (query?.search) {
      where.user = {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const page = Number(query?.page) || 1;
    const pageSize = Number(query?.pageSize) || 20;

    const [items, total] = await Promise.all([
      (this.prisma as any).subscription.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      (this.prisma as any).subscription.count({ where }),
    ]);

    return {
      success: true,
      data: items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 4. ASSIGN OR ACTIVATE SUBSCRIPTION FOR A USER (ADMIN / SYSTEM)
   */
  async assignSubscription(dto: {
    userId: string;
    planId?: string;
    planCode?: string;
    durationDays?: number;
    amountPaid?: number;
    paymentProvider?: string;
    paymentId?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found.`);
    }

    let plan: any;
    if (dto.planId) {
      plan = await (this.prisma as any).subscriptionPlan.findUnique({
        where: { id: dto.planId },
      });
    } else if (dto.planCode) {
      plan = await (this.prisma as any).subscriptionPlan.findUnique({
        where: { code: dto.planCode },
      });
    }

    if (!plan) {
      throw new NotFoundException('Subscription plan not found.');
    }

    // Deactivate any previous active subscriptions for this user
    await (this.prisma as any).subscription.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELED',
        updatedAt: new Date(),
      },
    });

    const startDate = new Date();
    const durationDays = dto.durationDays || (plan.billingCycle === 'yearly' ? 365 : 30);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const created = await (this.prisma as any).subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
        autoRenew: true,
        amountPaid: dto.amountPaid !== undefined ? dto.amountPaid : plan.price,
        paymentProvider: dto.paymentProvider || 'MANUAL',
        paymentId: dto.paymentId || `admin-${Date.now()}`,
      },
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      success: true,
      data: created,
    };
  }

  /**
   * 5. CANCEL SUBSCRIPTION
   */
  async cancelSubscription(id: string) {
    const sub = await (this.prisma as any).subscription.findUnique({
      where: { id },
    });
    if (!sub) {
      throw new NotFoundException(`Subscription ${id} not found.`);
    }

    const updated = await (this.prisma as any).subscription.update({
      where: { id },
      data: {
        status: 'CANCELED',
        autoRenew: false,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updated,
    };
  }
}
