import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api/client';

export type TaskCategory =
  | 'appointment_prep'
  | 'pharmacy'
  | 'transport'
  | 'shopping'
  | 'home_setup'
  | 'custom';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface FamilyTask {
  id: string;
  title: string;
  assignedTo: string; // e.g. "Partner / Caregiver" or "Mother"
  assignedBy: string; // e.g. "Sarah (Mother)"
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // e.g. "Oct 18, 2026" or "Before next visit"
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
}

interface FamilyTasksState {
  tasks: FamilyTask[];
  isLoading: boolean;
  filter: 'all' | 'pending' | 'completed' | 'partner' | 'mother';

  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<FamilyTask, 'id' | 'isCompleted' | 'createdAt'>) => Promise<void>;
  toggleTask: (id: string, completedByUserName?: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilter: (filter: 'all' | 'pending' | 'completed' | 'partner' | 'mother') => void;
  getFilteredTasks: () => FamilyTask[];
}

const STORAGE_KEY = '@aparaitech_family_tasks_v1';

export const isMockFamilyTask = (id: string): boolean => {
  if (!id) return true;
  return (
    id === 'ft-1' ||
    id === 'ft-2' ||
    id === 'ft-3' ||
    id === 'ft-4' ||
    id === 'ft-5' ||
    id.startsWith('mock_') ||
    id.startsWith('default_')
  );
};

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

export const useFamilyTasksStore = create<FamilyTasksState>((set, get) => ({
  tasks: [],
  isLoading: false,
  filter: 'all',

  loadTasks: async () => {
    set({ isLoading: true });

    // 1. Purge legacy mock tasks from AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter((t: any) => !isMockFamilyTask(t.id));
          if (sanitized.length !== parsed.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          }
          set({ tasks: sanitized });
        }
      }
    } catch {
      // quiet catch
    }

    // 2. Fetch live authentic tasks from PostgreSQL database
    try {
      const { headers, userId, email } = await getAuthHeaders();
      const res = await apiClient.get('/family/tasks', {
        headers,
        params: { userId, email },
      });

      if (res?.data?.success && Array.isArray(res.data.data)) {
        const dbTasks: FamilyTask[] = res.data.data
          .filter((t: any) => !isMockFamilyTask(t.id))
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            assignedTo: t.assignedTo || 'Partner / Caregiver',
            assignedBy: t.assignedBy || 'Mother',
            category: t.category || 'transport',
            priority: t.priority || 'medium',
            dueDate: t.dueDate || 'Today',
            notes: t.notes || '',
            isCompleted: t.isCompleted || false,
            completedAt: t.completedAt,
            completedBy: t.completedBy,
            createdAt: t.createdAt || new Date().toISOString(),
          }));

        set({ tasks: dbTasks });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dbTasks));
      }
    } catch (e) {
      console.warn('Family tasks backend sync failed, using sanitized local store:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (newTask) => {
    const tempId = `ft-${Date.now()}`;
    const taskWithId: FamilyTask = {
      ...newTask,
      id: tempId,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const currentTasks = get().tasks.filter((t) => !isMockFamilyTask(t.id));
    const updated = [taskWithId, ...currentTasks];
    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist to Neon DB
    try {
      const { headers, userId, email } = await getAuthHeaders();
      const res = await apiClient.post(
        '/family/tasks',
        {
          ...newTask,
          userId,
          email,
        },
        { headers }
      );

      if (res?.data?.success && res.data.data?.id) {
        const serverId = res.data.data.id;
        const remapped = get().tasks.map((t) => (t.id === tempId ? { ...t, id: serverId } : t));
        set({ tasks: remapped });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remapped));
      }
    } catch (error) {
      console.error('Failed to sync added family task to database:', error);
    }
  },

  toggleTask: async (id, completedByUserName = 'Caregiver Partner') => {
    const willBeCompleted = !get().tasks.find((t) => t.id === id)?.isCompleted;
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = get().tasks.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          isCompleted: willBeCompleted,
          completedAt: willBeCompleted ? nowTimeStr : undefined,
          completedBy: willBeCompleted ? completedByUserName : undefined,
        };
      }
      return t;
    });

    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const { headers, userId, email } = await getAuthHeaders();
      await apiClient.patch(
        `/family/tasks/${id}/toggle`,
        { completedBy: completedByUserName },
        { headers, params: { userId, email } }
      );
    } catch (error) {
      console.error('Failed to update family task status in database:', error);
    }
  },

  deleteTask: async (id) => {
    const updated = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const { headers, userId, email } = await getAuthHeaders();
      await apiClient.delete(`/family/tasks/${id}`, {
        headers,
        params: { userId, email },
      });
    } catch (error) {
      console.error('Failed to delete family task from database:', error);
    }
  },

  setFilter: (filter) => set({ filter }),

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    return tasks
      .filter((t) => !isMockFamilyTask(t.id))
      .filter((t) => {
        if (filter === 'pending') return !t.isCompleted;
        if (filter === 'completed') return t.isCompleted;
        if (filter === 'partner')
          return (
            t.assignedTo.toLowerCase().includes('partner') ||
            t.assignedTo.toLowerCase().includes('caregiver')
          );
        if (filter === 'mother') return t.assignedTo.toLowerCase().includes('mother');
        return true;
      });
  },
}));
