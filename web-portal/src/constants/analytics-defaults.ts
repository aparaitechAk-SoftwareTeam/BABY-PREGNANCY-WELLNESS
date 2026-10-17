import type {
  DashboardMetrics,
  TrendPoint,
  ContentStatusPoint,
  ActivityItem,
} from '@/types';

export const DEFAULT_DASHBOARD_METRICS: DashboardMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  activeSubscriptions: 0,
  publishedContent: 40,
  openTickets: 0,
  recentActivity: 12,
  userGrowth: 100,
  subscriptionGrowth: 0,
  contentGrowth: 100,
  ticketChange: 0,
};

export const USER_REGISTRATION_TREND: TrendPoint[] = [
  { label: 'May', users: 12 },
  { label: 'Jun', users: 28 },
  { label: 'Jul', users: 64 },
  { label: 'Aug', users: 110 },
  { label: 'Sep', users: 185 },
  { label: 'Oct', users: 260 },
];

export const APP_USAGE_TREND: TrendPoint[] = [
  { label: 'Mon', activeUsers: 45 },
  { label: 'Tue', activeUsers: 62 },
  { label: 'Wed', activeUsers: 58 },
  { label: 'Thu', activeUsers: 84 },
  { label: 'Fri', activeUsers: 95 },
  { label: 'Sat', activeUsers: 72 },
  { label: 'Sun', activeUsers: 68 },
];

export const SUBSCRIPTION_TREND: TrendPoint[] = [
  { label: 'May', free: 12, premium: 0 },
  { label: 'Jun', free: 24, premium: 4 },
  { label: 'Jul', free: 52, premium: 12 },
  { label: 'Aug', free: 88, premium: 22 },
  { label: 'Sep', free: 145, premium: 40 },
  { label: 'Oct', free: 198, premium: 62 },
];

export const CONTENT_STATUS_DATA: ContentStatusPoint[] = [
  { status: 'Published', count: 40 },
  { status: 'In Review', count: 5 },
  { status: 'Draft', count: 2 },
];

export const PLATFORM_ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'admin',
    description: 'System synchronized with Neon PostgreSQL live database',
    actor: 'System Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'act-002',
    type: 'content',
    description: '40-week clinical guidance verified and indexed for mothers',
    actor: 'Obstetric Care Team',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'act-003',
    type: 'notification',
    description: 'Automated maternal milestone alerts configured',
    actor: 'System Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'act-004',
    type: 'account',
    description: 'Caregiver real-time sync channel initialized',
    actor: 'System Admin',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const RECENT_PUBLISHED_CONTENT = [
  {
    id: 'c-001',
    title: 'First Trimester: Crucial Milestones & Nutrition',
    week: 8,
    author: 'Obstetric Care Specialist',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'c-002',
    title: 'Second Trimester: Baby Movement & Maternal Comfort',
    week: 20,
    author: 'Obstetric Care Specialist',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'c-003',
    title: 'Third Trimester: Hospital Bag & Birth Planning',
    week: 36,
    author: 'Obstetric Care Specialist',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const RECENT_NOTIFICATION_CAMPAIGNS = [
  {
    id: 'n-001',
    title: 'Hydration & Daily Wellness Reminders',
    audience: 'All Active Mothers',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    deliveryCount: 150,
  },
  {
    id: 'n-002',
    title: 'Weekly Fetal Development Alert',
    audience: 'Week 12-28 Mothers',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    deliveryCount: 85,
  },
];
