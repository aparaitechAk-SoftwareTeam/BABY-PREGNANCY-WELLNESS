import type {
  DashboardMetrics,
  TrendPoint,
  ContentStatusPoint,
  ActivityItem,
} from '@/types';

export const dashboardMetrics: DashboardMetrics = {
  totalUsers: 12483,
  activeUsers: 8291,
  activeSubscriptions: 4102,
  publishedContent: 186,
  openTickets: 23,
  recentActivity: 47,
  userGrowth: 12.5,
  subscriptionGrowth: 8.3,
  contentGrowth: 15.2,
  ticketChange: -5.0,
};

export const userRegistrationTrend: TrendPoint[] = [
  { label: 'Jan', users: 9800 },
  { label: 'Feb', users: 10120 },
  { label: 'Mar', users: 10560 },
  { label: 'Apr', users: 10900 },
  { label: 'May', users: 11200 },
  { label: 'Jun', users: 11580 },
  { label: 'Jul', users: 11890 },
  { label: 'Aug', users: 12100 },
  { label: 'Sep', users: 12300 },
  { label: 'Oct', users: 12483 },
];

export const appUsageTrend: TrendPoint[] = [
  { label: 'Mon', activeUsers: 6200 },
  { label: 'Tue', activeUsers: 7100 },
  { label: 'Wed', activeUsers: 6800 },
  { label: 'Thu', activeUsers: 7500 },
  { label: 'Fri', activeUsers: 8291 },
  { label: 'Sat', activeUsers: 5400 },
  { label: 'Sun', activeUsers: 4800 },
];

export const subscriptionTrend: TrendPoint[] = [
  { label: 'Jan', free: 6200, premium: 3600 },
  { label: 'Feb', free: 6350, premium: 3770 },
  { label: 'Mar', free: 6480, premium: 4080 },
  { label: 'Apr', free: 6590, premium: 4310 },
  { label: 'May', free: 6700, premium: 4500 },
  { label: 'Jun', free: 6810, premium: 4770 },
  { label: 'Jul', free: 6900, premium: 4990 },
  { label: 'Aug', free: 7000, premium: 5100 },
  { label: 'Sep', free: 7100, premium: 5200 },
  { label: 'Oct', free: 7200, premium: 5283 },
];

export const contentStatusData: ContentStatusPoint[] = [
  { status: 'Published', count: 186 },
  { status: 'In Review', count: 14 },
  { status: 'Draft', count: 28 },
];

export const recentActivityItems: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'account',
    description: 'Suspended user account for policy violation',
    actor: 'Admin Sarah Chen',
    timestamp: '2026-10-11T09:30:00Z',
  },
  {
    id: 'act-002',
    type: 'content',
    description: 'Published article "Week 24: Baby Development Milestones"',
    actor: 'Admin James Wilson',
    timestamp: '2026-10-11T08:15:00Z',
  },
  {
    id: 'act-003',
    type: 'notification',
    description: 'Launched notification campaign "Flu Season Wellness Tips"',
    actor: 'Admin Sarah Chen',
    timestamp: '2026-10-10T16:45:00Z',
  },
  {
    id: 'act-004',
    type: 'admin',
    description: 'Updated role permissions for Support Agent role',
    actor: 'Admin James Wilson',
    timestamp: '2026-10-10T14:20:00Z',
  },
  {
    id: 'act-005',
    type: 'account',
    description: 'Reactivated user account after verification',
    actor: 'Admin Sarah Chen',
    timestamp: '2026-10-10T11:10:00Z',
  },
  {
    id: 'act-006',
    type: 'content',
    description: 'Submitted article "Third Trimester Wellness Guide" for review',
    actor: 'Editor Maria Garcia',
    timestamp: '2026-10-10T09:00:00Z',
  },
  {
    id: 'act-007',
    type: 'notification',
    description: 'Scheduled notification campaign for Week 20 users',
    actor: 'Admin James Wilson',
    timestamp: '2026-10-09T15:30:00Z',
  },
  {
    id: 'act-008',
    type: 'admin',
    description: 'Created new FAQ category "Postpartum Care"',
    actor: 'Admin Sarah Chen',
    timestamp: '2026-10-09T13:00:00Z',
  },
];

export const publishedContentRecent = [
  {
    id: 'c-001',
    title: 'Week 24: Baby Development Milestones',
    week: 24,
    author: 'James Wilson',
    publishedAt: '2026-10-11T08:15:00Z',
  },
  {
    id: 'c-002',
    title: 'Nutrition Guide: Second Trimester Essentials',
    week: 18,
    author: 'Maria Garcia',
    publishedAt: '2026-10-09T10:00:00Z',
  },
  {
    id: 'c-003',
    title: 'Gentle Exercises for Each Trimester',
    week: 0,
    author: 'James Wilson',
    publishedAt: '2026-10-07T14:30:00Z',
  },
  {
    id: 'c-004',
    title: 'Understanding Your Changing Body: Week 16',
    week: 16,
    author: 'Maria Garcia',
    publishedAt: '2026-10-05T09:45:00Z',
  },
];

export const notificationCampaignsRecent = [
  {
    id: 'n-001',
    title: 'Flu Season Wellness Tips',
    audience: 'All Users',
    sentAt: '2026-10-10T16:45:00Z',
    deliveryCount: 12483,
  },
  {
    id: 'n-002',
    title: 'Premium Feature: Personalized Meal Plans',
    audience: 'Premium Users',
    sentAt: '2026-10-08T12:00:00Z',
    deliveryCount: 4102,
  },
  {
    id: 'n-003',
    title: 'Week 20 Checkpoint Reminder',
    audience: 'Specific Week',
    sentAt: '2026-10-07T08:00:00Z',
    deliveryCount: 348,
  },
];
