export type UserRole = 'admin' | 'support_agent';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
}

export type AccountStatus = 'active' | 'suspended' | 'pending';
export type SubscriptionStatus = 'free' | 'premium' | 'expired';

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  registrationDate: string;
  lastActiveDate: string;
  accountStatus: AccountStatus;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: string;
  weekOfPregnancy?: number;
}

export type ContentStatus = 'draft' | 'review' | 'published';
export type ContentType = 'baby_development' | 'wellness' | 'general';

export interface PregnancyContent {
  id: string;
  title: string;
  week: number;
  type: ContentType;
  status: ContentStatus;
  author: string;
  source: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  body: string;
  summary: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'published' | 'unpublished';
  createdAt: string;
  updatedAt: string;
}

export type AnnouncementStatus = 'draft' | 'published';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'failed';
export type NotificationAudience = 'all_users' | 'premium_users' | 'free_users' | 'specific_week';

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  status: NotificationStatus;
  scheduledAt: string;
  sentAt?: string;
  deliveryCount?: number;
  openRate?: number;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  activeCount: number;
}

export type TicketStatus = 'open' | 'awaiting_response' | 'resolved' | 'unassigned' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'login' | 'notifications' | 'billing' | 'app_usage' | 'account' | 'content' | 'technical' | 'other';

export interface SupportTicket {
  id: string;
  subject: string;
  user: string;
  userEmail: string;
  userId: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedAgent?: string;
  assignedAgentId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  escalated?: boolean;
  escalationReason?: string;
}

export type MessageAuthorRole = 'user' | 'agent' | 'system';

export interface TicketMessage {
  id: string;
  ticketId: string;
  author: string;
  authorRole: MessageAuthorRole;
  content: string;
  timestamp: string;
  isInternal: boolean;
}

export interface HelpCenterArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  views: number;
}

export interface Escalation {
  id: string;
  ticketId: string;
  ticketSubject: string;
  reason: string;
  escalatedBy: string;
  escalatedAt: string;
  status: 'pending' | 'reviewing' | 'resolved';
  priority: TicketPriority;
}

export interface SupportNotification {
  id: string;
  title: string;
  message: string;
  type: 'ticket_assigned' | 'ticket_updated' | 'escalation' | 'system';
  read: boolean;
  timestamp: string;
  ticketId?: string;
}

export interface AuditLog {
  id: string;
  adminUser: string;
  action: string;
  targetRecord: string;
  timestamp: string;
  result: 'success' | 'failure';
  details: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: string[];
  assignedAt: string;
}

export interface DashboardMetrics {
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
}

export interface TrendPoint {
  label: string;
  users?: number;
  activeUsers?: number;
  subscriptions?: number;
  free?: number;
  premium?: number;
}

export interface ContentStatusPoint {
  status: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  type: 'account' | 'content' | 'notification' | 'admin';
  description: string;
  actor: string;
  timestamp: string;
}
