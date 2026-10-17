import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePregnancyStore } from './pregnancy.store';
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
}

const STORAGE_KEY = 'aparai_appointments_list';

export const useAppointmentStore = create<AppointmentStoreState>((set, get) => ({
  appointments: [],
  isHydrated: false,
  isLoading: false,

  fetchLiveAppointments: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/appointments');
      if (res?.data?.success && Array.isArray(res.data.data)) {
        const liveList: Appointment[] = res.data.data.map((item: any) => {
          const dt = new Date(item.appointmentDate);
          return {
            id: item.id,
            title: item.title,
            type: 'Routine',
            doctorName: item.doctorName || '',
            hospitalName: item.hospitalName || '',
            doctorPhone: item.doctorPhone || '',
            dateStr: !isNaN(dt.getTime()) ? dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming',
            timeStr: item.timeStr || '10:00 AM',
            timestamp: !isNaN(dt.getTime()) ? dt.getTime() : Date.now(),
            notes: item.notes || '',
            reminderEnabled: true,
            reminderTiming: '1_DAY_BEFORE',
            isCompleted: item.status === 'COMPLETED',
          };
        });

        liveList.sort((a, b) => a.timestamp - b.timestamp);
        set({ appointments: liveList, isHydrated: true });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(liveList));
      }
    } catch (e) {
      // Offline fallback: load from AsyncStorage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ appointments: JSON.parse(stored), isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addAppointment: async (data) => {
    const tempId = 'apt_' + Date.now();
    const newAppointment: Appointment = {
      ...data,
      id: tempId,
      timestamp: data.timestamp || Date.now(),
      isCompleted: false,
    };

    const updated = [newAppointment, ...get().appointments].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    set({ appointments: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist to Neon DB in real-time
    try {
      const res = await apiClient.post('/appointments', {
        title: data.title,
        doctorName: data.doctorName,
        hospitalName: data.hospitalName,
        doctorPhone: data.doctorPhone,
        appointmentDate: new Date(data.timestamp || Date.now()).toISOString(),
        timeStr: data.timeStr,
        notes: data.notes,
        status: 'UPCOMING',
      });

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
      await apiClient.delete(`/appointments/${id}`);
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
      await apiClient.patch(`/appointments/${id}/toggle`);
    } catch (e) {
      console.warn('Failed to toggle appointment on backend:', e);
    }
  },

  hydrate: async () => {
    await get().fetchLiveAppointments();
  },
}));
