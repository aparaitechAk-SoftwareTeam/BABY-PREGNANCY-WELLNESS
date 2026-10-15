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
  Droplets,
  Plus,
  RotateCcw,
  Bell,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  Trash2,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface WaterLogEntry {
  id: string;
  timeStr: string;
  amountMl: number;
  label: string;
}

const DEFAULT_ENTRIES: WaterLogEntry[] = [
  { id: 'w1', timeStr: '08:00 AM', amountMl: 250, label: 'Morning Glass' },
  { id: 'w2', timeStr: '10:30 AM', amountMl: 500, label: 'Mid-Morning Bottle' },
  { id: 'w3', timeStr: '01:15 PM', amountMl: 350, label: 'Post-Lunch Hydration' },
  { id: 'w4', timeStr: '03:45 PM', amountMl: 250, label: 'Afternoon Refresh' },
];

const STORAGE_KEY = 'aparai_water_tracking_v1';
const GOAL_STORAGE_KEY = 'aparai_water_goal_v1';

export default function WaterTrackerScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const [dailyGoalMl, setDailyGoalMl] = useState(2500);
  const [entries, setEntries] = useState<WaterLogEntry[]>(DEFAULT_ENTRIES);
  const [customInput, setCustomInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);

  // Load saved state
  useEffect(() => {
    (async () => {
      try {
        const storedGoal = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
        if (storedGoal) {
          setDailyGoalMl(parseInt(storedGoal, 10));
        }
        const storedLogs = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedLogs) {
          setEntries(JSON.parse(storedLogs));
        }
      } catch (e) {
        console.error('Failed to load water tracking data:', e);
      }
    })();
  }, []);

  const totalLoggedMl = entries.reduce((acc, curr) => acc + curr.amountMl, 0);
  const progressPercent = Math.min(100, Math.round((totalLoggedMl / dailyGoalMl) * 100));
  const remainingMl = Math.max(0, dailyGoalMl - totalLoggedMl);
  const glassesCount = Math.floor(totalLoggedMl / 250);
  const totalGlassesTarget = Math.ceil(dailyGoalMl / 250);

  const saveEntries = async (updated: WaterLogEntry[]) => {
    setEntries(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save water entries:', e);
    }
  };

  const handleAddWater = (amountMl: number, label: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEntry: WaterLogEntry = {
      id: 'w_' + Date.now(),
      timeStr,
      amountMl,
      label,
    };

    const updated = [newEntry, ...entries];
    saveEntries(updated);

    if (totalLoggedMl + amountMl >= dailyGoalMl && totalLoggedMl < dailyGoalMl) {
      Alert.alert(
        '🎉 Daily Hydration Goal Met!',
        `Excellent work! You reached your goal of ${dailyGoalMl} ml. Hydration supports healthy amniotic fluid and vital nutrient flow.`
      );
    }
  };

  const handleAddCustom = () => {
    const amount = parseInt(customInput.trim(), 10);
    if (isNaN(amount) || amount <= 0 || amount > 2000) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount between 50 ml and 2000 ml.');
      return;
    }
    handleAddWater(amount, 'Custom Intake');
    setCustomInput('');
    setShowCustomModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    saveEntries(updated);
  };

  const handleResetDay = () => {
    Alert.alert(
      'Reset Today\'s Water?',
      'This will clear today\'s logged hydration entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => saveEntries([]),
        },
      ]
    );
  };

  const handleToggleReminder = () => {
    setReminderEnabled(!reminderEnabled);
    Alert.alert(
      !reminderEnabled ? '🔔 Hydration Reminders Active' : '🔕 Reminders Paused',
      !reminderEnabled
        ? 'You will receive gentle reminders every 1.5 hours between 8 AM and 9 PM.'
        : 'Hydration notifications paused.'
    );
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
          <Text style={styles.headerTitle}>Hydration Tracker</Text>
          <Text style={styles.headerSubtitle}>Maternal Daily Fluid & Amniotic Health</Text>
        </View>
        <TouchableOpacity
          onPress={handleResetDay}
          style={styles.resetButton}
          activeOpacity={0.7}
        >
          <RotateCcw size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBadge}>
              <Droplets size={24} color="#0284C7" />
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroWeekBadge}>Week {currentWeek} • Recommended 2.5L - 3.0L</Text>
              <Text style={styles.heroAmount}>
                {totalLoggedMl} <Text style={styles.heroAmountUnit}>/ {dailyGoalMl} ml</Text>
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          {/* Glass Counter Row */}
          <View style={styles.glassRow}>
            <Text style={styles.glassCountText}>
              🥛 <Text style={styles.glassHighlight}>{glassesCount}</Text> of {totalGlassesTarget} glasses consumed
            </Text>
            <Text style={styles.remainingText}>
              {remainingMl === 0 ? 'Goal Completed! 🏆' : `${remainingMl} ml remaining`}
            </Text>
          </View>
        </View>

        {/* Quick Add Section */}
        <Text style={styles.sectionHeading}>Quick Log Intake</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleAddWater(250, 'Standard Glass')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickEmoji}>🥛</Text>
            <Text style={styles.quickAmount}>+250 ml</Text>
            <Text style={styles.quickLabel}>1 Glass</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleAddWater(350, 'Mug / Tumbler')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickEmoji}>☕</Text>
            <Text style={styles.quickAmount}>+350 ml</Text>
            <Text style={styles.quickLabel}>Large Mug</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleAddWater(500, 'Water Bottle')}
            activeOpacity={0.8}
          >
            <Text style={styles.quickEmoji}>🍼</Text>
            <Text style={styles.quickAmount}>+500 ml</Text>
            <Text style={styles.quickLabel}>Full Bottle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.customQuickButton]}
            onPress={() => setShowCustomModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.quickEmoji}>✏️</Text>
            <Text style={[styles.quickAmount, { color: '#0284C7' }]}>Custom</Text>
            <Text style={styles.quickLabel}>Enter ml</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Input Modal / Inline Form */}
        {showCustomModal && (
          <View style={styles.customCard}>
            <Text style={styles.customCardTitle}>Add Custom Water Amount</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="e.g. 400"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={customInput}
                onChangeText={setCustomInput}
              />
              <Text style={styles.customInputSuffix}>ml</Text>
              <TouchableOpacity
                style={styles.customAddBtn}
                onPress={handleAddCustom}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.customAddBtnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customCancelBtn}
                onPress={() => setShowCustomModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.customCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Smart Reminder Bar */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderLeft}>
            <View style={styles.reminderIconBox}>
              <Bell size={18} color="#0284C7" />
            </View>
            <View>
              <Text style={styles.reminderTitle}>Hydration Reminders</Text>
              <Text style={styles.reminderSubtitle}>
                {reminderEnabled ? 'Active • Every 1.5 hours' : 'Disabled'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.reminderToggleBtn, reminderEnabled ? styles.reminderBtnActive : styles.reminderBtnInactive]}
            onPress={handleToggleReminder}
            activeOpacity={0.8}
          >
            <Text style={[styles.reminderBtnText, reminderEnabled ? styles.reminderBtnTextActive : styles.reminderBtnTextInactive]}>
              {reminderEnabled ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Why Hydration Matters Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Sparkles size={16} color="#D97706" />
            <Text style={styles.infoTitle}>Why Hydration Matters During Pregnancy</Text>
          </View>
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Amniotic Fluid:</Text> Water continually replenishes fluid cushioning your baby.{'\n'}
            • <Text style={styles.infoBold}>Circulation:</Text> Supports 50% blood volume expansion and nutrient delivery.{'\n'}
            • <Text style={styles.infoBold}>Prevents Cramps:</Text> Reduces Braxton Hicks contractions, swelling, and morning nausea.
          </Text>
        </View>

        {/* Today's History Log */}
        <View style={styles.historyHeaderRow}>
          <Text style={styles.sectionHeading}>Today's Water Diary</Text>
          <Text style={styles.historyEntriesCount}>{entries.length} entries</Text>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Droplets size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No intake recorded yet today</Text>
            <Text style={styles.emptySub}>Tap one of the quick buttons above to log your first glass!</Text>
          </View>
        ) : (
          entries.map((item) => (
            <View key={item.id} style={styles.logItem}>
              <View style={styles.logLeft}>
                <View style={styles.logIcon}>
                  <Droplets size={16} color="#0284C7" />
                </View>
                <View>
                  <Text style={styles.logLabel}>{item.label}</Text>
                  <View style={styles.logMetaRow}>
                    <Clock size={11} color="#64748B" />
                    <Text style={styles.logTime}>{item.timeStr}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.logRight}>
                <Text style={styles.logAmount}>+{item.amountMl} ml</Text>
                <TouchableOpacity
                  onPress={() => handleDeleteEntry(item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#BAE6FD',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0284C7',
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
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitleCol: {
    flex: 1,
  },
  heroWeekBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
    marginBottom: 2,
  },
  heroAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroAmountUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  percentBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0284C7',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 6,
  },
  glassRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassCountText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  glassHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
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
  customQuickButton: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  quickEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  quickAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  customCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  customCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  customInputSuffix: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  customAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  customAddBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  customCancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  customCancelBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  reminderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  reminderToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reminderBtnActive: {
    backgroundColor: '#E0F2FE',
  },
  reminderBtnInactive: {
    backgroundColor: '#F1F5F9',
  },
  reminderBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reminderBtnTextActive: {
    color: '#0284C7',
  },
  reminderBtnTextInactive: {
    color: '#94A3B8',
  },
  infoCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  infoText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: '700',
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyEntriesCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    textAlign: 'center',
  },
  logItem: {
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
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  logMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  logTime: {
    fontSize: 11,
    color: '#64748B',
  },
  logRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  deleteBtn: {
    padding: 6,
  },
});
