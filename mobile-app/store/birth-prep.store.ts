import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChecklistItem {
  id: string;
  name: string;
  category: 'mother' | 'baby' | 'partner' | 'documents';
  isPacked: boolean;
  notes?: string;
  isEssential?: boolean;
}

export interface BirthPlanPreferences {
  laborCompanion: string; // e.g. 'Partner / Husband'
  painManagement: string; // e.g. 'Epidural on request', 'Natural breathing', etc.
  laborEnvironment: string[]; // e.g. ['Dim lights', 'Freedom of movement', 'Calm music']
  deliveryPreferences: string[]; // e.g. ['Delayed cord clamping', 'Skin-to-skin contact immediately']
  feedingChoice: string; // e.g. 'Exclusive breastfeeding'
  specialWishes: string;
}

interface BirthPrepState {
  checklist: ChecklistItem[];
  birthPlan: BirthPlanPreferences;
  isLoading: boolean;

  // Actions
  loadBirthPrepData: () => Promise<void>;
  toggleItemPacked: (id: string) => Promise<void>;
  addCustomChecklistItem: (name: string, category: ChecklistItem['category']) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
  updateBirthPlan: (plan: Partial<BirthPlanPreferences>) => Promise<void>;
  getStats: () => { total: number; packed: number; percent: number };
}

const STORAGE_KEY = '@aparaitech_birth_prep_v1';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Mother's Essentials
  { id: 'mb-1', name: 'Front-open nursing nightgowns / maternity dresses (3 sets)', category: 'mother', isPacked: false, isEssential: true },
  { id: 'mb-2', name: 'Maternity pads / high-absorbency postpartum pads (2 packs)', category: 'mother', isPacked: false, isEssential: true },
  { id: 'mb-3', name: 'Nursing bras (non-wired) & breast pads', category: 'mother', isPacked: false, isEssential: true },
  { id: 'mb-4', name: 'High-waisted disposable cotton panties (5-6 pairs)', category: 'mother', isPacked: false, isEssential: true },
  { id: 'mb-5', name: 'Warm non-slip socks & comfortable room slippers', category: 'mother', isPacked: false, isEssential: false },
  { id: 'mb-6', name: 'Toiletries kit (toothbrush, paste, lip balm, mild soap, comb)', category: 'mother', isPacked: false, isEssential: true },
  { id: 'mb-7', name: 'Comfortable loose going-home outfit', category: 'mother', isPacked: false, isEssential: false },

  // Baby's Essentials
  { id: 'bb-1', name: 'Newborn front-button onesies / jhablas (4-5 sets)', category: 'baby', isPacked: false, isEssential: true },
  { id: 'bb-2', name: 'Soft muslin cotton swaddle wraps & receiving blankets (3)', category: 'baby', isPacked: false, isEssential: true },
  { id: 'bb-3', name: 'Newborn diapers (NB / Size 0 pack) & fragrance-free wipes', category: 'baby', isPacked: false, isEssential: true },
  { id: 'bb-4', name: 'Baby caps, mittens & soft cotton booties (3 sets)', category: 'baby', isPacked: false, isEssential: true },
  { id: 'bb-5', name: 'Soft baby burp cloths & bibs (4)', category: 'baby', isPacked: false, isEssential: false },
  { id: 'bb-6', name: 'Baby car seat / carry-nest for safe discharge journey', category: 'baby', isPacked: false, isEssential: true },

  // Partner's Essentials
  { id: 'pb-1', name: 'Change of clothes & light jacket for hospital stay', category: 'partner', isPacked: false, isEssential: true },
  { id: 'pb-2', name: 'Phone chargers with extra-long cables & power bank', category: 'partner', isPacked: false, isEssential: true },
  { id: 'pb-3', name: 'Light snacks (energy bars, dry fruits, glucose biscuits)', category: 'partner', isPacked: false, isEssential: false },
  { id: 'pb-4', name: 'Water bottle with straw & thermos flask', category: 'partner', isPacked: false, isEssential: false },
  { id: 'pb-5', name: 'Hospital admission cash / credit cards for quick counter bills', category: 'partner', isPacked: false, isEssential: true },

  // Legal & Delivery Documents
  { id: 'db-1', name: 'Aadhaar / Government Photo ID cards (Mother & Father)', category: 'documents', isPacked: false, isEssential: true },
  { id: 'db-2', name: 'Health Insurance / Mediclaim TPA Card & Pre-Auth letter', category: 'documents', isPacked: false, isEssential: true },
  { id: 'db-3', name: 'Doctor’s Hospital Admission Note / Requisition slip', category: 'documents', isPacked: false, isEssential: true },
  { id: 'db-4', name: 'Complete Pregnancy Medical File (all ultrasounds, blood tests, GTT)', category: 'documents', isPacked: false, isEssential: true },
  { id: 'db-5', name: 'Hospital pre-booking receipt & room reservation form', category: 'documents', isPacked: false, isEssential: false },
];

const DEFAULT_BIRTH_PLAN: BirthPlanPreferences = {
  laborCompanion: 'Partner / Husband present throughout labor',
  painManagement: 'Epidural available on request after active labor begins',
  laborEnvironment: [
    'Freedom to walk around and use birth ball',
    'Dim soothing lighting and quiet room',
    'Supportive breathing encouragement',
  ],
  deliveryPreferences: [
    'Delayed umbilical cord clamping (1-2 minutes)',
    'Immediate skin-to-skin contact with mother',
    'Baby placed on maternal chest before newborn measurements',
  ],
  feedingChoice: 'Exclusive breastfeeding initiated within first golden hour',
  specialWishes: 'We would like partner to cut the umbilical cord if clinically safe.',
};

export const useBirthPrepStore = create<BirthPrepState>((set, get) => ({
  checklist: DEFAULT_CHECKLIST,
  birthPlan: DEFAULT_BIRTH_PLAN,
  isLoading: false,

  loadBirthPrepData: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.checklist && parsed.birthPlan) {
          set({ checklist: parsed.checklist, birthPlan: parsed.birthPlan });
          return;
        }
      }
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checklist: DEFAULT_CHECKLIST, birthPlan: DEFAULT_BIRTH_PLAN })
      );
      set({ checklist: DEFAULT_CHECKLIST, birthPlan: DEFAULT_BIRTH_PLAN });
    } catch (e) {
      console.error('Failed to load birth prep data:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleItemPacked: async (id) => {
    const updated = get().checklist.map((item) =>
      item.id === id ? { ...item, isPacked: !item.isPacked } : item
    );
    set({ checklist: updated });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checklist: updated, birthPlan: get().birthPlan })
      );
    } catch (e) {
      console.error('Failed to save checklist state:', e);
    }
  },

  addCustomChecklistItem: async (name, category) => {
    const newItem: ChecklistItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      category,
      isPacked: false,
      isEssential: false,
    };
    const updated = [...get().checklist, newItem];
    set({ checklist: updated });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checklist: updated, birthPlan: get().birthPlan })
      );
    } catch (e) {
      console.error('Failed to save added checklist item:', e);
    }
  },

  deleteChecklistItem: async (id) => {
    const updated = get().checklist.filter((item) => item.id !== id);
    set({ checklist: updated });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checklist: updated, birthPlan: get().birthPlan })
      );
    } catch (e) {
      console.error('Failed to delete checklist item:', e);
    }
  },

  updateBirthPlan: async (planUpdates) => {
    const updated = { ...get().birthPlan, ...planUpdates };
    set({ birthPlan: updated });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ checklist: get().checklist, birthPlan: updated })
      );
    } catch (e) {
      console.error('Failed to save birth plan preferences:', e);
    }
  },

  getStats: () => {
    const { checklist } = get();
    const total = checklist.length;
    const packed = checklist.filter((i) => i.isPacked).length;
    const percent = total > 0 ? Math.round((packed / total) * 100) : 0;
    return { total, packed, percent };
  },
}));
