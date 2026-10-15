import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DocumentCategory =
  | 'ultrasound'
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'vaccination';

export interface MedicalDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  date: string; // YYYY-MM-DD
  doctorName: string;
  clinicName: string;
  notes: string;
  fileType: 'pdf' | 'image' | 'scan';
  fileSize: string;
  isSharedWithCaregiver: boolean;
  appointmentId?: string;
  createdAt: string;
}

interface VaultState {
  documents: MedicalDocument[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: DocumentCategory | 'all';

  // Actions
  loadDocuments: () => Promise<void>;
  addDocument: (doc: Omit<MedicalDocument, 'id' | 'createdAt'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  toggleCaregiverShare: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: DocumentCategory | 'all') => void;
  getFilteredDocuments: () => MedicalDocument[];
}

const STORAGE_KEY = '@aparaitech_medical_vault_v1';

const INITIAL_DOCUMENTS: MedicalDocument[] = [
  {
    id: 'doc-anomaly-scan-20w',
    title: 'Level II Fetal Anomaly Ultrasound Scan',
    category: 'ultrasound',
    date: '2026-10-12',
    doctorName: 'Dr. Priya Sharma',
    clinicName: 'Apollo Cradle Maternity Hospital',
    notes: 'Normal anatomy survey. Fetal biometry consistent with 20w1d. Amniotic fluid index (AFI) 14.2 cm. Placenta fundal posterior, grade 0. Fetal heart rate 146 bpm.',
    fileType: 'pdf',
    fileSize: '3.4 MB',
    isSharedWithCaregiver: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-presc-iron-calcium',
    title: 'Prenatal Vitamin & Iron-Calcium Prescription',
    category: 'prescription',
    date: '2026-10-12',
    doctorName: 'Dr. Priya Sharma',
    clinicName: 'Apollo Cradle Maternity Hospital',
    notes: 'Tab. Ferrous Ascorbate 100mg once daily after lunch with lemon water. Tab. Calcium Carbonate 500mg with Vitamin D3 at night. Maintain 2 hours gap between iron and calcium.',
    fileType: 'image',
    fileSize: '1.2 MB',
    isSharedWithCaregiver: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-lab-gtt-cbc',
    title: 'Second Trimester CBC & Blood Sugar Panel',
    category: 'lab_report',
    date: '2026-10-02',
    doctorName: 'Pathology Diagnostics Centre',
    clinicName: 'Apollo Cradle Maternity Hospital',
    notes: 'Hemoglobin: 11.8 g/dL (Normal). Fasting Blood Glucose: 84 mg/dL. Platelet count: 240,000 /mcL. Urine routine: No proteinuria or glucosuria detected.',
    fileType: 'pdf',
    fileSize: '1.8 MB',
    isSharedWithCaregiver: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-first-trimester-scan',
    title: '12-Week NT / Nuchal Translucency Scan',
    category: 'ultrasound',
    date: '2026-08-18',
    doctorName: 'Dr. Priya Sharma',
    clinicName: 'Apollo Cradle Maternity Hospital',
    notes: 'CRL 58mm corresponding to 12w2d. NT measured 1.4mm (normal range < 2.5mm). Nasal bone present. Low risk assessment for trisomies.',
    fileType: 'pdf',
    fileSize: '2.9 MB',
    isSharedWithCaregiver: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'doc-tetanus-vaccine',
    title: 'Tetanus Toxoid (TT-1) Immunization Certificate',
    category: 'vaccination',
    date: '2026-09-14',
    doctorName: 'Dr. Priya Sharma',
    clinicName: 'Apollo Cradle Maternity Hospital',
    notes: 'Dose 1 administered at 16 weeks gestation. Next booster dose (TT-2) scheduled for Week 20 checkup.',
    fileType: 'pdf',
    fileSize: '850 KB',
    isSharedWithCaregiver: true,
    createdAt: new Date().toISOString(),
  },
];

export const useVaultStore = create<VaultState>((set, get) => ({
  documents: INITIAL_DOCUMENTS,
  isLoading: false,
  searchQuery: '',
  selectedCategory: 'all',

  loadDocuments: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ documents: parsed });
          return;
        }
      }
      // Save initial documents if none exist
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      set({ documents: INITIAL_DOCUMENTS });
    } catch (error) {
      console.error('Failed to load documents from vault store:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addDocument: async (newDoc) => {
    const docWithId: MedicalDocument = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [docWithId, ...get().documents];
    set({ documents: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save added document to storage:', error);
    }
  },

  deleteDocument: async (id: string) => {
    const updated = get().documents.filter((d) => d.id !== id);
    set({ documents: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete document from storage:', error);
    }
  },

  toggleCaregiverShare: async (id: string) => {
    const updated = get().documents.map((d) =>
      d.id === id ? { ...d, isSharedWithCaregiver: !d.isSharedWithCaregiver } : d
    );
    set({ documents: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to toggle document sharing in storage:', error);
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getFilteredDocuments: () => {
    const { documents, searchQuery, selectedCategory } = get();
    return documents.filter((doc) => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.clinicName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  },
}));
