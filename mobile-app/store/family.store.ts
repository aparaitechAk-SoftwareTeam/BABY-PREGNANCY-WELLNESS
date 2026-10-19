import { create } from 'zustand';
import { familyApi, PairedMember, MotherLiveData } from '../services/api/family.api';

interface FamilyStoreState {
  // Mother's state
  pairingCode: string;
  pairedMembers: PairedMember[];
  isLoadingMotherCode: boolean;

  // Caregiver's state
  isCaregiverPaired: boolean;
  pairedMother: any | null;
  motherLiveData: MotherLiveData | null;
  isLoadingMotherData: boolean;
  isPairingSubmitting: boolean;

  // Actions for Mother
  fetchMotherPairingInfo: () => Promise<void>;
  generateNewCode: (relationship?: string) => Promise<string>;
  unlinkCaregiver: (pairingId: string) => Promise<void>;

  // Actions for Caregiver
  fetchCaregiverStatus: () => Promise<boolean>;
  pairWithMother: (code: string, relationship?: string) => Promise<{ success: boolean; message: string }>;
  fetchMotherLiveData: () => Promise<void>;
}

export const useFamilyStore = create<FamilyStoreState>((set, get) => ({
  pairingCode: '',
  pairedMembers: [],
  isLoadingMotherCode: false,

  isCaregiverPaired: false,
  pairedMother: null,
  motherLiveData: null,
  isLoadingMotherData: false,
  isPairingSubmitting: false,

  fetchMotherPairingInfo: async () => {
    set({ isLoadingMotherCode: true });
    try {
      const res = await familyApi.getMyCode();
      if (res && res.success) {
        set({
          pairingCode: res.pairingCode || '',
          pairedMembers: res.pairedMembers || [],
        });
      }
    } catch {
      // Keep existing state or fallback
    } finally {
      set({ isLoadingMotherCode: false });
    }
  },

  generateNewCode: async (relationship?: string) => {
    set({ isLoadingMotherCode: true });
    try {
      const res = await familyApi.generateNewCode(relationship);
      if (res && res.pairingCode) {
        set({ pairingCode: res.pairingCode });
        return res.pairingCode;
      }
      return get().pairingCode;
    } finally {
      set({ isLoadingMotherCode: false });
    }
  },

  unlinkCaregiver: async (pairingId: string) => {
    try {
      await familyApi.unlinkPairing(pairingId);
      set((state) => ({
        pairedMembers: state.pairedMembers.filter((m) => m.id !== pairingId),
      }));
    } catch (err) {
      throw err;
    }
  },

  fetchCaregiverStatus: async () => {
    try {
      const res = await familyApi.getCaregiverStatus();
      if (res && res.isPaired) {
        set({
          isCaregiverPaired: true,
          pairedMother: res.mother,
        });
        // Auto trigger mother live data load
        get().fetchMotherLiveData();
        return true;
      } else {
        set({
          isCaregiverPaired: false,
          pairedMother: null,
          motherLiveData: null,
        });
        return false;
      }
    } catch {
      return false;
    }
  },

  pairWithMother: async (code: string, relationship?: string) => {
    set({ isPairingSubmitting: true });
    try {
      const res = await familyApi.pairWithMother(code, relationship);
      if (res && res.success) {
        set({
          isCaregiverPaired: true,
          pairedMother: res.mother,
        });
        // Immediately fetch live mother data from Neon DB
        await get().fetchMotherLiveData();
        return { success: true, message: res.message || 'Linked successfully!' };
      }
      return { success: false, message: 'Could not link with mother.' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to link account';
      return {
        success: false,
        message: typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Failed to link account',
      };
    } finally {
      set({ isPairingSubmitting: false });
    }
  },

  fetchMotherLiveData: async () => {
    set({ isLoadingMotherData: true });
    try {
      const data = await familyApi.getMotherData();
      if (data && data.success) {
        set({
          motherLiveData: data,
          isCaregiverPaired: true,
          pairedMother: data.mother,
        });
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        set({
          isCaregiverPaired: false,
          motherLiveData: null,
        });
      }
    } finally {
      set({ isLoadingMotherData: false });
    }
  },
}));
