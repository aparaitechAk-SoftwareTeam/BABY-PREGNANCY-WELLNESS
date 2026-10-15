import { API_BASE_URL } from '@/constants';
import { mockNotifications } from '@/mocks/content.mock';
import type { NotificationCampaign, NotificationAudience } from '@/types';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchNotifications(
  page: number,
  pageSize: number,
  search?: string,
  statusFilter?: string,
): Promise<{ data: NotificationCampaign[]; total: number }> {
  await delay(400);
  let filtered = [...mockNotifications];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
  }
  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((n) => n.status === statusFilter);
  }
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return { data: filtered.slice(start, start + pageSize), total };
}

export async function createNotification(
  data: Omit<NotificationCampaign, 'id' | 'createdAt' | 'status'>,
): Promise<NotificationCampaign> {
  await delay(600);
  const newNotification: NotificationCampaign = {
    ...data,
    id: `n-${String(mockNotifications.length + 1).padStart(3, '0')}`,
    status: 'draft',
    createdAt: new Date().toISOString(),
  };
  mockNotifications.unshift(newNotification);
  return newNotification;
}

export async function approveNotification(id: string): Promise<{ success: boolean; message: string }> {
  await delay(400);
  const n = mockNotifications.find((n) => n.id === id);
  if (n) {
    n.status = 'approved';
    return { success: true, message: 'Notification approved.' };
  }
  return { success: false, message: 'Notification not found.' };
}

export async function sendNotification(id: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  const n = mockNotifications.find((n) => n.id === id);
  if (n) {
    n.status = 'sent';
    n.sentAt = new Date().toISOString();
    n.deliveryCount = Math.floor(Math.random() * 5000) + 500;
    n.openRate = Math.floor(Math.random() * 30) + 50;
    return { success: true, message: 'Notification sent successfully.' };
  }
  return { success: false, message: 'Notification not found.' };
}

export const notificationsApi = {
  fetchNotifications,
  createNotification,
  approveNotification,
  sendNotification,
};
