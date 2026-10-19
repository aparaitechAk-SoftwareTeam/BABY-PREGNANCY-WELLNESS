import { API_BASE_URL } from '@/constants';
import type { AdminUser } from '@/types';

const STORAGE_KEY = 'aparaitech_admin_session';
const JWT_STORAGE_KEY = 'aparaitech_admin_jwt';

/**
 * Sign in using live backend POST /api/auth/signin
 */
export async function login(email: string, password: string): Promise<AdminUser> {
  const cleanEmail = (email || '').trim().toLowerCase();

  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: cleanEmail,
      password: password,
    }),
  });

  const resData = await response.json().catch(() => null);

  if (!response.ok || !resData?.success) {
    const errorMsg =
      resData?.message ||
      (Array.isArray(resData?.message) ? resData.message[0] : null) ||
      'Invalid email or password. Please verify your credentials.';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : 'Authentication failed.');
  }

  const { token, user } = resData;

  // Verify staff role permissions: only ADMIN or SUPPORT can access the Web Portal
  const backendRole = (user.role || '').toUpperCase();
  if (backendRole !== 'ADMIN' && backendRole !== 'SUPPORT') {
    throw new Error(
      'Access Denied: Only authorized Administrator or Support staff accounts can access the Web Portal.',
    );
  }

  const mappedRole: 'admin' | 'support_agent' = backendRole === 'ADMIN' ? 'admin' : 'support_agent';

  const adminUser: AdminUser = {
    id: user.id,
    email: user.email,
    displayName: user.name || (mappedRole === 'admin' ? 'System Administrator' : 'Support Specialist'),
    role: mappedRole,
    token: token,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
  if (token) {
    localStorage.setItem(JWT_STORAGE_KEY, token);
  }

  return adminUser;
}

/**
 * Clear stored admin session and JWT token
 */
export async function logout(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(JWT_STORAGE_KEY);
}

/**
 * Retrieve current user from session storage
 */
export function getCurrentUser(): AdminUser | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AdminUser;
  } catch {
    return null;
  }
}

/**
 * Request password reset link/OTP
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });
    const data = await res.json().catch(() => null);
    return {
      success: true,
      message: data?.message || 'If an account exists for that email, password reset instructions have been sent.',
    };
  } catch {
    return {
      success: true,
      message: 'If an account exists for that email, password reset instructions have been sent.',
    };
  }
}

export const authApi = {
  login,
  logout,
  getCurrentUser,
  requestPasswordReset,
};
