import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { contentApi } from '../services/api/content.api';

export interface RoutineTask {
  id: string;
  title: string;
  category: 'medication' | 'hydration' | 'exercise' | 'kicks' | 'nutrition' | 'sleep' | 'custom' | 'planning';
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
  loadTasks: (week?: number) => Promise<void>;
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
    isCompleted: false,
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
    isCompleted: false,
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

  loadTasks: async (week = 20) => {
    set({ isLoading: true });
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Try fetching database tasks for this week
    try {
      const res = await contentApi.getTasksByWeek(week);
      if (res?.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: RoutineTask[] = res.data.data.map((t: any) => ({
          id: t.id,
          title: t.title,
          category: t.category || 'custom',
          timeStr: t.timeStr || '',
          timeOfDay: t.timeOfDay || 'morning',
          emoji: t.emoji || '📋',
          description: t.description || '',
          isCompleted: t.isCompleted || false,
          clinicalRationale: t.clinicalRationale,
        }));
        set({ tasks: mapped, currentDateStr: todayStr, isLoading: false });
        return;
      }
    } catch {
      // Deferred sync
    }

    // 2. Local AsyncStorage fallback
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === todayStr && Array.isArray(parsed.tasks)) {
          set({ tasks: parsed.tasks, currentDateStr: todayStr, isLoading: false });
          return;
        } else if (Array.isArray(parsed.tasks)) {
          const resetTasks = parsed.tasks.map((t: RoutineTask) => ({
            ...t,
            isCompleted: false,
            completedAt: undefined,
          }));
          set({ tasks: resetTasks, currentDateStr: todayStr, isLoading: false });
          return;
        }
      }
    } catch {
      // Ignore
    }

    set({ tasks: DEFAULT_ROUTINE_TASKS, currentDateStr: todayStr, isLoading: false });
  },

  toggleTask: async (id: string) => {
    const todayStr = get().currentDateStr;
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let targetCompleted = false;

    const updatedTasks = get().tasks.map((task) => {
      if (task.id === id) {
        const nextState = !task.isCompleted;
        targetCompleted = nextState;
        return {
          ...task,
          isCompleted: nextState,
          completedAt: nextState ? nowTimeStr : undefined,
        };
      }
      return task;
    });

    set({ tasks: updatedTasks });

    // Sync to backend DB
    try {
      await contentApi.toggleTask(id, targetCompleted);
    } catch {
      // Offline fallback
    }

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayStr, tasks: updatedTasks })
      );
    } catch (error) {
      console.error('Failed to save routine tasks to storage:', error);
    }
  },

  addTask: async (taskData) => {
    const todayStr = get().currentDateStr;
    const newTask: RoutineTask = {
      ...taskData,
      id: `task-custom-${Date.now()}`,
      isCompleted: false,
    };

    const updatedTasks = [...get().tasks, newTask];
    set({ tasks: updatedTasks });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayStr, tasks: updatedTasks })
      );
    } catch (error) {
      console.error('Failed to add custom routine task:', error);
    }
  },

  deleteTask: async (id: string) => {
    const todayStr = get().currentDateStr;
    const updatedTasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updatedTasks });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayStr, tasks: updatedTasks })
      );
    } catch (error) {
      console.error('Failed to delete routine task:', error);
    }
  },

  resetTodayTasks: async () => {
    const todayStr = get().currentDateStr;
    const resetTasks = get().tasks.map((t) => ({
      ...t,
      isCompleted: false,
      completedAt: undefined,
    }));

    set({ tasks: resetTasks });

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: todayStr, tasks: resetTasks })
      );
    } catch (error) {
      console.error('Failed to reset daily routine tasks:', error);
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
