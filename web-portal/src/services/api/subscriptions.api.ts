import { apiClient } from './client';
import type { SubscriptionPlan } from '@/types';

export interface SubscriptionStats {
  totalActive: number;
  paidActive: number;
  freeActive: number;
  totalSubscribers: number;
  monthlyRevenue: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  planId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  startDate: string;
  endDate?: string | null;
  autoRenew: boolean;
  amountPaid: number;
  paymentProvider?: string;
  paymentId?: string;
  createdAt: string;
}

/**
 * 1. Fetch Subscription Plans directly from Neon PostgreSQL Database
 */
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const res = await apiClient.get('/subscriptions/plans');
    if (res?.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        billingCycle: p.billingCycle || 'monthly',
        features: p.features || [],
        activeCount: p.activeCount || 0,
      }));
    }
  } catch (e) {
    console.warn('Failed to fetch subscription plans from database:', e);
  }
  return [];
}

/**
 * 2. Fetch Realtime Subscription Stats from Neon Database
 */
export async function fetchSubscriptionStats(): Promise<SubscriptionStats | null> {
  try {
    const res = await apiClient.get('/subscriptions/stats');
    if (res?.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (e) {
    console.warn('Failed to fetch subscription stats from database:', e);
  }
  return null;
}

/**
 * 3. List all Subscriptions from Neon Database
 */
export async function fetchSubscriptionsList(params?: {
  status?: string;
  planId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: UserSubscription[]; total: number }> {
  try {
    const res = await apiClient.get('/subscriptions/list', { params });
    if (res?.data?.success && Array.isArray(res.data.data)) {
      return {
        data: res.data.data,
        total: res.data.total || res.data.data.length,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch subscriptions list from database:', e);
  }
  return { data: [], total: 0 };
}

/**
 * 4. Assign / Activate Subscription for a User
 */
export async function assignSubscription(dto: {
  userId: string;
  planId?: string;
  planCode?: string;
  durationDays?: number;
  amountPaid?: number;
}): Promise<any> {
  const res = await apiClient.post('/subscriptions/admin/assign', dto);
  return res?.data?.data;
}

/**
 * 5. Cancel a Subscription
 */
export async function cancelSubscription(id: string): Promise<any> {
  const res = await apiClient.post(`/subscriptions/admin/cancel/${id}`);
  return res?.data?.data;
}

export const subscriptionsApi = {
  fetchSubscriptionPlans,
  fetchSubscriptionStats,
  fetchSubscriptionsList,
  assignSubscription,
  cancelSubscription,
};
