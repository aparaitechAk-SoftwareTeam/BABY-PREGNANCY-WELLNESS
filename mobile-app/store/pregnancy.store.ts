import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PregnancyProfile {
  dueDate: string;
  calculationMethod: 'EDD' | 'LMP';
  pregnancyDate?: string;
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  pregnancyType: 'SINGLE' | 'TWINS' | 'MULTIPLES';
  nickname?: string;

  // Body & Health Metrics
  height?: number; // in cm
  heightFt?: string; // e.g. 5'6"
  currentWeight?: number; // in kg
  prePregnancyWeight?: number; // in kg
  bloodGroup?: string; // e.g. O+, A+, B+
  motherAge?: number; // in years

  // Doctor & Clinical Details
  doctorName?: string;
  hospitalName?: string;
  doctorPhone?: string;
  nextAppointmentDate?: string;

  // Emergency Contact & Medical Notes
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  medicalNotes?: string;

  preferredUnits: 'METRIC' | 'IMPERIAL';
  setupCompleted?: boolean;
}

interface PregnancyStoreState {
  profile: PregnancyProfile | null;
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  isHydrated: boolean;
  setProfile: (profile: PregnancyProfile) => Promise<void>;
  setWeek: (week: number) => void;
  updateWeekAndDay: (week: number, day: number) => void;
  hydrate: () => Promise<void>;
}

const defaultProfile: PregnancyProfile = {
  dueDate: new Date(Date.now() + 140 * 24 * 60 * 60 * 1000).toISOString(),
  calculationMethod: 'EDD',
  currentWeek: 20,
  currentDay: 0,
  trimester: 2,
  daysRemaining: 140,
  pregnancyType: 'SINGLE',
  nickname: '',
  currentWeight: undefined,
  prePregnancyWeight: undefined,
  height: undefined,
  heightFt: '',
  bloodGroup: '',
  motherAge: undefined,
  doctorName: '',
  hospitalName: '',
  doctorPhone: '',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',
  medicalNotes: '',
  preferredUnits: 'METRIC',
  setupCompleted: false,
};

export const usePregnancyStore = create<PregnancyStoreState>((set) => ({
  profile: defaultProfile,
  currentWeek: 20,
  currentDay: 2,
  trimester: 2,
  daysRemaining: 140,
  isHydrated: false,

  setProfile: async (profile) => {
    const updatedProfile = { ...profile, setupCompleted: true };
    set({
      profile: updatedProfile,
      currentWeek: updatedProfile.currentWeek,
      currentDay: updatedProfile.currentDay,
      trimester: updatedProfile.trimester,
      daysRemaining: updatedProfile.daysRemaining,
    });
    try {
      await AsyncStorage.setItem('aparai_pregnancy_profile', JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Failed to save pregnancy profile to storage:', error);
    }
  },

  setWeek: (currentWeek) => set({ currentWeek }),

  updateWeekAndDay: (currentWeek, currentDay) =>
    set({
      currentWeek,
      currentDay,
      trimester: currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3,
    }),

  hydrate: async () => {
    try {
      const stored = await AsyncStorage.getItem('aparai_pregnancy_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          profile: parsed,
          currentWeek: parsed.currentWeek || 20,
          currentDay: parsed.currentDay || 2,
          trimester: parsed.trimester || 2,
          daysRemaining: parsed.daysRemaining || 140,
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      console.error('Failed to hydrate pregnancy profile:', error);
      set({ isHydrated: true });
    }
  },
}));
