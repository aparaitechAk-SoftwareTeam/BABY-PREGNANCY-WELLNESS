import { API_BASE_URL } from '@/constants';
import { mockSubscriptionPlans } from '@/mocks/admin.mock';
import type { SubscriptionPlan } from '@/types';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  await delay(400);
  return mockSubscriptionPlans;
}

export const subscriptionsApi = {
  fetchSubscriptionPlans,
};
