import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CaregiverAccess {
  id: string;
  name: string;
  relationship: string;
  email: string;
  connectedDate: string;
  lastActive: string;
  device: string;
  permissions: {
    vitals: boolean;
    kicks: boolean;
    appointments: boolean;
    documents: boolean;
    routine: boolean;
    emergencySOS: boolean; // Always true for clinical safety
  };
}

export interface ActivityLog {
  id: string;
  actorName: string;
  action: string;
  timestamp: string;
  category: 'document' | 'tracking' | 'appointment' | 'security' | 'task';
  ipOrDevice?: string;
}

interface PrivacyCenterState {
  caregivers: CaregiverAccess[];
  activityLogs: ActivityLog[];
  isLoading: boolean;

  // Actions
  loadPrivacyData: () => Promise<void>;
  updatePermission: (
    caregiverId: string,
    permissionKey: keyof CaregiverAccess['permissions'],
    value: boolean
  ) => Promise<void>;
  revokeCaregiverAccess: (caregiverId: string) => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => Promise<void>;
}

const STORAGE_KEY = '@aparaitech_privacy_center_v1';

const INITIAL_CAREGIVERS: CaregiverAccess[] = [
  {
    id: 'cg-1',
    name: 'Rahul Sharma',
    relationship: 'Partner / Husband',
    email: 'rahul.sharma@example.com',
    connectedDate: 'Sep 15, 2026',
    lastActive: '12 minutes ago',
    device: 'iPhone 15 Pro • iOS 18',
    permissions: {
      vitals: true,
      kicks: true,
      appointments: true,
      documents: true,
      routine: true,
      emergencySOS: true,
    },
  },
  {
    id: 'cg-2',
    name: 'Sunita Sharma',
    relationship: "Mother's Mom",
    email: 'sunita.sharma@example.com',
    connectedDate: 'Oct 02, 2026',
    lastActive: 'Yesterday at 5:40 PM',
    device: 'Samsung Galaxy S24 • Android 15',
    permissions: {
      vitals: false,
      kicks: true,
      appointments: true,
      documents: false,
      routine: false,
      emergencySOS: true,
    },
  },
];

const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    actorName: 'Rahul (Partner)',
    action: 'Viewed 20-Week Anomaly Ultrasound Scan Report',
    timestamp: 'Today at 02:15 PM',
    category: 'document',
    ipOrDevice: 'iPhone 15 Pro',
  },
  {
    id: 'log-2',
    actorName: 'Rahul (Partner)',
    action: 'Checked off family task: "Pick up iron & calcium supplements"',
    timestamp: 'Today at 09:30 AM',
    category: 'task',
    ipOrDevice: 'Caregiver App',
  },
  {
    id: 'log-3',
    actorName: 'Sarah (You)',
    action: 'Exported Weekly Clinical Summary PDF to WhatsApp',
    timestamp: 'Yesterday at 06:10 PM',
    category: 'document',
    ipOrDevice: 'Mother Device',
  },
  {
    id: 'log-4',
    actorName: 'Sunita Sharma (Mom)',
    action: 'Viewed baby kick session timeline (Cardiff 10-count)',
    timestamp: 'Yesterday at 05:40 PM',
    category: 'tracking',
    ipOrDevice: 'Caregiver App',
  },
  {
    id: 'log-5',
    actorName: 'System Security',
    action: 'New device session authenticated with 2FA token',
    timestamp: 'Oct 14, 2026 • 11:20 AM',
    category: 'security',
    ipOrDevice: 'Pune, Maharashtra • TLS 1.3',
  },
];

export const usePrivacyStore = create<PrivacyCenterState>((set, get) => ({
  caregivers: INITIAL_CAREGIVERS,
  activityLogs: INITIAL_ACTIVITY_LOGS,
  isLoading: false,

  loadPrivacyData: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.caregivers && parsed.activityLogs) {
          set({ caregivers: parsed.caregivers, activityLogs: parsed.activityLogs });
          return;
        }
      }
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ caregivers: INITIAL_CAREGIVERS, activityLogs: INITIAL_ACTIVITY_LOGS })
      );
      set({ caregivers: INITIAL_CAREGIVERS, activityLogs: INITIAL_ACTIVITY_LOGS });
    } catch (e) {
      console.error('Failed to load privacy data:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePermission: async (caregiverId, permissionKey, value) => {
    if (permissionKey === 'emergencySOS') return; // Cannot disable SOS

    const updatedCaregivers = get().caregivers.map((cg) => {
      if (cg.id === caregiverId) {
        return {
          ...cg,
          permissions: {
            ...cg.permissions,
            [permissionKey]: value,
          },
        };
      }
      return cg;
    });

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      actorName: 'Sarah (Mother)',
      action: `Modified permission "${permissionKey}" to ${value ? 'Allowed' : 'Restricted'}`,
      timestamp: 'Just now',
      category: 'security',
    };

    const updatedLogs = [newLog, ...get().activityLogs];
    set({ caregivers: updatedCaregivers, activityLogs: updatedLogs });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ caregivers: updatedCaregivers, activityLogs: updatedLogs })
      );
    } catch (e) {
      console.error('Failed to save permission update:', e);
    }
  },

  revokeCaregiverAccess: async (caregiverId) => {
    const target = get().caregivers.find((c) => c.id === caregiverId);
    const updatedCaregivers = get().caregivers.filter((cg) => cg.id !== caregiverId);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      actorName: 'Sarah (Mother)',
      action: `Revoked access for caregiver: ${target?.name || 'Caregiver'}`,
      timestamp: 'Just now',
      category: 'security',
    };

    const updatedLogs = [newLog, ...get().activityLogs];
    set({ caregivers: updatedCaregivers, activityLogs: updatedLogs });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ caregivers: updatedCaregivers, activityLogs: updatedLogs })
      );
    } catch (e) {
      console.error('Failed to save revoked caregiver access:', e);
    }
  },

  addActivityLog: async (log) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
    };
    const updatedLogs = [newLog, ...get().activityLogs];
    set({ activityLogs: updatedLogs });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ caregivers: get().caregivers, activityLogs: updatedLogs })
      );
    } catch (e) {
      console.error('Failed to append activity log:', e);
    }
  },
}));
