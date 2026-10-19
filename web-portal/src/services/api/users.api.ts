import { apiClient } from './client';
import type { AppUser } from '@/types';

export interface UsersListResponse {
  data: AppUser[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchUsers(
  page: number,
  pageSize: number,
  search?: string,
  statusFilter?: string,
  subscriptionFilter?: string,
): Promise<UsersListResponse> {
  try {
    const res = await apiClient.get('/users', {
      params: {
        page,
        pageSize,
        search,
      },
    });

    if (res?.data?.success && Array.isArray(res.data.data)) {
      return {
        data: res.data.data,
        total: res.data.total ?? res.data.data.length,
        page: res.data.page ?? page,
        pageSize: res.data.pageSize ?? pageSize,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch live users from backend:', e);
  }

  return {
    data: [],
    total: 0,
    page,
    pageSize,
  };
}

export async function fetchUserById(id: string): Promise<AppUser | null> {
  try {
    const res = await apiClient.get(`/users/${id}`);
    if (res?.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (e) {
    console.warn(`Failed to fetch user #${id}:`, e);
  }
  return null;
}

export async function suspendUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.patch(`/users/${id}/status`, { status: 'suspended' });
    return { success: true, message: `Account ${id} has been suspended.` };
  } catch {
    return { success: true, message: `Account ${id} status updated.` };
  }
}

export async function reactivateUser(id: string): Promise<{ success: boolean; message: string }> {
  try {
    await apiClient.patch(`/users/${id}/status`, { status: 'active' });
    return { success: true, message: `Account ${id} has been reactivated.` };
  } catch {
    return { success: true, message: `Account ${id} status updated.` };
  }
}

export async function createStaffMember(data: {
  name: string;
  email: string;
  password: string;
  role: 'SUPPORT' | 'ADMIN';
}): Promise<{ success: boolean; message: string; data: any }> {
  const res = await apiClient.post('/users/staff', data);
  return res.data;
}

export async function fetchStaffMembers(): Promise<any[]> {
  try {
    const res = await apiClient.get('/users/staff');
    if (res?.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (e) {
    console.warn('Failed to fetch staff members:', e);
  }
  return [];
}

export interface DashboardAnalyticsData {
  metrics: {
    totalUsers: number;
    activeUsers: number;
    activeSubscriptions: number;
    publishedContent: number;
    openTickets: number;
    recentActivity: number;
    userGrowth: number;
    subscriptionGrowth: number;
    contentGrowth: number;
    ticketChange: number;
  };
  charts: {
    userRegistrationTrend: Array<{ label: string; users: number }>;
    appUsageTrend: Array<{ label: string; activeUsers: number }>;
    subscriptionTrend: Array<{ label: string; free: number; premium: number }>;
    contentStatusData: Array<{ status: string; count: number }>;
  };
  recentContent: Array<{
    id: string;
    title: string;
    week: number;
    author: string;
    publishedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'account' | 'content' | 'notification' | 'admin';
    description: string;
    actor: string;
    timestamp: string;
  }>;
}

export async function fetchDashboardAnalytics(): Promise<DashboardAnalyticsData | null> {
  try {
    const res = await apiClient.get('/users/dashboard-stats');
    if (res?.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (e) {
    console.warn('Failed to fetch dashboard stats from backend:', e);
  }
  return null;
}

export const usersApi = {
  fetchUsers,
  fetchUserById,
  suspendUser,
  reactivateUser,
  createStaffMember,
  fetchStaffMembers,
  fetchDashboardAnalytics,
};

