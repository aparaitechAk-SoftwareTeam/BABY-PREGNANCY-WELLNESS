import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api/client';

export type AppointmentType = 'Routine' | 'Scan' | 'Lab' | 'Consultation' | 'Nutrition' | 'Other';

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  doctorName: string;
  hospitalName: string;
  doctorPhone?: string;
  dateStr: string; // e.g. "Tomorrow", "Oct 24, 2026", "2026-10-24"
  timeStr: string; // e.g. "10:30 AM"
  timestamp: number; // unix timestamp for sorting
  notes?: string;
  questionsForDoctor?: string[];
  reminderEnabled: boolean;
  reminderTiming: '1_DAY_BEFORE' | '2_HOURS_BEFORE' | 'BOTH';
  isCompleted?: boolean;
}

interface AppointmentStoreState {
  appointments: Appointment[];
  isHydrated: boolean;
  isLoading: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'timestamp'> & { timestamp?: number }) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
  fetchLiveAppointments: () => Promise<void>;
  clearAllMockAppointments: () => Promise<void>;
}

const STORAGE_KEY = 'aparai_appointments_list';

export const isMockAppointment = (id: string): boolean => {
  if (!id) return true;
  return (
    id === 'apt-today' ||
    id === 'apt-1' ||
    id === 'apt-2' ||
    id === 'apt-3' ||
    id.startsWith('mock_') ||
    id.startsWith('default_')
  );
};

// Helper to retrieve current user headers for guaranteed database synchronization
async function getAuthHeaders() {
  const headers: Record<string, string> = {};
  let userId = '';
  let email = '';
  try {
    const token = await AsyncStorage.getItem('aparai_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const userStr = await AsyncStorage.getItem('aparai_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user?.id || user?.sub || '';
      email = user?.email || '';
      if (userId) headers['x-user-id'] = userId;
      if (email) headers['x-user-email'] = email;
    }
  } catch {
    // quiet catch
  }
  return { headers, userId, email };
}

export const useAppointmentStore = create<AppointmentStoreState>((set, get) => ({
  appointments: [],
  isHydrated: false,
  isLoading: false,

  fetchLiveAppointments: async () => {
    set({ isLoading: true });
    try {
      const { headers, userId, email } = await getAuthHeaders();
      const res = await apiClient.get('/appointments', {
        headers,
        params: { userId, email },
      });

      if (res?.data?.success && Array.isArray(res.data.data)) {
        const liveList: Appointment[] = res.data.data
          .filter((item: any) => !isMockAppointment(item.id))
          .map((item: any) => {
            const dt = new Date(item.appointmentDate);
            return {
              id: item.id,
              title: item.title,
              type: 'Routine',
              doctorName: item.doctorName || '',
              hospitalName: item.hospitalName || '',
              doctorPhone: item.doctorPhone || '',
              dateStr: !isNaN(dt.getTime())
                ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Upcoming',
              timeStr: item.timeStr || '10:00 AM',
              timestamp: !isNaN(dt.getTime()) ? dt.getTime() : Date.now(),
              notes: item.notes || '',
              reminderEnabled: true,
              reminderTiming: '1_DAY_BEFORE',
              isCompleted: item.status === 'COMPLETED',
            };
          });

        liveList.sort((a, b) => a.timestamp - b.timestamp);
        // Pure authentic PostgreSQL database records
        set({ appointments: liveList, isHydrated: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(liveList));
      } else {
        set({ appointments: [], isHydrated: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
    } catch (e) {
      // Offline fallback: load from AsyncStorage, strictly purging any legacy mock items
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const sanitized = Array.isArray(parsed)
            ? parsed.filter((item: any) => !isMockAppointment(item.id))
            : [];
          set({ appointments: sanitized, isHydrated: true });
        } else {
          set({ appointments: [], isHydrated: true });
        }
      } catch {
        set({ appointments: [], isHydrated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addAppointment: async (data) => {
    let calculatedTimestamp = data.timestamp;
    if (!calculatedTimestamp) {
      const parsed = Date.parse(`${data.dateStr} ${data.timeStr}`);
      calculatedTimestamp = !isNaN(parsed) ? parsed : Date.parse(data.dateStr) || Date.now();
    }

    const tempId = 'apt_' + Date.now();
    const newAppointment: Appointment = {
      ...data,
      id: tempId,
      timestamp: calculatedTimestamp,
      isCompleted: false,
    };

    const currentList = get().appointments.filter((a) => !isMockAppointment(a.id));
    const updated = [newAppointment, ...currentList].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    set({ appointments: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist to Neon DB in real-time
    try {
      const { headers, userId, email } = await getAuthHeaders();
      const res = await apiClient.post(
        '/appointments',
        {
          title: data.title,
          doctorName: data.doctorName,
          hospitalName: data.hospitalName,
          doctorPhone: data.doctorPhone,
          appointmentDate: new Date(calculatedTimestamp).toISOString(),
          timeStr: data.timeStr,
          notes: data.notes,
          status: 'UPCOMING',
          userId,
          email,
        },
        { headers }
      );

      if (res?.data?.success && res.data.data?.id) {
        const serverId = res.data.data.id;
        const remapped = get().appointments.map((a) => (a.id === tempId ? { ...a, id: serverId } : a));
        set({ appointments: remapped });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remapped));
      }
    } catch (e) {
      console.warn('Saved appointment locally; backend sync failed:', e);
    }
  },

  updateAppointment: async (id, updates) => {
    const updated = get().appointments.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    set({ appointments: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteAppointment: async (id) => {
    const updated = get().appointments.filter((item) => item.id !== id);
    set({ appointments: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const { headers, userId, email } = await getAuthHeaders();
      await apiClient.delete(`/appointments/${id}`, {
        headers,
        params: { userId, email },
      });
    } catch (e) {
      console.warn('Failed to delete appointment from backend:', e);
    }
  },

  toggleCompleted: async (id) => {
    const updated = get().appointments.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    set({ appointments: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const { headers, userId, email } = await getAuthHeaders();
      await apiClient.patch(`/appointments/${id}/toggle`, {}, {
        headers,
        params: { userId, email },
      });
    } catch (e) {
      console.warn('Failed to toggle appointment on backend:', e);
    }
  },

  clearAllMockAppointments: async () => {
    const sanitized = get().appointments.filter((a) => !isMockAppointment(a.id));
    set({ appointments: sanitized });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  },

  hydrate: async () => {
    // 1. Instantly purge any mock records from AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter((item: any) => !isMockAppointment(item.id));
          if (sanitized.length !== parsed.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          }
          set({ appointments: sanitized, isHydrated: true });
        }
      }
    } catch {
      // quiet catch
    }

    // 2. Query Neon DB for live appointments
    await get().fetchLiveAppointments();
  },
}));
