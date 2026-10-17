import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId?: string) {
    const whereClause: any = userId
      ? {
          OR: [{ userId: null }, { userId }],
        }
      : {};

    const records = await (this.prisma as any).notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = records.filter((n: any) => !n.isRead).length;

    return {
      success: true,
      data: records,
      unreadCount,
    };
  }

  async markAsRead(id: string) {
    const updated = await (this.prisma as any).notification.update({
      where: { id },
      data: { isRead: true },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async markAllAsRead(userId?: string) {
    const whereClause: any = userId ? { OR: [{ userId: null }, { userId }] } : {};

    await (this.prisma as any).notification.updateMany({
      where: whereClause,
      data: { isRead: true },
    });

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  async createNotification(dto: {
    userId?: string;
    title: string;
    message: string;
    category?: string;
    actionRoute?: string;
    emoji?: string;
    badgeColor?: string;
  }) {
    const record = await (this.prisma as any).notification.create({
      data: {
        userId: dto.userId || null,
        title: dto.title,
        message: dto.message,
        category: dto.category || 'clinical',
        actionRoute: dto.actionRoute || null,
        emoji: dto.emoji || '🌸',
        badgeColor: dto.badgeColor || '#E11D48',
      },
    });

    return {
      success: true,
      data: record,
    };
  }
}
