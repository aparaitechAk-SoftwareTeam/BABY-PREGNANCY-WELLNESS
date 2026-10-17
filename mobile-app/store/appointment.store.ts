import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePregnancyStore } from './pregnancy.store';

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
  addAppointment: (appointment: Omit<Appointment, 'id' | 'timestamp'> & { timestamp?: number }) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

const DEFAULT_APPOINTMENTS: Appointment[] = [];

const STORAGE_KEY = 'aparai_appointments_list';

export const useAppointmentStore = create<AppointmentStoreState>((set, get) => ({
  appointments: DEFAULT_APPOINTMENTS,
  isHydrated: false,

  addAppointment: async (data) => {
    const newAppointment: Appointment = {
      ...data,
      id: 'apt_' + Date.now(),
      timestamp: data.timestamp || Date.now(),
      isCompleted: false,
    };

    const updated = [newAppointment, ...get().appointments].sort(
      (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
    );

    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save appointments:', e);
    }
  },

  updateAppointment: async (id, updates) => {
    const updated = get().appointments.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update appointments:', e);
    }
  },

  deleteAppointment: async (id) => {
    const updated = get().appointments.filter((item) => item.id !== id);
    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete appointment:', e);
    }
  },

  toggleCompleted: async (id) => {
    const updated = get().appointments.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    set({ appointments: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to toggle appointment completion:', e);
    }
  },

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ appointments: JSON.parse(stored), isHydrated: true });
      } else {
        // If no stored appointments, check if user has a custom doctor/hospital in pregnancy store
        const pregnancyProfile = usePregnancyStore.getState().profile;
        if (pregnancyProfile?.doctorName || pregnancyProfile?.hospitalName) {
          const customized = DEFAULT_APPOINTMENTS.map((apt) => ({
            ...apt,
            doctorName: pregnancyProfile.doctorName || apt.doctorName,
            hospitalName: pregnancyProfile.hospitalName || apt.hospitalName,
            doctorPhone: pregnancyProfile.doctorPhone || apt.doctorPhone,
          }));
          set({ appointments: customized, isHydrated: true });
        } else {
          set({ isHydrated: true });
        }
      }
    } catch (e) {
      console.error('Failed to hydrate appointments:', e);
      set({ isHydrated: true });
    }
  },
}));
