import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api/client';

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
  fileUrl?: string;
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

export const isMockDocument = (id: string): boolean => {
  if (!id) return true;
  return (
    id === 'doc-anomaly-scan-20w' ||
    id === 'doc-presc-iron-calcium' ||
    id === 'doc-lab-gtt-cbc' ||
    id === 'doc-first-trimester-scan' ||
    id === 'doc-tetanus-vaccine' ||
    id.startsWith('mock_') ||
    id.startsWith('default_')
  );
};

// Helper for auth headers
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

export const useVaultStore = create<VaultState>((set, get) => ({
  documents: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: 'all',

  loadDocuments: async () => {
    set({ isLoading: true });

    // 1. Instantly clean any mock files from local AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const sanitized = parsed.filter((d: any) => !isMockDocument(d.id));
          if (sanitized.length !== parsed.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          }
          set({ documents: sanitized });
        }
      }
    } catch {
      // quiet catch
    }

    // 2. Fetch live authentic documents from Neon PostgreSQL DB
    try {
      const { headers, userId, email } = await getAuthHeaders();
      const res = await apiClient.get('/vault/documents', {
        headers,
        params: { userId, email },
      });

      if (res?.data?.success && Array.isArray(res.data.data)) {
        const dbDocs: MedicalDocument[] = res.data.data
          .filter((d: any) => !isMockDocument(d.id))
          .map((d: any) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            date: d.date,
            doctorName: d.doctorName || '',
            clinicName: d.clinicName || '',
            notes: d.notes || '',
            fileType: d.fileType || 'pdf',
            fileSize: d.fileSize || '1.5 MB',
            fileUrl: d.fileUrl || '',
            isSharedWithCaregiver: d.isSharedWithCaregiver ?? true,
            appointmentId: d.appointmentId,
            createdAt: d.createdAt || new Date().toISOString(),
          }));

        set({ documents: dbDocs });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dbDocs));
      }
    } catch (e) {
      console.warn('Vault backend sync failed, using sanitized local store:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  addDocument: async (newDoc) => {
    const tempId = `doc-${Date.now()}`;
    const docWithId: MedicalDocument = {
      ...newDoc,
      id: tempId,
      createdAt: new Date().toISOString(),
    };

    const currentDocs = get().documents.filter((d) => !isMockDocument(d.id));
    const updated = [docWithId, ...currentDocs];
    set({ documents: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Persist to Neon DB
    try {
      const { headers, userId, email } = await getAuthHeaders();
      const res = await apiClient.post(
        '/vault/documents',
        {
          ...newDoc,
          userId,
          email,
        },
        { headers }
      );

      if (res?.data?.success && res.data.data?.id) {
        const serverId = res.data.data.id;
        const remapped = get().documents.map((d) => (d.id === tempId ? { ...d, id: serverId } : d));
        set({ documents: remapped });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remapped));
      }
    } catch (e) {
      console.warn('Realtime vault document database upload failed:', e);
    }
  },

  deleteDocument: async (id: string) => {
    const updated = get().documents.filter((d) => d.id !== id);
    set({ documents: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const { headers, userId, email } = await getAuthHeaders();
      await apiClient.delete(`/vault/documents/${id}`, {
        headers,
        params: { userId, email },
      });
    } catch (error) {
      console.error('Failed to delete document from database:', error);
    }
  },

  toggleCaregiverShare: async (id: string) => {
    const updated = get().documents.map((d) =>
      d.id === id ? { ...d, isSharedWithCaregiver: !d.isSharedWithCaregiver } : d
    );
    set({ documents: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      const { headers, userId, email } = await getAuthHeaders();
      await apiClient.patch(`/vault/documents/${id}/share`, {}, {
        headers,
        params: { userId, email },
      });
    } catch (error) {
      console.error('Failed to toggle document sharing in database:', error);
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getFilteredDocuments: () => {
    const { documents, searchQuery, selectedCategory } = get();
    return documents
      .filter((doc) => !isMockDocument(doc.id))
      .filter((doc) => {
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
