import { API_BASE_URL } from '@/constants';
import { mockUsers } from '@/mocks/users.mock';
import type { AppUser } from '@/types';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface UsersListResponse {
  data: AppUser[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchUsers(
  page: number,
  pageSize: number,
  search?: string,
  statusFilter?: string,
  subscriptionFilter?: string,
): Promise<UsersListResponse> {
  await delay(400);

  let filtered = [...mockUsers];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }

  if (statusFilter && statusFilter !== 'all') {
    filtered = filtered.filter((u) => u.accountStatus === statusFilter);
  }

  if (subscriptionFilter && subscriptionFilter !== 'all') {
    filtered = filtered.filter((u) => u.subscriptionStatus === subscriptionFilter);
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}

export async function fetchUserById(id: string): Promise<AppUser | null> {
  await delay(300);
  return mockUsers.find((u) => u.id === id) || null;
}

export async function suspendUser(id: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  const user = mockUsers.find((u) => u.id === id);
  if (user) {
    user.accountStatus = 'suspended';
    return { success: true, message: `Account ${id} has been suspended.` };
  }
  return { success: false, message: 'User not found.' };
}

export async function reactivateUser(id: string): Promise<{ success: boolean; message: string }> {
  await delay(500);
  const user = mockUsers.find((u) => u.id === id);
  if (user) {
    user.accountStatus = 'active';
    return { success: true, message: `Account ${id} has been reactivated.` };
  }
  return { success: false, message: 'User not found.' };
}

export const usersApi = {
  fetchUsers,
  fetchUserById,
  suspendUser,
  reactivateUser,
};
