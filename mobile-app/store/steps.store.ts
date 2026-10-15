import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const DEFAULT_WEEKLY_HISTORY: DayStepRecord[] = [
  { date: '2026-10-09', dayLabel: 'Fri', steps: 4620, goal: 5000, distanceKm: 3.46, activeMinutes: 42, caloriesKcal: 185, isGoalMet: false },
  { date: '2026-10-10', dayLabel: 'Sat', steps: 5340, goal: 5000, distanceKm: 4.01, activeMinutes: 48, caloriesKcal: 214, isGoalMet: true },
  { date: '2026-10-11', dayLabel: 'Sun', steps: 3890, goal: 5000, distanceKm: 2.91, activeMinutes: 35, caloriesKcal: 155, isGoalMet: false },
  { date: '2026-10-12', dayLabel: 'Mon', steps: 5120, goal: 5000, distanceKm: 3.84, activeMinutes: 46, caloriesKcal: 205, isGoalMet: true },
  { date: '2026-10-13', dayLabel: 'Tue', steps: 5480, goal: 5000, distanceKm: 4.11, activeMinutes: 49, caloriesKcal: 219, isGoalMet: true },
  { date: '2026-10-14', dayLabel: 'Wed', steps: 4810, goal: 5000, distanceKm: 3.61, activeMinutes: 43, caloriesKcal: 192, isGoalMet: false },
  { date: '2026-10-15', dayLabel: 'Thu', steps: 4320, goal: 5000, distanceKm: 3.24, activeMinutes: 39, caloriesKcal: 173, isGoalMet: false },
];

export const useStepsStore = create<StepsState>((set, get) => ({
  todaySteps: 4320,
  stepGoal: 5000,
  distanceKm: 3.24,
  activeMinutes: 39,
  caloriesKcal: 173,
  walkingSession: {
    isActive: false,
    startTime: null,
    elapsedSeconds: 0,
    stepsInSession: 0,
    distanceKm: 0,
  },
  weeklyHistory: DEFAULT_WEEKLY_HISTORY,
  isLoading: false,

  loadSteps: async (trimester = 2) => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const defaultGoal = getTrimesterDefaultGoal(trimester);

      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          todaySteps: parsed.todaySteps ?? 4320,
          stepGoal: parsed.stepGoal ?? defaultGoal,
          distanceKm: parsed.distanceKm ?? 3.24,
          activeMinutes: parsed.activeMinutes ?? 39,
          caloriesKcal: parsed.caloriesKcal ?? 173,
          weeklyHistory: parsed.weeklyHistory ?? DEFAULT_WEEKLY_HISTORY,
          isLoading: false,
        });
        return;
      }

      set({ stepGoal: defaultGoal, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addSteps: async (stepsToAdd: number) => {
    const newSteps = Math.max(0, get().todaySteps + stepsToAdd);
    const distanceKm = Number((newSteps * 0.00075).toFixed(2));
    const activeMinutes = Math.round(newSteps / 110);
    const caloriesKcal = Math.round(newSteps * 0.04);

    const updatedHistory = get().weeklyHistory.map((item, index) => {
      // Update today's record (last item)
      if (index === get().weeklyHistory.length - 1) {
        return {
          ...item,
          steps: newSteps,
          distanceKm,
          activeMinutes,
          caloriesKcal,
          isGoalMet: newSteps >= get().stepGoal,
        };
      }
      return item;
    });

    set({
      todaySteps: newSteps,
      distanceKm,
      activeMinutes,
      caloriesKcal,
      weeklyHistory: updatedHistory,
    });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          todaySteps: newSteps,
          stepGoal: get().stepGoal,
          distanceKm,
          activeMinutes,
          caloriesKcal,
          weeklyHistory: updatedHistory,
        })
      );
    } catch {
      // Handle storage failure gracefully
    }
  },

  setDailyGoal: async (goal: number) => {
    set({ stepGoal: goal });
    try {
      const data = {
        todaySteps: get().todaySteps,
        stepGoal: goal,
        distanceKm: get().distanceKm,
        activeMinutes: get().activeMinutes,
        caloriesKcal: get().caloriesKcal,
        weeklyHistory: get().weeklyHistory,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    // Simulate gentle maternal walking: ~1.8 steps per second (108 steps/min)
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

    // Add session steps to daily total
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
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          todaySteps: 0,
          stepGoal: get().stepGoal,
          distanceKm: 0,
          activeMinutes: 0,
          caloriesKcal: 0,
          weeklyHistory: get().weeklyHistory,
        })
      );
    } catch {
      // Ignore
    }
  },
}));
