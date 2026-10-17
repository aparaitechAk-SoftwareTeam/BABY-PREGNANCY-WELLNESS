import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any;
  token: string | null;
  isHydrated: boolean;
  setUser: (user: any) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  setUser: async (user: any) => {
    set({ user });
    try {
      if (user) {
        await AsyncStorage.setItem('aparai_user', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('aparai_user');
      }
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  },

  setToken: async (token: string | null) => {
    set({ token });
    try {
      if (token) {
        await AsyncStorage.setItem('aparai_token', token);
      } else {
        await AsyncStorage.removeItem('aparai_token');
      }
    } catch (error) {
      console.error('Failed to save token to storage:', error);
    }
  },

  logout: async () => {
    set({ user: null, token: null });
    try {
      await AsyncStorage.multiRemove(['aparai_user', 'aparai_token', 'aparai_pregnancy_profile']);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },

  hydrate: async () => {
    try {
      const [userData, tokenData] = await AsyncStorage.multiGet(['aparai_user', 'aparai_token']);
      
      if (userData[1]) {
        set({ user: JSON.parse(userData[1]) });
      }
      if (tokenData[1]) {
        set({ token: tokenData[1] });
      }
      
      set({ isHydrated: true });
    } catch (error) {
      console.error('Failed to hydrate auth state:', error);
      set({ isHydrated: true });
    }
  },
}));
