import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to AparaiTech',
    message: 'Personalized clinical milestones, daily kick tracking, and routine reminders configured for you.',
    category: 'clinical',
    timestamp: new Date().toISOString(),
    timeAgo: 'Just now',
    isRead: false,
    actionRoute: '/(mother)',
    emoji: '🌸',
    badgeColor: '#E11D48',
  },
  {
    id: 'notif-2',
    title: 'Prenatal Vitamins & Folic Acid',
    message: 'Time for your morning vitamins with breakfast to support neural development and maternal iron levels.',
    category: 'routine',
    timestamp: new Date().toISOString(),
    timeAgo: '2 hours ago',
    isRead: false,
    actionRoute: '/routine',
    emoji: '💊',
    badgeColor: '#0EA5E9',
  },
  {
    id: 'notif-3',
    title: 'Evening Kick Counting Session',
    message: 'Peak fetal motility occurs post-dinner. Rest comfortably on your left side to track 10 movements.',
    category: 'milestone',
    timestamp: new Date().toISOString(),
    timeAgo: '5 hours ago',
    isRead: false,
    actionRoute: '/tracking/movement',
    emoji: '👣',
    badgeColor: '#8B5CF6',
  },
  {
    id: 'notif-4',
    title: 'Week 20 Milestone: Halfway There! 🎉',
    message: 'Baby is now the size of a banana (~26 cm). Taste buds are developing and baby can hear your voice!',
    category: 'milestone',
    timestamp: new Date().toISOString(),
    timeAgo: 'Yesterday',
    isRead: true,
    actionRoute: '/pregnancy/week/20',
    emoji: '🍌',
    badgeColor: '#F59E0B',
  },
  {
    id: 'notif-5',
    title: 'Hydration Checkpoint',
    message: 'Great progress! You have logged 1,750ml. Drink 2 more glasses to hit your 2,500ml daily target.',
    category: 'routine',
    timestamp: new Date().toISOString(),
    timeAgo: 'Yesterday',
    isRead: true,
    actionRoute: '/tracking/water',
    emoji: '💧',
    badgeColor: '#06B6D4',
  },
  {
    id: 'notif-6',
    title: 'Partner Circle Active',
    message: 'Caregiver (Mark) reviewed your prenatal checklist and upcoming appointment details.',
    category: 'family',
    timestamp: new Date().toISOString(),
    timeAgo: '2 days ago',
    isRead: true,
    actionRoute: '/partner',
    emoji: '👥',
    badgeColor: '#10B981',
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: DEFAULT_NOTIFICATIONS,
  unreadCount: DEFAULT_NOTIFICATIONS.filter((n) => !n.isRead).length,
  isLoading: false,

  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const unread = parsed.filter((n: NotificationItem) => !n.isRead).length;
          set({ notifications: parsed, unreadCount: unread, isLoading: false });
          return;
        }
      }
      const unread = DEFAULT_NOTIFICATIONS.filter((n) => !n.isRead).length;
      set({ notifications: DEFAULT_NOTIFICATIONS, unreadCount: unread, isLoading: false });
    } catch {
      set({ notifications: DEFAULT_NOTIFICATIONS, isLoading: false });
    }
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
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
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
