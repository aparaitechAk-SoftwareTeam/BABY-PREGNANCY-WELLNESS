import type { Permission, RoleAssignment } from '@/types';

export const SYSTEM_PERMISSIONS: Permission[] = [
  { id: 'p-001', name: 'view_users', description: 'View user accounts', module: 'User Management' },
  { id: 'p-002', name: 'suspend_users', description: 'Suspend and reactivate user accounts', module: 'User Management' },
  { id: 'p-003', name: 'manage_content', description: 'Create, edit, and publish content', module: 'Content Management' },
  { id: 'p-004', name: 'review_content', description: 'Review and approve submitted content', module: 'Content Management' },
  { id: 'p-005', name: 'manage_faqs', description: 'Create, edit, and publish FAQs', module: 'FAQ Management' },
  { id: 'p-006', name: 'manage_announcements', description: 'Create and publish announcements', module: 'Announcements' },
  { id: 'p-007', name: 'manage_notifications', description: 'Create and send notification campaigns', module: 'Notifications' },
  { id: 'p-008', name: 'approve_notifications', description: 'Approve pending notification campaigns', module: 'Notifications' },
  { id: 'p-009', name: 'view_subscriptions', description: 'View subscription data and statistics', module: 'Subscriptions' },
  { id: 'p-010', name: 'view_support', description: 'View support ticket overview', module: 'Support' },
  { id: 'p-011', name: 'view_audit_logs', description: 'View audit logs', module: 'Audit Logs' },
  { id: 'p-012', name: 'manage_roles', description: 'Manage role assignments and permissions', module: 'Role Management' },
  { id: 'p-013', name: 'manage_settings', description: 'Manage application settings', module: 'Settings' },
];

export const INITIAL_ROLE_ASSIGNMENTS: RoleAssignment[] = [
  {
    id: 'ra-001',
    userId: 'admin-001',
    email: 'admin@aparaitech.com',
    displayName: 'AparaiTech Admin',
    role: 'admin',
    permissions: SYSTEM_PERMISSIONS.map((p) => p.name),
    assignedAt: new Date().toISOString(),
  },
  {
    id: 'ra-002',
    userId: 'support-001',
    email: 'support@aparaitech.com',
    displayName: 'Obstetric Care Specialist',
    role: 'support_agent',
    permissions: ['view_users', 'view_support', 'manage_content', 'manage_faqs'],
    assignedAt: new Date().toISOString(),
  },
];
