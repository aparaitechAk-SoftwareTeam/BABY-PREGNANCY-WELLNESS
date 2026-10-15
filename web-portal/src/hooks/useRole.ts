import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { NAV_ITEMS } from '@/constants';

export function useRole() {
  const { user } = useAuth();
  const role: UserRole | null = user?.role || null;

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return false;
  };

  const canAccessRoute = (path: string): boolean => {
    if (!user) return false;
    const navItem = NAV_ITEMS.find((item) => item.path === path);
    if (!navItem) return true;
    if (!navItem.roles) return true;
    return navItem.roles.includes(user.role);
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!user) return false;
    if (!item.roles) return true;
    return item.roles.includes(user.role);
  });

  return {
    role,
    isAdmin: role === 'admin',
    isSupportAgent: role === 'support_agent',
    hasPermission,
    canAccessRoute,
    visibleNavItems,
  };
}
