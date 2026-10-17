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

const DEFAULT_TIMELINE_ITEMS: TimelineItem[] = [
  {
    id: 'tl-today-vitamins',
    title: 'Prenatal Vitamins & Folic Acid',
    type: 'routine_habit',
    dateStr: 'Today • 08:30 AM',
    targetWeek: 20,
    status: 'today',
    description: 'Essential micronutrients & iron absorption with citrus juice or breakfast.',
    badgeLabel: 'DAILY HABIT',
    badgeColor: '#E11D48',
    isCompleted: true,
  },
  {
    id: 'tl-today-appt',
    title: 'Second Trimester Routine Checkup',
    type: 'appointment',
    dateStr: 'Today • 10:30 AM',
    targetWeek: 20,
    status: 'today',
    doctorOrLocation: 'Maternity Clinic / OB-GYN',
    description: 'Blood pressure check, fundal height measurement, and ultrasound review.',
    clinicalAction: 'Bring previous ultrasound report & questions list',
    badgeLabel: 'DOCTOR VISIT',
    badgeColor: '#0EA5E9',
    isCompleted: false,
  },
  {
    id: 'tl-milestone-halfway',
    title: 'Halfway Milestone! (Week 20)',
    type: 'milestone',
    dateStr: 'This Week • Week 20',
    targetWeek: 20,
    status: 'today',
    description: 'You have reached 50% of your pregnancy journey! Baby is roughly 26 cm and can hear sounds.',
    badgeLabel: 'MILESTONE',
    badgeColor: '#10B981',
    isCompleted: true,
  },
  {
    id: 'tl-test-gtt',
    title: 'Oral Glucose Tolerance Screening (GTT)',
    type: 'clinical_test',
    dateStr: 'Week 24 • Nov 12, 2026',
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
    dateStr: 'Week 28 • Dec 10, 2026',
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
    dateStr: 'Week 24 • Nov 10, 2026',
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
    dateStr: 'Week 32 • Jan 07, 2027',
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
    dateStr: 'Week 36 • Feb 04, 2027',
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
    dateStr: 'Week 37 • Feb 11, 2027',
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
    dateStr: 'Week 40 • Mar 04, 2027',
    targetWeek: 40,
    status: 'upcoming',
    doctorOrLocation: 'Labor & Delivery Hospital',
    description: 'Welcome your little miracle to the world!',
    badgeLabel: 'BIRTH DAY',
    badgeColor: '#E11D48',
    isCompleted: false,
  },
];

export const useTimelineStore = create<TimelineState>((set, get) => ({
  filter: 'all',
  searchQuery: '',
  items: DEFAULT_TIMELINE_ITEMS,

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
