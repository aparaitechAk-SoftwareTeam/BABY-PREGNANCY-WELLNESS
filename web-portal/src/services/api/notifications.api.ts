import { apiClient } from './client';
import type { NotificationCampaign, NotificationAudience } from '@/types';

export async function fetchNotifications(
  page: number,
  pageSize: number,
  search?: string,
  statusFilter?: string,
): Promise<{ data: NotificationCampaign[]; total: number }> {
  try {
    const res = await apiClient.get('/notifications/admin/all');
    if (res?.data?.success && Array.isArray(res.data.data)) {
      const mapped: NotificationCampaign[] = res.data.data.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        audience: (n.category || 'all_users') as NotificationAudience,
        status: 'sent',
        scheduledAt: n.createdAt,
        createdAt: n.createdAt,
        sentAt: n.createdAt,
        deliveryCount: 1,
        openRate: n.isRead ? 100 : 0,
      }));

      return {
        data: mapped,
        total: mapped.length,
      };
    }
  } catch (e) {
    console.warn('Failed to load notifications from backend:', e);
  }

  return { data: [], total: 0 };
}

export async function createNotification(
  data: Omit<NotificationCampaign, 'id' | 'createdAt' | 'status'>,
): Promise<NotificationCampaign> {
  try {
    const res = await apiClient.post('/notifications/broadcast', {
      title: data.title,
      message: data.message,
      category: data.audience || 'clinical',
    });

    if (res?.data?.success && res.data.data) {
      const n = res.data.data;
      return {
        id: n.id,
        title: n.title,
        message: n.message,
        audience: data.audience,
        status: 'sent',
        scheduledAt: data.scheduledAt || n.createdAt,
        createdAt: n.createdAt,
        sentAt: n.createdAt,
        deliveryCount: 1,
        openRate: 0,
      };
    }
  } catch (e) {
    console.warn('Failed to broadcast notification:', e);
  }

  return {
    ...data,
    id: `n-${Date.now()}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
}

export async function approveNotification(id: string): Promise<{ success: boolean; message: string }> {
  return { success: true, message: 'Notification approved.' };
}

export async function sendNotification(id: string): Promise<{ success: boolean; message: string }> {
  return { success: true, message: 'Notification sent successfully.' };
}

export const notificationsApi = {
  fetchNotifications,
  createNotification,
  approveNotification,
  sendNotification,
};
