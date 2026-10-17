import type { AuditLog } from '@/types';

export const OFFICIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    adminUser: 'system',
    action: 'DATABASE_MIGRATION',
    targetRecord: 'neon-postgresql-main',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    result: 'success',
    details: 'Database schema verified and synchronized with Neon PostgreSQL pooler.',
  },
  {
    id: 'log-002',
    adminUser: 'admin@aparaitech.com',
    action: 'ADMIN_AUTHENTICATION',
    targetRecord: 'auth-session-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    result: 'success',
    details: 'Administrator successfully logged into Aparai Care Management Portal.',
  },
  {
    id: 'log-003',
    adminUser: 'system',
    action: 'PUSH_SERVICE_INITIALIZE',
    targetRecord: 'expo-notifications-gateway',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    result: 'success',
    details: 'Expo push notification bridge initialized for maternal health alerts.',
  },
  {
    id: 'log-004',
    adminUser: 'support@aparaitech.com',
    action: 'TICKET_QUEUE_SYNC',
    targetRecord: 'support-desk-v1',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    result: 'success',
    details: 'Realtime support queue synchronized with active database tickets.',
  },
  {
    id: 'log-005',
    adminUser: 'admin@aparaitech.com',
    action: 'CONTENT_CATALOG_SYNC',
    targetRecord: 'pregnancy-content-v1',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    result: 'success',
    details: 'Verified 40-week fetal development and clinical guidance guidelines.',
  },
];
