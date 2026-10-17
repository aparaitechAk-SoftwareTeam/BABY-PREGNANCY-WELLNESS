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

const INITIAL_DOCUMENTS: MedicalDocument[] = [];

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
