import type { HelpCenterArticle } from '@/types';

export const OFFICIAL_HELP_CENTER_ARTICLES: HelpCenterArticle[] = [
  {
    id: 'hc-001',
    title: 'How to Reset Your Account Password',
    category: 'Account & Login',
    content: 'If you have forgotten your password, tap "Forgot Password" on the mobile login screen. Enter your registered email address to receive a secure 6-digit verification code. If you do not receive the email within 2 minutes, check your spam/promotions folder.',
    tags: ['password', 'login', 'reset', 'authentication', 'otp'],
    views: 0,
  },
  {
    id: 'hc-002',
    title: 'Managing Maternal Notification Preferences',
    category: 'Notifications',
    content: 'To manage your notification preferences, go to Settings > Notifications. You can toggle daily tips, hydration reminders, medication prompts, and kick session alerts independently.',
    tags: ['notifications', 'settings', 'preferences', 'reminders'],
    views: 0,
  },
  {
    id: 'hc-003',
    title: 'Understanding Subscription Tiers & Caregiver Sharing',
    category: 'Billing & Subscriptions',
    content: 'The Free Starter plan includes week-by-week tracking and emergency SOS. Maternal Premium unlocks unrestricted partner/caregiver synchronization, 24/7 AI obstetric guidance, and PDF clinical record exporting.',
    tags: ['subscription', 'premium', 'billing', 'partner', 'sharing'],
    views: 0,
  },
  {
    id: 'hc-004',
    title: 'Updating Gestational Age & Due Date',
    category: 'App Troubleshooting',
    content: 'To update your due date, navigate to Profile > Edit Pregnancy Details. Enter your newly calculated Estimated Due Date (EDD) or Last Menstrual Period (LMP). The app will automatically recalculate your current week and day.',
    tags: ['due date', 'pregnancy', 'profile', 'gestational week'],
    views: 0,
  },
  {
    id: 'hc-005',
    title: 'Partner & Caregiver Sync Troubleshooting',
    category: 'App Troubleshooting',
    content: 'Caregivers can link to the mother account via the 6-character Family Sync Code generated from the Mother Dashboard (Partner Settings). Ensure the caregiver has created their account using the Caregiver role.',
    tags: ['caregiver', 'sync', 'family', 'pairing', 'code'],
    views: 0,
  },
  {
    id: 'hc-006',
    title: 'Medical Vault Security & Data Privacy',
    category: 'Privacy & Security',
    content: 'All ultrasound scans, prescription files, and lab tests stored in the Medical Vault are secured with end-to-end encryption. Only authorized caregivers and providers can access medical uploads.',
    tags: ['medical vault', 'privacy', 'security', 'hipaa', 'gdpr'],
    views: 0,
  },
];
