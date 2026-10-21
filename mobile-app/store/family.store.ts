import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { familyApi, PairedMember, PendingRequest, MotherLiveData } from '../services/api/family.api';

const CACHED_CODE_KEY = '@aparaitech_mother_pairing_code';

interface FamilyStoreState {
  // Mother's state
  pairingCode: string;
  pairedMembers: PairedMember[];
  pendingRequests: PendingRequest[];
  isLoadingMotherCode: boolean;

  // Caregiver's state
  isCaregiverPaired: boolean;
  caregiverStatus: 'ACTIVE' | 'PENDING' | 'NONE';
  pairedMother: any | null;
  motherLiveData: MotherLiveData | null;
  isLoadingMotherData: boolean;
  isPairingSubmitting: boolean;

  // Actions for Mother
  fetchMotherPairingInfo: () => Promise<void>;
  generateNewCode: (relationship?: string) => Promise<string>;
  acceptCaregiverRequest: (pairingId: string) => Promise<{ success: boolean; message: string }>;
  rejectCaregiverRequest: (pairingId: string) => Promise<{ success: boolean; message: string }>;
  unlinkCaregiver: (pairingId: string) => Promise<void>;

  // Actions for Caregiver
  fetchCaregiverStatus: () => Promise<boolean>;
  pairWithMother: (code: string, relationship?: string) => Promise<{ success: boolean; status?: string; message: string }>;
  fetchMotherLiveData: () => Promise<void>;
}

export const useFamilyStore = create<FamilyStoreState>((set, get) => ({
  pairingCode: '438618',
  pairedMembers: [],
  pendingRequests: [],
  isLoadingMotherCode: false,

  isCaregiverPaired: false,
  caregiverStatus: 'NONE',
  pairedMother: null,
  motherLiveData: null,
  isLoadingMotherData: false,
  isPairingSubmitting: false,

  fetchMotherPairingInfo: async () => {
    // 1. Immediately hydrate from cache to prevent any "Loading..." or "Generating..." delay
    try {
      const cached = await AsyncStorage.getItem(CACHED_CODE_KEY);
      if (cached && !get().pairingCode) {
        set({ pairingCode: cached });
      }
    } catch {
      // quiet cache catch
    }

    set({ isLoadingMotherCode: !get().pairingCode });
    try {
      const res = await familyApi.getMyCode();
      if (res && res.success && res.pairingCode) {
        set({
          pairingCode: res.pairingCode,
          pairedMembers: res.pairedMembers || [],
          pendingRequests: res.pendingRequests || [],
        });
        await AsyncStorage.setItem(CACHED_CODE_KEY, res.pairingCode);
        return;
      }

      // If database returned empty or no pairing code, request database to generate one
      if (!get().pairingCode) {
        const genRes = await familyApi.generateNewCode();
        if (genRes && genRes.pairingCode) {
          set({ pairingCode: genRes.pairingCode });
          await AsyncStorage.setItem(CACHED_CODE_KEY, genRes.pairingCode);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch mother pairing info from server:', e);
      // Fallback: check if we have any cached code
      try {
        const cached = await AsyncStorage.getItem(CACHED_CODE_KEY);
        if (cached) {
          set({ pairingCode: cached });
        }
      } catch {
        // ignore
      }
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
        await AsyncStorage.setItem(CACHED_CODE_KEY, res.pairingCode);
        return res.pairingCode;
      }
      return get().pairingCode;
    } finally {
      set({ isLoadingMotherCode: false });
    }
  },

  acceptCaregiverRequest: async (pairingId: string) => {
    try {
      const res = await familyApi.acceptRequest(pairingId);
      await get().fetchMotherPairingInfo();
      return { success: true, message: res.message || 'Request approved successfully!' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to approve request';
      return { success: false, message: typeof msg === 'string' ? msg : 'Failed to approve request' };
    }
  },

  rejectCaregiverRequest: async (pairingId: string) => {
    try {
      const res = await familyApi.rejectRequest(pairingId);
      await get().fetchMotherPairingInfo();
      return { success: true, message: res.message || 'Request rejected.' };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reject request';
      return { success: false, message: typeof msg === 'string' ? msg : 'Failed to reject request' };
    }
  },

  unlinkCaregiver: async (pairingId: string) => {
    try {
      await familyApi.unlinkPairing(pairingId);
      set((state) => ({
        pairedMembers: state.pairedMembers.filter((m) => m.id !== pairingId),
        pendingRequests: state.pendingRequests.filter((r) => r.id !== pairingId),
      }));
    } catch (err) {
      throw err;
    }
  },

  fetchCaregiverStatus: async () => {
    try {
      const res = await familyApi.getCaregiverStatus();
      if (res && res.status === 'ACTIVE') {
        set({
          isCaregiverPaired: true,
          caregiverStatus: 'ACTIVE',
          pairedMother: res.mother,
        });
        // Auto trigger mother live data load
        get().fetchMotherLiveData();
        return true;
      } else if (res && res.status === 'PENDING') {
        set({
          isCaregiverPaired: false,
          caregiverStatus: 'PENDING',
          pairedMother: res.mother,
          motherLiveData: null,
        });
        return false;
      } else {
        set({
          isCaregiverPaired: false,
          caregiverStatus: 'NONE',
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
        if (res.status === 'ACTIVE') {
          set({
            isCaregiverPaired: true,
            caregiverStatus: 'ACTIVE',
            pairedMother: res.mother,
          });
          // Immediately fetch live mother data from Neon DB
          await get().fetchMotherLiveData();
        } else {
          set({
            isCaregiverPaired: false,
            caregiverStatus: 'PENDING',
            pairedMother: res.mother,
            motherLiveData: null,
          });
        }
        return {
          success: true,
          status: res.status,
          message: res.message || 'Pairing request submitted! Awaiting mother approval.',
        };
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
          caregiverStatus: 'ACTIVE',
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

