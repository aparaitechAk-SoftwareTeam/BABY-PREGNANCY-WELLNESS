import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationsApi } from '../services/api/notifications.api';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'clinical' | 'routine' | 'milestone' | 'family';
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  actionRoute?: string;
  emoji: string;
  badgeColor: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timeAgo' | 'isRead'>) => Promise<void>;
}

const STORAGE_KEY = '@aparaitech_notifications_v1';

function formatTimeAgo(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Recently';

  const diffMs = Date.now() - d.getTime();
  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  loadNotifications: async () => {
    set({ isLoading: true });

    // 1. Fetch live notifications from Neon PostgreSQL database
    try {
      const res = await notificationsApi.getNotifications();
      if (res?.data?.data && Array.isArray(res.data.data)) {
        const mapped: NotificationItem[] = res.data.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          category: n.category || 'clinical',
          timestamp: n.createdAt,
          timeAgo: formatTimeAgo(n.createdAt),
          isRead: Boolean(n.isRead),
          actionRoute: n.actionRoute,
          emoji: n.emoji || '🌸',
          badgeColor: n.badgeColor || '#E11D48',
        }));

        const unread = mapped.filter((n) => !n.isRead).length;
        set({ notifications: mapped, unreadCount: unread, isLoading: false });

        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        } catch {
          // Ignore
        }
        return;
      }
    } catch {
      // Offline fallback
    }

    // 2. Offline fallback to local AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const unread = parsed.filter((n: NotificationItem) => !n.isRead).length;
          set({ notifications: parsed, unreadCount: unread, isLoading: false });
          return;
        }
      }
    } catch {
      // Ignore
    }

    set({ notifications: [], unreadCount: 0, isLoading: false });
  },

  markAsRead: async (id: string) => {
    const updated = get().notifications.map((n) => {
      if (n.id === id) {
        return { ...n, isRead: true };
      }
      return n;
    });
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });

    // Sync to backend DB
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Ignore
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });

    // Sync to backend DB
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Ignore
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  deleteNotification: async (id: string) => {
    const updated = get().notifications.filter((n) => n.id !== id);
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  addNotification: async (itemData) => {
    const newItem: NotificationItem = {
      ...itemData,
      id: `notif-${Date.now()}`,
      timeAgo: 'Just now',
      isRead: false,
    };
    const updated = [newItem, ...get().notifications];
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },
}));
