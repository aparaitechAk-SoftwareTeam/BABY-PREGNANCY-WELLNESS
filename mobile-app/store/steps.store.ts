import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackingApi } from '../services/api/tracking.api';

export interface DayStepRecord {
  date: string;
  dayLabel: string;
  steps: number;
  goal: number;
  distanceKm: number;
  activeMinutes: number;
  caloriesKcal: number;
  isGoalMet: boolean;
}

export interface WalkingSession {
  isActive: boolean;
  startTime: number | null;
  elapsedSeconds: number;
  stepsInSession: number;
  distanceKm: number;
}

interface StepsState {
  todaySteps: number;
  stepGoal: number;
  distanceKm: number;
  activeMinutes: number;
  caloriesKcal: number;
  walkingSession: WalkingSession;
  weeklyHistory: DayStepRecord[];
  isLoading: boolean;

  // Actions
  loadSteps: (trimester?: number) => Promise<void>;
  loadTodaySteps: () => Promise<void>;
  addSteps: (stepsToAdd: number) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  startWalkingSession: () => void;
  tickWalkingSession: () => void;
  pauseWalkingSession: () => void;
  finishWalkingSession: () => Promise<void>;
  resetTodaySteps: () => Promise<void>;
}

const STORAGE_KEY = '@aparaitech_maternal_steps_v1';

// ACOG Trimester Default Goals
export const getTrimesterDefaultGoal = (trimester: number = 2): number => {
  if (trimester === 1) return 5500;
  if (trimester === 3) return 4000;
  return 5000; // Trimester 2 Golden period
};

export const useStepsStore = create<StepsState>((set, get) => ({
  todaySteps: 0,
  stepGoal: 5000,
  distanceKm: 0,
  activeMinutes: 0,
  caloriesKcal: 0,
  walkingSession: {
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    stepsInSession: 0,
    distanceKm: 0,
  },
  weeklyHistory: [],
  isLoading: false,

  loadSteps: async (trimester = 2) => {
    const defaultGoal = getTrimesterDefaultGoal(trimester);
    set({ isLoading: true });

    // 1. Try fetching live from Neon PostgreSQL backend
    try {
      const res = await trackingApi.getTodaySteps();
      if (res?.data?.success && res.data.data) {
        const d = res.data.data;
        const currentSteps = Number(d.steps) || 0;
        const currentGoal = Number(d.goal) || defaultGoal;
        const distanceKm = Number((currentSteps * 0.00075).toFixed(2));
        const activeMinutes = Math.round(currentSteps / 110);
        const caloriesKcal = Math.round(currentSteps * 0.04);

        set({
          todaySteps: currentSteps,
          stepGoal: currentGoal,
          distanceKm,
          activeMinutes,
          caloriesKcal,
        });

        // Also fetch history
        try {
          const histRes = await trackingApi.getStepsHistory();
          if (histRes?.data?.data && Array.isArray(histRes.data.data)) {
            const historyMapped: DayStepRecord[] = histRes.data.data.map((r: any) => {
              const dObj = new Date(r.dateStr);
              const dayLabel = isNaN(dObj.getTime())
                ? 'Day'
                : dObj.toLocaleDateString('en-US', { weekday: 'short' });
              return {
                date: r.dateStr,
                dayLabel,
                steps: r.steps || 0,
                goal: r.goal || 5000,
                distanceKm: r.distanceKm || 0,
                activeMinutes: r.activeMinutes || 0,
                caloriesKcal: r.caloriesKcal || 0,
                isGoalMet: (r.steps || 0) >= (r.goal || 5000),
              };
            });
            set({ weeklyHistory: historyMapped });
          }
        } catch {
          // Ignore history failure
        }

        set({ isLoading: false });
        return;
      }
    } catch {
      // Backend offline or token pending, fallback to AsyncStorage
    }

    // 2. Offline fallback to local storage
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const todayStr = new Date().toISOString().slice(0, 10);
      if (stored) {
        const parsed = JSON.parse(stored);
        const isToday = parsed.dateStr === todayStr;
        // Purge old mock default of 4320 steps
        const validTodaySteps = isToday && parsed.todaySteps !== 4320 ? (Number(parsed.todaySteps) || 0) : 0;
        set({
          todaySteps: validTodaySteps,
          stepGoal: parsed.stepGoal ?? defaultGoal,
          distanceKm: isToday ? (parsed.distanceKm ?? 0) : 0,
          activeMinutes: isToday ? (parsed.activeMinutes ?? 0) : 0,
          caloriesKcal: isToday ? (parsed.caloriesKcal ?? 0) : 0,
          weeklyHistory: parsed.weeklyHistory ?? [],
          isLoading: false,
        });
        return;
      }
      set({ todaySteps: 0, stepGoal: defaultGoal, isLoading: false });
    } catch {
      set({ todaySteps: 0, isLoading: false });
    }
  },

  loadTodaySteps: async () => {
    await get().loadSteps();
  },

  addSteps: async (stepsToAdd: number) => {
    const newSteps = Math.max(0, get().todaySteps + stepsToAdd);
    const distanceKm = Number((newSteps * 0.00075).toFixed(2));
    const activeMinutes = Math.round(newSteps / 110);
    const caloriesKcal = Math.round(newSteps * 0.04);
    const goal = get().stepGoal;
    const dateStr = new Date().toISOString().slice(0, 10);

    set({
      todaySteps: newSteps,
      distanceKm,
      activeMinutes,
      caloriesKcal,
    });

    // 1. Sync live to Neon PostgreSQL Database
    try {
      await trackingApi.logSteps({
        steps: newSteps,
        goal,
        dateStr,
      });
    } catch (e) {
      console.warn('Realtime steps database sync deferred:', e);
    }

    // 2. Cache in local storage
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          todaySteps: newSteps,
          stepGoal: goal,
          distanceKm,
          activeMinutes,
          caloriesKcal,
          dateStr,
        })
      );
    } catch {
      // Ignore
    }
  },

  setDailyGoal: async (goal: number) => {
    set({ stepGoal: goal });
    try {
      await trackingApi.logSteps({
        steps: get().todaySteps,
        goal,
        dateStr: new Date().toISOString().slice(0, 10),
      });
    } catch {
      // Ignore
    }
  },

  startWalkingSession: () => {
    set({
      walkingSession: {
        isActive: true,
        startTime: Date.now(),
        elapsedSeconds: 0,
        stepsInSession: 0,
        distanceKm: 0,
      },
    });
  },

  tickWalkingSession: () => {
    const session = get().walkingSession;
    if (!session.isActive) return;

    const newElapsed = session.elapsedSeconds + 1;
    // Gentle maternal walking: ~2 steps per second
    const newSessionSteps = session.stepsInSession + 2;
    const newSessionDistance = Number((newSessionSteps * 0.00075).toFixed(2));

    set({
      walkingSession: {
        ...session,
        elapsedSeconds: newElapsed,
        stepsInSession: newSessionSteps,
        distanceKm: newSessionDistance,
      },
    });
  },

  pauseWalkingSession: () => {
    const session = get().walkingSession;
    set({
      walkingSession: {
        ...session,
        isActive: false,
      },
    });
  },

  finishWalkingSession: async () => {
    const session = get().walkingSession;
    const stepsCompleted = session.stepsInSession;

    if (stepsCompleted > 0) {
      await get().addSteps(stepsCompleted);
    }

    set({
      walkingSession: {
        isActive: false,
        startTime: null,
        elapsedSeconds: 0,
        stepsInSession: 0,
        distanceKm: 0,
      },
    });
  },

  resetTodaySteps: async () => {
    set({
      todaySteps: 0,
      distanceKm: 0,
      activeMinutes: 0,
      caloriesKcal: 0,
    });
    try {
      await trackingApi.logSteps({
        steps: 0,
        goal: get().stepGoal,
        dateStr: new Date().toISOString().slice(0, 10),
      });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  },
}));
