import type { SubscriptionPlan } from '@/types';

export const OFFICIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-free',
    name: 'Free Starter Plan',
    price: 0,
    billingCycle: 'monthly',
    features: [
      'Week-by-week fetal growth updates',
      'Daily water & kick tracker',
      'Basic pregnancy health articles',
      'Medical emergency SOS triggers',
    ],
    activeCount: 0,
  },
  {
    id: 'plan-premium-monthly',
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
    activeCount: 0,
  },
  {
    id: 'plan-premium-yearly',
    name: 'Maternal Premium (Annual / Full Trimester Journey)',
    price: 89.99,
    billingCycle: 'yearly',
    features: [
      'Full 40-week complete pregnancy journey coverage',
      'Includes 3 postpartum recovery months',
      'Priority triage support & fast escalation',
      'Dedicated birth companion checklist',
    ],
    activeCount: 0,
  },
];

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return OFFICIAL_SUBSCRIPTION_PLANS;
}

export const subscriptionsApi = {
  fetchSubscriptionPlans,
};
