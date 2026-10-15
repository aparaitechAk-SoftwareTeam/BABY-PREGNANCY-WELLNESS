import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const INITIAL_FAMILY_TASKS: FamilyTask[] = [
  {
    id: 'ft-1',
    title: 'Book cab & arrange transport for 20-Week Anomaly Scan',
    assignedTo: 'Partner / Caregiver',
    assignedBy: 'Sarah (Mother)',
    category: 'transport',
    priority: 'high',
    dueDate: 'Today • Before 10:00 AM',
    notes: 'Clinic is at Apollo Cradle, Karve Road. Please ensure we arrive 15 minutes early for registration.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ft-2',
    title: 'Pick up Ferrous Ascorbate & Calcium tablets from pharmacy',
    assignedTo: 'Partner / Caregiver',
    assignedBy: 'Sarah (Mother)',
    category: 'pharmacy',
    priority: 'medium',
    dueDate: 'Tomorrow',
    notes: 'Prescription is uploaded in the Medical Vault. Check doctor notes for 100mg dosage.',
    isCompleted: true,
    completedAt: 'Yesterday at 6:30 PM',
    completedBy: 'Rahul (Partner)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ft-3',
    title: 'Print previous blood reports & ultrasound scan for doctor file',
    assignedTo: 'Partner / Caregiver',
    assignedBy: 'Sarah (Mother)',
    category: 'appointment_prep',
    priority: 'urgent',
    dueDate: 'Today • 09:30 AM',
    notes: 'Dr. Priya requested physical copies of the second trimester CBC panel.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ft-4',
    title: 'Buy maternity pregnancy pillow for left-side sleeping support',
    assignedTo: 'Partner / Caregiver',
    assignedBy: 'Sarah (Mother)',
    category: 'shopping',
    priority: 'medium',
    dueDate: 'This Weekend',
    notes: 'U-shaped maternity body pillow to prevent sleeping flat on the back.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ft-5',
    title: 'Assemble baby nursery bedside bassinet & crib safety check',
    assignedTo: 'Partner / Caregiver',
    assignedBy: 'Sarah (Mother)',
    category: 'home_setup',
    priority: 'low',
    dueDate: 'Week 28',
    notes: 'Follow instruction booklet and inspect mattress firmness.',
    isCompleted: false,
    createdAt: new Date().toISOString(),
  },
];

export const useFamilyTasksStore = create<FamilyTasksState>((set, get) => ({
  tasks: INITIAL_FAMILY_TASKS,
  isLoading: false,
  filter: 'all',

  loadTasks: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ tasks: parsed });
          return;
        }
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAMILY_TASKS));
      set({ tasks: INITIAL_FAMILY_TASKS });
    } catch (error) {
      console.error('Failed to load family tasks:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (newTask) => {
    const taskWithId: FamilyTask = {
      ...newTask,
      id: `ft-${Date.now()}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [taskWithId, ...get().tasks];
    set({ tasks: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save added family task:', error);
    }
  },

  toggleTask: async (id, completedByUserName = 'Caregiver Partner') => {
    const updated = get().tasks.map((t) => {
      if (t.id === id) {
        const willBeCompleted = !t.isCompleted;
        return {
          ...t,
          isCompleted: willBeCompleted,
          completedAt: willBeCompleted
            ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined,
          completedBy: willBeCompleted ? completedByUserName : undefined,
        };
      }
      return t;
    });

    set({ tasks: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update family task status:', error);
    }
  },

  deleteTask: async (id) => {
    const updated = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete family task:', error);
    }
  },

  setFilter: (filter) => set({ filter }),

  getFilteredTasks: () => {
    const { tasks, filter } = get();
    return tasks.filter((t) => {
      if (filter === 'pending') return !t.isCompleted;
      if (filter === 'completed') return t.isCompleted;
      if (filter === 'partner') return t.assignedTo.toLowerCase().includes('partner') || t.assignedTo.toLowerCase().includes('caregiver');
      if (filter === 'mother') return t.assignedTo.toLowerCase().includes('mother');
      return true;
    });
  },
}));
