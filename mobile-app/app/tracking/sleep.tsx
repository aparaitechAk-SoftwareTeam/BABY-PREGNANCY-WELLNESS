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
  Moon,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Bed,
  Sun,
  ShieldCheck,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface SleepEntry {
  id: string;
  dateStr: string;
  week: number;
  durationHours: number;
  quality: 'Restful' | 'Fair' | 'Interrupted';
  awakenings: number;
  bedTime: string;
  wakeTime: string;
  notes?: string;
}

const DEFAULT_SLEEP_LOGS: SleepEntry[] = [
  {
    id: 'sl-1',
    dateStr: 'Last Night (Oct 14)',
    week: 24,
    durationHours: 7.5,
    quality: 'Restful',
    awakenings: 1,
    bedTime: '10:30 PM',
    wakeTime: '06:00 AM',
    notes: 'Used full body pillow on left side. Slept deeply.',
  },
  {
    id: 'sl-2',
    dateStr: 'Oct 13',
    week: 24,
    durationHours: 6.0,
    quality: 'Interrupted',
    awakenings: 3,
    bedTime: '11:15 PM',
    wakeTime: '05:15 AM',
    notes: 'Bathroom trips & mild round ligament stretching.',
  },
  {
    id: 'sl-3',
    dateStr: 'Oct 12',
    week: 23,
    durationHours: 8.0,
    quality: 'Restful',
    awakenings: 1,
    bedTime: '10:00 PM',
    wakeTime: '06:00 AM',
    notes: 'Warm milk before bed and relaxing nursery music.',
  },
];

const STORAGE_KEY = 'aparai_sleep_logs_v1';

export default function SleepTrackerScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);

  const [entries, setEntries] = useState<SleepEntry[]>(DEFAULT_SLEEP_LOGS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputDuration, setInputDuration] = useState('7.5');
  const [selectedQuality, setSelectedQuality] = useState<'Restful' | 'Fair' | 'Interrupted'>('Restful');
  const [awakeningsCount, setAwakeningsCount] = useState(1);
  const [bedTime, setBedTime] = useState('10:30 PM');
  const [wakeTime, setWakeTime] = useState('06:30 AM');
  const [inputNotes, setInputNotes] = useState('');

  // Load from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setEntries(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load sleep tracking data:', e);
      }
    })();
  }, []);

  const avgSleep = entries.length > 0
    ? (entries.reduce((acc, curr) => acc + curr.durationHours, 0) / entries.length).toFixed(1)
    : '7.5';

  const handleSaveEntry = async () => {
    const hours = parseFloat(inputDuration.trim());
    if (isNaN(hours) || hours <= 0 || hours > 18) {
      Alert.alert('Invalid Duration', 'Please enter a realistic sleep duration (e.g. 7.5).');
      return;
    }

    const newEntry: SleepEntry = {
      id: 'sl_' + Date.now(),
      dateStr: 'Last Night',
      week: currentWeek,
      durationHours: hours,
      quality: selectedQuality,
      awakenings: awakeningsCount,
      bedTime: bedTime.trim() || '10:30 PM',
      wakeTime: wakeTime.trim() || '06:30 AM',
      notes: inputNotes.trim() || undefined,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save sleep log:', e);
    }

    setInputNotes('');
    setShowAddForm(false);
    Alert.alert('Sleep Logged! 🌙', `Recorded ${hours} hours of sleep for Week ${currentWeek}.`);
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Delete Sleep Record?', 'Are you sure you want to remove this log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = entries.filter((e) => e.id !== id);
          setEntries(updated);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to delete sleep log:', e);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Maternal Sleep Tracker</Text>
          <Text style={styles.headerSubtitle}>Trimester {trimester} • Week {currentWeek}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBadge}>
              <Moon size={24} color="#6366F1" />
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroSuper}>Nightly Rest & Recovery</Text>
              <Text style={styles.heroDuration}>
                {entries.length > 0 ? entries[0].durationHours : 7.5} <Text style={styles.heroUnit}>hours</Text>
              </Text>
            </View>
            <View style={styles.qualityPill}>
              <Text style={styles.qualityPillText}>
                {entries.length > 0 ? entries[0].quality : 'Restful'}
              </Text>
            </View>
          </View>

          {/* Grid Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>7-Day Average</Text>
              <Text style={styles.statValue}>{avgSleep} hrs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Target Sleep</Text>
              <Text style={[styles.statValue, { color: '#6366F1' }]}>8.0 hrs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Sleep Debt</Text>
              <Text style={styles.statValue}>Minimal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logTriggerBtn}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.85}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.logTriggerBtnText}>
              {showAddForm ? 'Close Sleep Form' : "Log Last Night's Sleep"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inline Entry Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Record Sleep Session</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Sleep Hours</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 7.5"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={inputDuration}
                onChangeText={setInputDuration}
              />
            </View>

            {/* Quality Selector */}
            <Text style={styles.inputLabel}>Sleep Quality</Text>
            <View style={styles.qualityBtnRow}>
              {(['Restful', 'Fair', 'Interrupted'] as const).map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.qualityBtn, selectedQuality === q && styles.qualityBtnActive]}
                  onPress={() => setSelectedQuality(q)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.qualityBtnText, selectedQuality === q && styles.qualityBtnTextActive]}>
                    {q === 'Restful' ? '✨ Restful' : q === 'Fair' ? '😌 Fair' : '⚡ Interrupted'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bedtime & Wake time */}
            <View style={styles.timeInputsRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Bedtime</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="10:30 PM"
                  placeholderTextColor="#94A3B8"
                  value={bedTime}
                  onChangeText={setBedTime}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Wake Time</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="06:30 AM"
                  placeholderTextColor="#94A3B8"
                  value={wakeTime}
                  onChangeText={setWakeTime}
                />
              </View>
            </View>

            {/* Night awakenings stepper */}
            <View style={styles.awakeningsRow}>
              <Text style={styles.inputLabel}>Night Awakenings</Text>
              <View style={styles.stepperBox}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setAwakeningsCount(Math.max(0, awakeningsCount - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{awakeningsCount}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setAwakeningsCount(awakeningsCount + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Position, pillow, dreams)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Slept on left side with pregnancy pillow"
                placeholderTextColor="#94A3B8"
                value={inputNotes}
                onChangeText={setInputNotes}
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveEntry}
              activeOpacity={0.85}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Sleep Record</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Clinical Sleep Guidance Card */}
        <View style={styles.guidanceCard}>
          <View style={styles.guidanceHeader}>
            <Sparkles size={16} color="#4338CA" />
            <Text style={styles.guidanceTitle}>Pregnancy Sleep Positions (SOS)</Text>
          </View>
          <Text style={styles.guidanceText}>
            • <Text style={styles.guidanceBold}>Left-Side Sleep (SOS):</Text> Sleeping on your left side prevents the heavy uterus from compressing the inferior vena cava (IVC), optimizing nutrient and oxygen blood flow to the placenta.{'\n'}
            • <Text style={styles.guidanceBold}>Maternity Pillow:</Text> Tuck a pillow between your knees and behind your back to reduce lower pelvic lumbar strain.{'\n'}
            • <Text style={styles.guidanceBold}>Avoid Flat Back Sleeping:</Text> Especially after 20 weeks to prevent dizziness and blood pressure drops.
          </Text>
        </View>

        {/* History Log */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionHeading}>Sleep Diary & Logs</Text>
          <Text style={styles.historyCount}>{entries.length} records</Text>
        </View>

        {entries.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyTopRow}>
              <View style={styles.historyLeft}>
                <View style={styles.sleepIconBadge}>
                  <Bed size={16} color="#6366F1" />
                </View>
                <View>
                  <Text style={styles.historyDate}>{item.dateStr}</Text>
                  <Text style={styles.historyMeta}>
                    {item.bedTime} - {item.wakeTime} • {item.awakenings} awakening{item.awakenings === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>

              <View style={styles.historyRight}>
                <Text style={styles.historyHours}>{item.durationHours} hrs</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteEntry(item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {item.notes && (
              <View style={styles.historyNoteBox}>
                <Text style={styles.historyNoteText}>{item.notes}</Text>
              </View>
            )}
          </View>
        ))}
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
    fontSize: 16,
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitleCol: {
    flex: 1,
  },
  heroSuper: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 2,
  },
  heroDuration: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  qualityPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  qualityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  logTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
  },
  logTriggerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13.5,
    color: '#0F172A',
  },
  qualityBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  qualityBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  qualityBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  qualityBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  qualityBtnTextActive: {
    color: '#4338CA',
    fontWeight: '700',
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  awakeningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  guidanceCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 18,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  guidanceTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#3730A3',
  },
  guidanceText: {
    fontSize: 11,
    color: '#312E81',
    lineHeight: 18,
  },
  guidanceBold: {
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyCount: {
    fontSize: 11.5,
    color: '#64748B',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sleepIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyHours: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  deleteBtn: {
    padding: 4,
  },
  historyNoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  historyNoteText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
