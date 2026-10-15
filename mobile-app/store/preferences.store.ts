import { create } from 'zustand';
export const usePreferencesStore = create((set) => ({ theme: 'light', remindersEnabled: true }));
