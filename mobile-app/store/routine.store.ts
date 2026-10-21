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

export const useRoutineStore = create<RoutineState>((set, get) => ({
  tasks: [],
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

    // 2. Local AsyncStorage fallback (strictly real non-mock tasks)
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.tasks)) {
          const cleanTasks = parsed.tasks.filter((t: RoutineTask) => t.id && !t.id.startsWith('rt-'));
          if (cleanTasks.length > 0) {
            const finalTasks = parsed.date === todayStr
              ? cleanTasks
              : cleanTasks.map((t: RoutineTask) => ({ ...t, isCompleted: false, completedAt: undefined }));
            set({ tasks: finalTasks, currentDateStr: todayStr, isLoading: false });
            return;
          }
        }
      }
    } catch {
      // Ignore
    }

    set({ tasks: [], currentDateStr: todayStr, isLoading: false });
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
