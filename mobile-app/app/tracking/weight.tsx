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
  Scale,
  Plus,
  TrendingUp,
  Calendar,
  Sparkles,
  Info,
  Clock,
  Trash2,
  CheckCircle2,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useAuthStore } from '../../store/auth.store';
import { trackingApi } from '../../services/api/tracking.api';

interface WeightEntry {
  id: string;
  dateStr: string;
  week: number;
  weightKg: number;
  note?: string;
}

const DEFAULT_ENTRIES: WeightEntry[] = [
  { id: 'we-1', dateStr: 'Oct 14, 2026', week: 24, weightKg: 64.2, note: 'Morning weigh-in' },
  { id: 'we-2', dateStr: 'Oct 07, 2026', week: 23, weightKg: 63.8, note: 'Clinic visit' },
  { id: 'we-3', dateStr: 'Sep 30, 2026', week: 22, weightKg: 63.3, note: 'Standard weigh-in' },
  { id: 'we-4', dateStr: 'Sep 23, 2026', week: 21, weightKg: 62.7, note: 'After breakfast' },
  { id: 'we-5', dateStr: 'Sep 16, 2026', week: 20, weightKg: 62.1, note: 'Anomaly scan day' },
];

const STORAGE_KEY = 'aparai_weight_logs_v1';
const UNIT_STORAGE_KEY = 'aparai_weight_unit_v1';

export default function WeightTrackerScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);
  const profile = usePregnancyStore((state) => state.profile);
  const user = useAuthStore((state: any) => state.user);

  const preWeightKg = profile?.prePregnancyWeight || 58.0;
  const [entries, setEntries] = useState<WeightEntry[]>(DEFAULT_ENTRIES);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputWeight, setInputWeight] = useState('');
  const [inputNote, setInputNote] = useState('');

  // Load saved state
  useEffect(() => {
    (async () => {
      try {
        const storedLogs = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedLogs) {
          setEntries(JSON.parse(storedLogs));
        }
        const storedUnit = await AsyncStorage.getItem(UNIT_STORAGE_KEY);
        if (storedUnit === 'kg' || storedUnit === 'lbs') {
          setUnit(storedUnit);
        }
      } catch (e) {
        console.error('Failed to load weight records:', e);
      }
    })();
  }, []);

  const latestWeightKg = entries.length > 0 ? entries[0].weightKg : preWeightKg;
  const totalGainKg = parseFloat((latestWeightKg - preWeightKg).toFixed(1));

  // Convert for display
  const toDisplayWeight = (kg: number) => {
    if (unit === 'lbs') {
      return (kg * 2.20462).toFixed(1);
    }
    return kg.toFixed(1);
  };

  const toDisplayDiff = (diffKg: number) => {
    const converted = unit === 'lbs' ? diffKg * 2.20462 : diffKg;
    const sign = converted > 0 ? '+' : '';
    return `${sign}${converted.toFixed(1)} ${unit}`;
  };

  const handleToggleUnit = async (newUnit: 'kg' | 'lbs') => {
    setUnit(newUnit);
    try {
      await AsyncStorage.setItem(UNIT_STORAGE_KEY, newUnit);
    } catch (e) {
      console.error('Failed to save unit:', e);
    }
  };

  const handleSaveEntry = async () => {
    const rawVal = parseFloat(inputWeight.trim());
    if (isNaN(rawVal) || rawVal <= 0) {
      Alert.alert('Invalid Entry', 'Please enter a valid weight number.');
      return;
    }

    const weightInKg = unit === 'lbs' ? rawVal / 2.20462 : rawVal;
    if (weightInKg < 35 || weightInKg > 200) {
      Alert.alert('Verification', 'Please check the entered weight value.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newEntry: WeightEntry = {
      id: 'we_' + Date.now(),
      dateStr,
      week: currentWeek,
      weightKg: parseFloat(weightInKg.toFixed(1)),
      note: inputNote.trim() || undefined,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save weight entry locally:', e);
    }

    // Sync weight log to Neon PostgreSQL database
    try {
      trackingApi.logWeight({
        userId: user?.id,
        email: user?.email,
        weightKg: parseFloat(weightInKg.toFixed(1)),
        week: currentWeek,
        dateStr,
        note: inputNote.trim() || undefined,
      }).catch((err) => console.warn('Weight sync notice:', err?.message || err));
    } catch (e) {
      // Ignore background sync errors
    }

    setInputWeight('');
    setInputNote('');
    setShowAddForm(false);
    Alert.alert('Weight Logged! ⚖️', `Recorded ${toDisplayWeight(weightInKg)} ${unit} for Week ${currentWeek}.`);
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Delete Entry?', 'Are you sure you want to remove this weight record?', [
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
            console.error('Failed to delete weight log:', e);
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
          <Text style={styles.headerTitle}>Maternal Weight Progression</Text>
          <Text style={styles.headerSubtitle}>Trimester {trimester} • Week {currentWeek}</Text>
        </View>

        {/* Unit Toggle */}
        <View style={styles.unitToggleGroup}>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
            onPress={() => handleToggleUnit('kg')}
            activeOpacity={0.8}
          >
            <Text style={[styles.unitBtnText, unit === 'kg' && styles.unitBtnTextActive]}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitBtn, unit === 'lbs' && styles.unitBtnActive]}
            onPress={() => handleToggleUnit('lbs')}
            activeOpacity={0.8}
          >
            <Text style={[styles.unitBtnText, unit === 'lbs' && styles.unitBtnTextActive]}>lbs</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBadge}>
              <Scale size={24} color="#059669" />
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroSub}>Current Measured Weight</Text>
              <Text style={styles.heroCurrentWeight}>
                {toDisplayWeight(latestWeightKg)}{' '}
                <Text style={styles.heroUnit}>{unit}</Text>
              </Text>
            </View>
            <View style={styles.gainBadge}>
              <TrendingUp size={14} color="#059669" />
              <Text style={styles.gainText}>{toDisplayDiff(totalGainKg)}</Text>
            </View>
          </View>

          {/* Baseline vs Current Grid */}
          <View style={styles.statGrid}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Pre-Pregnancy</Text>
              <Text style={styles.statValue}>
                {toDisplayWeight(preWeightKg)} {unit}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Net Change</Text>
              <Text style={[styles.statValue, { color: '#059669' }]}>
                {toDisplayDiff(totalGainKg)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Trimester Benchmark</Text>
              <Text style={styles.statValue}>Healthy Range</Text>
            </View>
          </View>

          {/* Action to log */}
          <TouchableOpacity
            style={styles.logWeightTrigger}
            onPress={() => setShowAddForm(!showAddForm)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.logWeightTriggerText}>
              {showAddForm ? 'Close Entry Form' : 'Log Today\'s Weight'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inline Entry Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Record Weight Measurement</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight ({unit})</Text>
              <TextInput
                style={styles.inputField}
                placeholder={`e.g. ${unit === 'kg' ? '64.5' : '142.2'}`}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={inputWeight}
                onChangeText={setInputWeight}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes / Time (Optional)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Morning before breakfast, after walk"
                placeholderTextColor="#94A3B8"
                value={inputNote}
                onChangeText={setInputNote}
              />
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveEntry}
              activeOpacity={0.8}
            >
              <CheckCircle2 size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Clinical Disclaimer & Educational Card */}
        <View style={styles.educationCard}>
          <View style={styles.educationHeader}>
            <Sparkles size={16} color="#0D9488" />
            <Text style={styles.educationTitle}>Understanding Maternal Weight Gain</Text>
          </View>
          <Text style={styles.educationText}>
            Pregnancy weight gain reflects your growing baby (~3.5 kg), placenta (~0.7 kg), amniotic fluid (~0.9 kg), increased blood volume (~1.8 kg), and maternal tissue. Every mother's curve is unique; consult your OB-GYN regarding personalized targets.
          </Text>
        </View>

        {/* History Log */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Measurement History</Text>
          <Text style={styles.historyCount}>{entries.length} logs recorded</Text>
        </View>

        {entries.map((item) => {
          const diffFromPre = parseFloat((item.weightKg - preWeightKg).toFixed(1));
          return (
            <View key={item.id} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <View style={styles.weekPill}>
                  <Text style={styles.weekPillText}>W{item.week}</Text>
                </View>
                <View>
                  <Text style={styles.historyDate}>{item.dateStr}</Text>
                  {item.note && <Text style={styles.historyNote}>{item.note}</Text>}
                </View>
              </View>

              <View style={styles.historyRight}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.historyWeight}>
                    {toDisplayWeight(item.weightKg)} {unit}
                  </Text>
                  <Text style={styles.historyDiff}>{toDisplayDiff(diffFromPre)}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteEntry(item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  unitToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  unitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: '#059669',
  },
  unitBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
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
    borderColor: '#A7F3D0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
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
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitleCol: {
    flex: 1,
  },
  heroSub: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 2,
  },
  heroCurrentWeight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  gainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  gainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
  statGrid: {
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
    textAlign: 'center',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  logWeightTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 12,
  },
  logWeightTriggerText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  educationCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 18,
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  educationTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  educationText: {
    fontSize: 11,
    color: '#115E59',
    lineHeight: 18,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyCount: {
    fontSize: 11.5,
    color: '#64748B',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  weekPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  historyNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyWeight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDiff: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  deleteBtn: {
    padding: 6,
  },
});
