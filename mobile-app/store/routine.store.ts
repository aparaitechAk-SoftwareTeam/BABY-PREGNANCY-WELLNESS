import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RoutineTask {
  id: string;
  title: string;
  category: 'medication' | 'hydration' | 'exercise' | 'kicks' | 'nutrition' | 'sleep' | 'custom';
  timeStr: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  emoji: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  clinicalRationale?: string;
}

interface RoutineState {
  tasks: RoutineTask[];
  currentDateStr: string;
  isLoading: boolean;
  loadTasks: () => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  addTask: (task: Omit<RoutineTask, 'id' | 'isCompleted'>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  resetTodayTasks: () => Promise<void>;
  getStats: () => { total: number; completed: number; percentage: number };
}

const STORAGE_KEY = '@aparaitech_daily_routine_v1';

const DEFAULT_ROUTINE_TASKS: RoutineTask[] = [
  {
    id: 'task-vitamins',
    title: 'Prenatal Vitamins & Folic Acid',
    category: 'medication',
    timeStr: '08:30 AM',
    timeOfDay: 'morning',
    emoji: '💊',
    description: 'Essential micronutrients & neural tube support. Take with breakfast.',
    isCompleted: true,
    completedAt: '08:45 AM',
    clinicalRationale: 'Folic acid and iron absorption is maximized when taken with breakfast or citrus juice.',
  },
  {
    id: 'task-water-1',
    title: 'Hydration Target (First 1,000 ml)',
    category: 'hydration',
    timeStr: '11:00 AM',
    timeOfDay: 'morning',
    emoji: '💧',
    description: 'Amniotic fluid maintenance & prevents maternal UTIs.',
    isCompleted: true,
    completedAt: '11:15 AM',
    clinicalRationale: 'Maintains optimal blood volume expansion and amniotic fluid index (AFI).',
  },
  {
    id: 'task-stretch',
    title: '15-Min Safe Pelvic Floor Stretch',
    category: 'exercise',
    timeStr: '02:30 PM',
    timeOfDay: 'afternoon',
    emoji: '🧘‍♀️',
    description: 'Gentle cat-cow, pelvic tilt & deep diaphragm relaxation.',
    isCompleted: false,
    clinicalRationale: 'Relieves lower back compression and prepares perineal flexibility for delivery.',
  },
  {
    id: 'task-snack',
    title: 'High-Protein & Fiber Snack',
    category: 'nutrition',
    timeStr: '04:30 PM',
    timeOfDay: 'afternoon',
    emoji: '🥜',
    description: 'Handful of almonds/walnuts + Greek yogurt or seasonal fruit.',
    isCompleted: false,
    clinicalRationale: 'Stabilizes maternal glucose levels and reduces late afternoon fatigue.',
  },
  {
    id: 'task-kicks',
    title: 'Baby Kick Counting Session',
    category: 'kicks',
    timeStr: '07:30 PM',
    timeOfDay: 'evening',
    emoji: '👣',
    description: 'Cardiff Count-to-10 protocol. Relax on left side post-dinner.',
    isCompleted: false,
    clinicalRationale: 'Peak fetal motility occurs in the evening. Reaching 10 movements confirms healthy reactivity.',
  },
  {
    id: 'task-calcium',
    title: 'Calcium & Vitamin D3 Tablet',
    category: 'medication',
    timeStr: '09:00 PM',
    timeOfDay: 'night',
    emoji: '🥛',
    description: 'Supports baby bone ossification. Take separated from iron.',
    isCompleted: false,
    clinicalRationale: 'Keep calcium at least 2 hours apart from iron supplements to avoid absorption competition.',
  },
  {
    id: 'task-sleep-posture',
    title: 'Left-Side SOS Sleep Positioning',
    category: 'sleep',
    timeStr: '10:30 PM',
    timeOfDay: 'night',
    emoji: '🛏️',
    description: 'Place pregnancy pillow between knees to optimize IVC circulation.',
    isCompleted: false,
    clinicalRationale: 'Left lateral tilt relieves pressure on the inferior vena cava, enhancing uterine perfusion.',
  },
];

export const useRoutineStore = create<RoutineState>((set, get) => ({
  tasks: DEFAULT_ROUTINE_TASKS,
  currentDateStr: new Date().toISOString().split('T')[0],
  isLoading: false,

  loadTasks: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const todayStr = new Date().toISOString().split('T')[0];

      if (stored) {
        const parsed = JSON.parse(stored);
        // If stored tasks are from today, use them; otherwise keep tasks with reset completion
        if (parsed.date === todayStr && Array.isArray(parsed.tasks)) {
          set({ tasks: parsed.tasks, currentDateStr: todayStr, isLoading: false });
          return;
        } else if (Array.isArray(parsed.tasks)) {
          // New day: reset completion statuses
          const resetTasks = parsed.tasks.map((t: RoutineTask) => ({
            ...t,
            isCompleted: false,
            completedAt: undefined,
          }));
          set({ tasks: resetTasks, currentDateStr: todayStr, isLoading: false });
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr, tasks: resetTasks }));
          return;
        }
      }

      set({ tasks: DEFAULT_ROUTINE_TASKS, currentDateStr: todayStr, isLoading: false });
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayStr, tasks: DEFAULT_ROUTINE_TASKS })
      );
    } catch {
      set({ tasks: DEFAULT_ROUTINE_TASKS, isLoading: false });
    }
  },

  toggleTask: async (id: string) => {
    const updated = get().tasks.map((task) => {
      if (task.id === id) {
        const willComplete = !task.isCompleted;
        return {
          ...task,
          isCompleted: willComplete,
          completedAt: willComplete
            ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : undefined,
        };
      }
      return task;
    });

    set({ tasks: updated });
    try {
      const todayStr = get().currentDateStr;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr, tasks: updated }));
    } catch {
      // Ignore async storage failures gracefully
    }
  },

  addTask: async (taskData) => {
    const newTask: RoutineTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      isCompleted: false,
    };
    const updated = [...get().tasks, newTask];
    set({ tasks: updated });
    try {
      const todayStr = get().currentDateStr;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr, tasks: updated }));
    } catch {
      // Ignore
    }
  },

  deleteTask: async (id: string) => {
    const updated = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updated });
    try {
      const todayStr = get().currentDateStr;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr, tasks: updated }));
    } catch {
      // Ignore
    }
  },

  resetTodayTasks: async () => {
    const reset = get().tasks.map((t) => ({ ...t, isCompleted: false, completedAt: undefined }));
    set({ tasks: reset });
    try {
      const todayStr = get().currentDateStr;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayStr, tasks: reset }));
    } catch {
      // Ignore
    }
  },

  getStats: () => {
    const tasks = get().tasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  },
}));
