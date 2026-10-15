import type { AppUser } from '@/types';

const names = [
  'Emma Thompson', 'Olivia Martinez', 'Sophia Patel', 'Isabella Chen', 'Ava Rodriguez',
  'Mia Johnson', 'Charlotte Lee', 'Amelia Garcia', 'Harper Brown', 'Evelyn Davis',
  'Abigail Wilson', 'Emily Anderson', 'Elizabeth Taylor', 'Sofia Hernandez', 'Avery Thomas',
  'Ella Martin', 'Scarlett Moore', 'Aria Jackson', 'Grace White', 'Chloe Harris',
  'Layla Khan', 'Riley Nguyen', 'Nora O\'Brien', 'Hazel Robinson', 'Zoey Clark',
  'Lily Walker', 'Aurora Hall', 'Violet Allen', 'Nova Young', 'Millie King',
  'Daisy Wright', 'Ruby Scott', 'Ivy Green', 'Sage Adams', 'Piper Baker',
  'Willow Carter', 'Luna Reyes', 'Bella Stewart', 'Stella Morris', 'Iris Coleman',
];

const statuses: AppUser['accountStatus'][] = ['active', 'active', 'active', 'active', 'suspended', 'pending'];
const subStatuses: AppUser['subscriptionStatus'][] = ['free', 'premium', 'free', 'premium', 'free', 'expired'];

function generateUsers(count: number): AppUser[] {
  const users: AppUser[] = [];
  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const regDate = new Date(2025, (i * 3) % 12, ((i * 7) % 28) + 1);
    const lastActive = new Date(2026, 9, ((i * 5) % 28) + 1);
    const subStatus = subStatuses[i % subStatuses.length];
    users.push({
      id: `usr-${String(i + 1).padStart(5, '0')}`,
      displayName: name,
      email: name.toLowerCase().replace(/[^a-z]/g, '.').replace(/\.+/g, '.') + (i >= names.length ? i : '') + '@email.com',
      registrationDate: regDate.toISOString(),
      lastActiveDate: lastActive.toISOString(),
      accountStatus: statuses[i % statuses.length],
      subscriptionStatus: subStatus,
      subscriptionPlan: subStatus === 'premium' ? 'Premium Monthly' : subStatus === 'free' ? 'Free' : undefined,
      weekOfPregnancy: (i % 40) + 1,
    });
  }
  return users;
}

export const mockUsers = generateUsers(68);
