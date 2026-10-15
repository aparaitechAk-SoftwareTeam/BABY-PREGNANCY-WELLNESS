import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

interface LanguageState {
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

const STORAGE_KEY = '@aparaitech_app_language_v1';

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLanguage: 'en',
  isLoading: false,

  loadLanguage: async () => {
    try {
      set({ isLoading: true });
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'mr') {
        set({ currentLanguage: stored });
      }
    } catch (e) {
      console.error('Failed to load language preference:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setLanguage: async (lang) => {
    set({ currentLanguage: lang });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language preference:', e);
    }
  },
}));

// Multi-language clinical translations dictionary
export const TRANSLATIONS = {
  en: {
    welcome: 'Welcome',
    week: 'Week',
    trimester: 'Trimester',
    daysLeft: 'Days Remaining',
    steps: 'Daily Steps',
    hydration: 'Hydration',
    kicks: 'Fetal Kicks',
    weight: 'Weight',
    routine: 'Daily Routine',
    doctorVisit: 'Upcoming Appointment',
    emergencySOS: 'Emergency SOS',
    audioGuides: 'Regional Audio Guides',
    audioGuidesSub: 'Listen to clinical pregnancy guides in Marathi, Hindi & English',
  },
  hi: {
    welcome: 'नमस्ते',
    week: 'सप्ताह',
    trimester: 'तिमाही',
    daysLeft: 'दिन शेष',
    steps: 'दैनिक कदम',
    hydration: 'पानी की मात्रा',
    kicks: 'शिशु की हलचल',
    weight: 'वजन',
    routine: 'दैनिक दिनचर्या',
    doctorVisit: 'आगामी डॉक्टर अपॉइंटमेंट',
    emergencySOS: 'आपातकालीन एसओएस',
    audioGuides: 'क्षेत्रीय ऑडियो गाइड्स',
    audioGuidesSub: 'मराठी, हिंदी और अंग्रेजी में गर्भावस्था ऑडियो गाइड सुनें',
  },
  mr: {
    welcome: 'नमस्कार',
    week: 'आठवडा',
    trimester: 'तिमाही',
    daysLeft: 'दिवस शिल्लक',
    steps: 'दैनंदिन पावले',
    hydration: 'पाणी प्रमाण',
    kicks: 'बाळाच्या हालचाली',
    weight: 'वजन',
    routine: 'दैनंदिन दिनक्रम',
    doctorVisit: 'पुढील डॉक्टरांची भेट',
    emergencySOS: 'तातडीची मदत (SOS)',
    audioGuides: 'प्रादेशिक ऑडिओ मार्गदर्शक',
    audioGuidesSub: 'मराठी, हिंदी आणि इंग्रजीमध्ये वैद्यकीय मार्गदर्शन ऐका',
  },
};
