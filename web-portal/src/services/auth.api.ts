import { API_BASE_URL } from '@/constants';
import type {
  AdminUser,
} from '@/types';
import { DEMO_ADMIN_CREDENTIALS } from '@/constants';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STORAGE_KEY = 'aparaitech_admin_session';

export async function login(email: string, password: string): Promise<AdminUser> {
  await delay(600);

  const adminCreds = DEMO_ADMIN_CREDENTIALS.admin;
  const supportCreds = DEMO_ADMIN_CREDENTIALS.support;

  let user: AdminUser | null = null;

  if (email === adminCreds.email && password === adminCreds.password) {
    user = {
      id: 'admin-001',
      email: adminCreds.email,
      displayName: 'Sarah Chen',
      role: 'admin',
    };
  } else if (email === supportCreds.email && password === supportCreds.password) {
    user = {
      id: 'admin-003',
      email: supportCreds.email,
      displayName: 'Maria Garcia',
      role: 'support_agent',
    };
  }

  if (!user) {
    throw new Error('Invalid email or password. Use demo credentials shown below.');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  await delay(200);
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): AdminUser | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AdminUser;
  } catch {
    return null;
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  await delay(800);
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  return {
    success: true,
    message: 'If an account exists for that email, a password reset link has been sent.',
  };
}

export const authApi = {
  login,
  logout,
  getCurrentUser,
  requestPasswordReset,
};
