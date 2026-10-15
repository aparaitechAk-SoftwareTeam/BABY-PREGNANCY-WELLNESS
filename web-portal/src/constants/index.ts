import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  HelpCircle,
  Megaphone,
  Bell,
  LifeBuoy,
  CreditCard,
  ScrollText,
  ShieldCheck,
  Settings,
  Inbox,
  Ticket,
  UserCircle,
  AlertTriangle,
  Headphones,
  UserCog,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'User Management', path: '/users', icon: Users },
  { label: 'Pregnancy Content', path: '/content', icon: BookOpen },
  { label: 'Week-by-Week Content', path: '/content/week-by-week', icon: CalendarDays },
  { label: 'FAQ Management', path: '/faqs', icon: HelpCircle },
  { label: 'Announcements', path: '/announcements', icon: Megaphone },
  { label: 'Notification Management', path: '/notifications', icon: Bell },
  { label: 'Support Overview', path: '/support', icon: LifeBuoy, roles: ['admin', 'support_agent'] },
  { label: 'Subscription Management', path: '/subscriptions', icon: CreditCard },
  { label: 'Audit Logs', path: '/audit', icon: ScrollText, roles: ['admin'] },
  { label: 'Role & Permission Management', path: '/roles', icon: ShieldCheck, roles: ['admin'] },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export const SUPPORT_NAV_ITEMS: NavItem[] = [
  { label: 'Support Overview', path: '/support-team', icon: LifeBuoy },
  { label: 'All Tickets', path: '/support-team/tickets', icon: Inbox },
  { label: 'My Tickets', path: '/support-team/my-tickets', icon: Ticket },
  { label: 'Unassigned Tickets', path: '/support-team/unassigned', icon: AlertTriangle },
  { label: 'Escalations', path: '/support-team/escalations', icon: AlertTriangle },
  { label: 'User Lookup', path: '/support-team/user-lookup', icon: UserCircle },
  { label: 'Help Center', path: '/support-team/help-center', icon: Headphones },
  { label: 'Notifications', path: '/support-team/notifications', icon: Bell },
  { label: 'My Profile', path: '/support-team/profile', icon: UserCog },
];

export const DEMO_ADMIN_CREDENTIALS = {
  admin: { email: 'admin@aparaitech.com', password: 'admin123' },
  support: { email: 'support@aparaitech.com', password: 'support123' },
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const FAQ_CATEGORIES = [
  'Pregnancy Basics',
  'Nutrition',
  'Exercise',
  'Mental Health',
  'Baby Development',
  'Labor & Delivery',
  'Postpartum',
  'Account & Billing',
];

export const CONTENT_TYPES = [
  { value: 'baby_development', label: 'Baby Development' },
  { value: 'wellness', label: 'General Wellness' },
  { value: 'general', label: 'General' },
];

export const NOTIFICATION_AUDIENCES = [
  { value: 'all_users', label: 'All Users' },
  { value: 'premium_users', label: 'Premium Users' },
  { value: 'free_users', label: 'Free Users' },
  { value: 'specific_week', label: 'Specific Week' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const TICKET_CATEGORIES = [
  { value: 'login', label: 'Login & Authentication' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'billing', label: 'Billing & Subscriptions' },
  { value: 'app_usage', label: 'App Usage' },
  { value: 'account', label: 'Account Issues' },
  { value: 'content', label: 'Content Issues' },
  { value: 'technical', label: 'Technical Problems' },
  { value: 'other', label: 'Other' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const TICKET_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'awaiting_response', label: 'Awaiting Response' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'escalated', label: 'Escalated' },
];

export const HELP_CENTER_CATEGORIES = [
  'Getting Started',
  'Account & Login',
  'Notifications',
  'Billing & Subscriptions',
  'App Troubleshooting',
  'Content & Features',
  'Privacy & Security',
];

export const SUPPORT_AGENTS = [
  { id: 'admin-003', name: 'Maria Garcia' },
  { id: 'admin-004', name: 'Alex Lee' },
  { id: 'admin-005', name: 'Jamie Taylor' },
];
