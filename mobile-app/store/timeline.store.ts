import { create } from 'zustand';

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
  dateStr: string; // e.g. "Tomorrow • 10:30 AM" or "Week 24 • Nov 10, 2026"
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
  setFilter: (filter: 'all' | 'appointments' | 'tests' | 'milestones' | 'routine') => void;
  setSearchQuery: (query: string) => void;
  toggleItemCompleted: (id: string) => void;
  getFilteredItems: (currentWeek?: number) => TimelineItem[];
}

function calculateWeekDate(targetWeek: number, currentWeek: number = 20): string {
  const diffWeeks = targetWeek - currentWeek;
  const targetTime = Date.now() + diffWeeks * 7 * 24 * 60 * 60 * 1000;
  const d = new Date(targetTime);
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `Week ${targetWeek} • ${monthDay}`;
}

const CLINICAL_TIMELINE_TEMPLATE: Omit<TimelineItem, 'dateStr'>[] = [
  {
    id: 'tl-today-vitamins',
    title: 'Daily Prenatal Multivitamin & Hydration',
    type: 'routine_habit',
    targetWeek: 20,
    status: 'today',
    description: 'Essential micronutrients & iron absorption with citrus juice or breakfast.',
    badgeLabel: 'DAILY HABIT',
    badgeColor: '#E11D48',
    isCompleted: false,
  },
  {
    id: 'tl-milestone-halfway',
    title: 'Halfway Milestone! (Week 20)',
    type: 'milestone',
    targetWeek: 20,
    status: 'upcoming',
    description: 'You have reached 50% of your pregnancy journey! Baby is roughly 26 cm and can hear sounds.',
    badgeLabel: 'MILESTONE',
    badgeColor: '#10B981',
    isCompleted: false,
  },
  {
    id: 'tl-test-gtt',
    title: 'Oral Glucose Tolerance Screening (GTT)',
    type: 'clinical_test',
    targetWeek: 24,
    status: 'upcoming',
    doctorOrLocation: 'Pathology Diagnostics Lab',
    description: 'Screens for Gestational Diabetes Mellitus (GDM) to safeguard maternal & fetal health.',
    clinicalAction: 'Fast for 8 hours prior to the test',
    badgeLabel: 'REQUIRED TEST',
    badgeColor: '#D97706',
    isCompleted: false,
  },
  {
    id: 'tl-vaccine-tdap',
    title: 'Tdap (Tetanus, Diphtheria, Pertussis) Vaccine',
    type: 'vaccination',
    targetWeek: 28,
    status: 'upcoming',
    doctorOrLocation: 'Maternity Clinic / Hospital',
    description: 'Passes protective antibodies against whooping cough to the baby for the first few months of life.',
    clinicalAction: 'ACOG recommended between Week 27 and 36',
    badgeLabel: 'IMMUNIZATION',
    badgeColor: '#8B5CF6',
    isCompleted: false,
  },
  {
    id: 'tl-milestone-viability',
    title: 'Fetal Viability Milestone (Week 24)',
    type: 'milestone',
    targetWeek: 24,
    status: 'upcoming',
    description: 'A major physiological threshold where baby lungs begin producing surfactant.',
    badgeLabel: 'MILESTONE',
    badgeColor: '#10B981',
    isCompleted: false,
  },
  {
    id: 'tl-test-growth-scan',
    title: 'Third Trimester Fetal Growth Ultrasound',
    type: 'clinical_test',
    targetWeek: 32,
    status: 'upcoming',
    doctorOrLocation: 'Ultrasound Imaging Suite',
    description: 'Evaluates fetal growth percentile, placental health, and amniotic fluid volume (AFI).',
    clinicalAction: 'Verify baby position (cephalic presentation)',
    badgeLabel: 'ULTRASOUND',
    badgeColor: '#0EA5E9',
    isCompleted: false,
  },
  {
    id: 'tl-test-gbs-swab',
    title: 'Group B Streptococcus (GBS) Screening',
    type: 'clinical_test',
    targetWeek: 36,
    status: 'upcoming',
    doctorOrLocation: 'Maternity Clinic / Hospital',
    description: 'Routine swab test to protect baby against bacterial infection during delivery.',
    clinicalAction: 'Discuss birth plan & labor signs',
    badgeLabel: 'CLINICAL SWAB',
    badgeColor: '#D97706',
    isCompleted: false,
  },
  {
    id: 'tl-milestone-full-term',
    title: 'Full Term Milestone! (Week 37)',
    type: 'milestone',
    targetWeek: 37,
    status: 'upcoming',
    description: 'Baby is fully developed and ready for birth at any time. Pack hospital bag!',
    badgeLabel: 'MILESTONE',
    badgeColor: '#10B981',
    isCompleted: false,
  },
  {
    id: 'tl-milestone-edd',
    title: 'Estimated Delivery Date (EDD)',
    type: 'milestone',
    targetWeek: 40,
    status: 'upcoming',
    doctorOrLocation: 'Labor & Delivery Hospital',
    description: 'Welcome your little miracle to the world!',
    badgeLabel: 'BIRTH DAY',
    badgeColor: '#E11D48',
    isCompleted: false,
  },
];

import { useAppointmentStore, isMockAppointment } from './appointment.store';

export const useTimelineStore = create<TimelineState>((set, get) => ({
  filter: 'all',
  searchQuery: '',
  items: CLINICAL_TIMELINE_TEMPLATE.map((item) => ({
    ...item,
    dateStr: calculateWeekDate(item.targetWeek),
  })),

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleItemCompleted: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      ),
    }));
  },

  getFilteredItems: (currentWeek = 20) => {
    const { items, filter, searchQuery } = get();

    // Map live database appointments from appointment store into timeline items
    const liveAppointments = useAppointmentStore
      .getState()
      .appointments.filter((appt) => !isMockAppointment(appt.id))
      .map((appt) => ({
      id: appt.id,
      title: appt.title,
      type: 'appointment' as const,
      dateStr: `${appt.dateStr} • ${appt.timeStr}`,
      targetWeek: currentWeek,
      status: (appt.isCompleted ? 'completed' : 'upcoming') as 'completed' | 'upcoming',
      doctorOrLocation: appt.doctorName ? `Dr. ${appt.doctorName}${appt.hospitalName ? ` (${appt.hospitalName})` : ''}` : appt.hospitalName || 'Clinic Visit',
      description: appt.notes || 'Clinical consultation and checkup.',
      badgeLabel: 'APPOINTMENT',
      badgeColor: '#0EA5E9',
      isCompleted: appt.isCompleted || false,
    }));

    const allItems = [...liveAppointments, ...items];

    return allItems.filter((item) => {
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

