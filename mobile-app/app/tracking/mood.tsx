import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  Smile,
  Heart,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
}

const MOODS: MoodOption[] = [
  { id: 'joyful', label: 'Grateful & Joyful', emoji: '🥰', bgColor: '#FEE2E6', textColor: '#BE123C' },
  { id: 'calm', label: 'Calm & Peaceful', emoji: '😌', bgColor: '#E0F2FE', textColor: '#0284C7' },
  { id: 'tired', label: 'Tired & Low Energy', emoji: '🥱', bgColor: '#FEF3C7', textColor: '#B45309' },
  { id: 'emotional', label: 'Sensitive & Weepy', emoji: '🥺', bgColor: '#F3E8FF', textColor: '#7E22CE' },
  { id: 'anxious', label: 'Anxious or Worried', emoji: '😰', bgColor: '#FFEDD5', textColor: '#C2410C' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌪️', bgColor: '#F1F5F9', textColor: '#475569' },
];

interface MoodLogEntry {
  id: string;
  dateStr: string;
  week: number;
  moodId: string;
  moodLabel: string;
  moodEmoji: string;
  energyLevel: 'Low' | 'Moderate' | 'High';
  journalText?: string;
}

const DEFAULT_LOGS: MoodLogEntry[] = [];

const STORAGE_KEY = 'aparai_mood_journal_v1';

export default function MoodTrackerScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const [selectedMood, setSelectedMood] = useState<MoodOption>(MOODS[0]);
  const [energyLevel, setEnergyLevel] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [journalText, setJournalText] = useState('');
  const [logs, setLogs] = useState<MoodLogEntry[]>(DEFAULT_LOGS);

  // Load history
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLogs(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load mood logs:', e);
      }
    })();
  }, []);

  const handleSaveEntry = async () => {
    const now = new Date();
    const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newEntry: MoodLogEntry = {
      id: 'mlog_' + Date.now(),
      dateStr,
      week: currentWeek,
      moodId: selectedMood.id,
      moodLabel: selectedMood.label,
      moodEmoji: selectedMood.emoji,
      energyLevel,
      journalText: journalText.trim() || undefined,
    };

    const updated = [newEntry, ...logs];
    setLogs(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save mood log:', e);
    }

    setJournalText('');
    Alert.alert('Journal Saved! 📖', 'Your emotional check-in and thoughts have been added to your diary.');
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Delete Entry', 'Remove this check-in from your diary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = logs.filter((l) => l.id !== id);
          setLogs(updated);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to delete mood log:', e);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Mood & Emotional Wellbeing</Text>
          <Text style={styles.headerSubtitle}>Daily check-in & maternal pregnancy diary</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro Affirmation */}
        <View style={styles.affirmationCard}>
          <Heart size={18} color="#E11D48" />
          <Text style={styles.affirmationText}>
            Hormonal shifts throughout pregnancy are completely natural. Honoring your emotions helps create a loving, calm space for you and your baby.
          </Text>
        </View>

        {/* Mood Selector Grid */}
        <Text style={styles.sectionHeading}>How are you feeling today?</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((item) => {
            const isSelected = selectedMood.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedMood(item)}
                style={[
                  styles.moodCard,
                  isSelected && { borderColor: item.textColor, borderWidth: 2, backgroundColor: item.bgColor },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text style={[styles.moodLabel, isSelected && { color: item.textColor, fontWeight: '700' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Energy Level Selector */}
        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>Current Energy Level</Text>
          <View style={styles.energyRow}>
            {(['Low', 'Moderate', 'High'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setEnergyLevel(lvl)}
                style={[
                  styles.energyBtn,
                  energyLevel === lvl && styles.energyBtnActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.energyBtnText,
                    energyLevel === lvl && styles.energyBtnTextActive,
                  ]}
                >
                  {lvl === 'Low' ? '🪫 Low' : lvl === 'Moderate' ? '🔋 Balanced' : '⚡ High Energy'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Private Diary / Journal Input */}
        <View style={styles.journalCard}>
          <View style={styles.journalHeader}>
            <BookOpen size={16} color="#7E22CE" />
            <Text style={styles.journalTitle}>Dear Baby & Private Reflections</Text>
          </View>
          <TextInput
            style={styles.journalInput}
            placeholder="Write a message to your baby, record thoughts, memorable moments, or how your body feels today..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
            value={journalText}
            onChangeText={setJournalText}
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveEntry}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>Save Today's Check-in & Note</Text>
          </TouchableOpacity>
        </View>

        {/* Check-in History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionHeading}>Diary & Reflections History</Text>
          <Text style={styles.historyCount}>{logs.length} entries</Text>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Smile size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No mood check-ins yet</Text>
            <Text style={styles.emptySubtitle}>
              Select your mood and energy level above, add your reflections, and tap save to begin your emotional wellness journal.
            </Text>
          </View>
        ) : (
          logs.map((item) => (
            <View key={item.id} style={styles.entryCard}>
              <View style={styles.entryTopRow}>
                <View style={styles.entryMoodPill}>
                  <Text style={styles.entryMoodEmoji}>{item.moodEmoji}</Text>
                  <Text style={styles.entryMoodLabel}>{item.moodLabel}</Text>
                  <Text style={styles.entryEnergyTag}>• {item.energyLevel} Energy</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteEntry(item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.entryDate}>{item.dateStr} • Week {item.week}</Text>

              {item.journalText && (
                <View style={styles.entryJournalBox}>
                  <Text style={styles.entryJournalText}>"{item.journalText}"</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  affirmationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  affirmationText: {
    flex: 1,
    fontSize: 11,
    color: '#9F1239',
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  moodCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  moodEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  formSectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  energyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  energyBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  energyBtnActive: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },
  energyBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  energyBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  journalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#7E22CE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  journalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  journalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#581C87',
  },
  journalInput: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 12,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 85,
    textAlignVertical: 'top',
    marginBottom: 14,
    lineHeight: 18,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7E22CE',
    borderRadius: 12,
    paddingVertical: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyCount: {
    fontSize: 11.5,
    color: '#64748B',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  entryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  entryMoodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryMoodEmoji: {
    fontSize: 18,
  },
  entryMoodLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  entryEnergyTag: {
    fontSize: 11,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 4,
  },
  entryDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  entryJournalBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#A855F7',
  },
  entryJournalText: {
    fontSize: 12,
    color: '#3B0764',
    lineHeight: 17,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
