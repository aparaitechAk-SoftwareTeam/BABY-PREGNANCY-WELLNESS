import { create } from 'zustand';
import { useAppointmentStore, isMockAppointment } from './appointment.store';
import { useVaultStore, isMockDocument } from './vault.store';
import { useRoutineStore } from './routine.store';
import { contentApi } from '../services/api/content.api';

export type TimelineItemType =
  | 'appointment'
  | 'clinical_test'
  | 'milestone'
  | 'routine_habit'
  | 'vaccination';

export interface TimelineItem {
  id: string;
  title: string;
  type: TimelineItemType;
  dateStr: string;
  targetWeek: number;
  timeOfDay?: string;
  status: 'upcoming' | 'today' | 'completed';
  doctorOrLocation?: string;
  description: string;
  clinicalAction?: string;
  badgeLabel: string;
  badgeColor: string;
  isCompleted?: boolean;
}

interface TimelineState {
  filter: 'all' | 'appointments' | 'tests' | 'milestones' | 'routine';
  searchQuery: string;
  items: TimelineItem[];
  isLoading: boolean;
  setFilter: (filter: 'all' | 'appointments' | 'tests' | 'milestones' | 'routine') => void;
  setSearchQuery: (query: string) => void;
  toggleItemCompleted: (id: string) => void;
  fetchTimeline: (currentWeek?: number) => Promise<void>;
  getFilteredItems: (currentWeek?: number) => TimelineItem[];
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  filter: 'all',
  searchQuery: '',
  items: [],
  isLoading: false,

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleItemCompleted: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      ),
    }));
  },

  fetchTimeline: async (currentWeek = 20) => {
    set({ isLoading: true });
    try {
      // 1. Fetch live appointments from DB
      await useAppointmentStore.getState().fetchLiveAppointments();
      const appointments = useAppointmentStore.getState().appointments;

      // 2. Fetch live documents from Vault DB
      await useVaultStore.getState().loadDocuments();
      const documents = useVaultStore.getState().documents;

      // 3. Fetch live weekly routine tasks from DB
      await useRoutineStore.getState().loadTasks(currentWeek);
      const routineTasks = useRoutineStore.getState().tasks;

      // 4. Fetch live gestational milestone content for this week
      let weeklyContent: any = null;
      try {
        const contentRes = await contentApi.getContentByWeek(currentWeek);
        weeklyContent = contentRes?.data?.data || null;
      } catch {
        // quiet
      }

      // Map live database appointments
      const apptItems: TimelineItem[] = appointments
        .filter((appt) => !isMockAppointment(appt.id))
        .map((appt) => ({
          id: appt.id,
          title: appt.title,
          type: 'appointment' as const,
          dateStr: `${appt.dateStr} • ${appt.timeStr}`,
          targetWeek: currentWeek,
          status: (appt.isCompleted ? 'completed' : 'upcoming') as 'completed' | 'upcoming',
          doctorOrLocation: appt.doctorName
            ? `Dr. ${appt.doctorName}${appt.hospitalName ? ` (${appt.hospitalName})` : ''}`
            : appt.hospitalName || 'Clinic Visit',
          description: appt.notes || 'Clinical consultation and prenatal checkup.',
          badgeLabel: 'APPOINTMENT',
          badgeColor: '#0EA5E9',
          isCompleted: appt.isCompleted || false,
        }));

      // Map live database medical documents (Ultrasound scans, lab reports, prescriptions)
      const docItems: TimelineItem[] = documents
        .filter((doc) => !isMockDocument(doc.id))
        .map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: (doc.category === 'vaccination' ? 'vaccination' : 'clinical_test') as TimelineItemType,
          dateStr: doc.date,
          targetWeek: currentWeek,
          status: 'completed' as const,
          doctorOrLocation: doc.doctorName
            ? `Dr. ${doc.doctorName}${doc.clinicName ? ` (${doc.clinicName})` : ''}`
            : doc.clinicName || 'Diagnostic Lab',
          description: doc.notes || `${doc.category.replace('_', ' ').toUpperCase()} verified in Medical Vault.`,
          badgeLabel: doc.category === 'vaccination' ? 'VACCINATION' : 'CLINICAL REPORT',
          badgeColor: doc.category === 'vaccination' ? '#8B5CF6' : '#D97706',
          isCompleted: true,
        }));

      // Map live database weekly routine tasks
      const taskItems: TimelineItem[] = routineTasks
        .filter((t) => t.id && !t.id.startsWith('rt-'))
        .map((t) => {
          const isClinical = (t.category as string) === 'clinical' || t.category === 'medication';
          return {
            id: t.id,
            title: t.title,
            type: (isClinical ? 'clinical_test' : 'routine_habit') as TimelineItemType,
            dateStr: t.timeStr ? `Today • ${t.timeStr}` : 'Today',
            targetWeek: currentWeek,
            status: (t.isCompleted ? 'completed' : 'today') as 'completed' | 'today',
            doctorOrLocation: t.clinicalRationale || undefined,
            description: t.description || 'Clinical routine task for maternal & fetal health.',
            clinicalAction: t.clinicalRationale || undefined,
            badgeLabel: isClinical ? 'CLINICAL ACTION' : 'DAILY HABIT',
            badgeColor: isClinical ? '#D97706' : '#E11D48',
            isCompleted: t.isCompleted,
          };
        });

      // Map live developmental milestone content from database
      const milestoneItems: TimelineItem[] = [];
      if (weeklyContent) {
        milestoneItems.push({
          id: `milestone-w${currentWeek}`,
          title: weeklyContent.title || `Week ${currentWeek} Developmental Milestone`,
          type: 'milestone' as const,
          dateStr: `Week ${currentWeek} Milestone`,
          targetWeek: currentWeek,
          status: 'upcoming' as const,
          doctorOrLocation: weeklyContent.babySize
            ? `Baby Size: ${weeklyContent.babySize} (${weeklyContent.babyLength || ''}, ${weeklyContent.babyWeight || ''})`
            : undefined,
          description: weeklyContent.summary || weeklyContent.fetalHighlight || 'Maternal & fetal growth milestone.',
          badgeLabel: 'ACTIVE MILESTONE',
          badgeColor: '#10B981',
          isCompleted: false,
        });
      }

      set({
        items: [...apptItems, ...docItems, ...taskItems, ...milestoneItems],
        isLoading: false,
      });
    } catch (e) {
      console.warn('Realtime timeline database sync deferred:', e);
      set({ isLoading: false });
    }
  },

  getFilteredItems: (currentWeek = 20) => {
    const { items, filter, searchQuery } = get();

    return items.filter((item) => {
      // Category filter
      let matchesFilter = true;
      if (filter === 'appointments') matchesFilter = item.type === 'appointment';
      if (filter === 'tests') matchesFilter = item.type === 'clinical_test' || item.type === 'vaccination';
      if (filter === 'milestones') matchesFilter = item.type === 'milestone';
      if (filter === 'routine') matchesFilter = item.type === 'routine_habit';

      // Search filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.doctorOrLocation && item.doctorOrLocation.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  },
}));
