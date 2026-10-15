import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  Footprints,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Trash2,
  TrendingUp,
  Info,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface KickSessionRecord {
  id: string;
  dateStr: string;
  week: number;
  kickCount: number;
  durationSeconds: number;
  status: 'Normal' | 'Reduced';
  notes?: string;
}

const DEFAULT_SESSIONS: KickSessionRecord[] = [
  {
    id: 'ks-1',
    dateStr: 'Today, 02:30 PM',
    week: 24,
    kickCount: 10,
    durationSeconds: 2040, // 34 min
    status: 'Normal',
    notes: 'Active right after lunch and cold water.',
  },
  {
    id: 'ks-2',
    dateStr: 'Yesterday, 08:15 PM',
    week: 24,
    kickCount: 10,
    durationSeconds: 1560, // 26 min
    status: 'Normal',
    notes: 'Rhythmic rolls and strong kicks while resting.',
  },
  {
    id: 'ks-3',
    dateStr: 'Oct 13, 10:00 AM',
    week: 23,
    kickCount: 10,
    durationSeconds: 2880, // 48 min
    status: 'Normal',
    notes: 'Took a while to get started in the morning.',
  },
  {
    id: 'ks-4',
    dateStr: 'Oct 11, 09:45 PM',
    week: 23,
    kickCount: 10,
    durationSeconds: 1920, // 32 min
    status: 'Normal',
  },
];

const STORAGE_KEY = 'aparai_kick_history_v1';

export default function MovementHistoryScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const profile = usePregnancyStore((state) => state.profile);

  const [sessions, setSessions] = useState<KickSessionRecord[]>(DEFAULT_SESSIONS);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSessions(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load kick session history:', e);
      }
    })();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const avgDurationMinutes = sessions.length > 0
    ? Math.round(
        sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / (sessions.length * 60)
      )
    : 32;

  const handleCallClinic = () => {
    const phone = profile?.doctorPhone || '108';
    Linking.openURL(`tel:${phone}`);
  };

  const handleDeleteSession = (id: string) => {
    Alert.alert('Delete Session?', 'Remove this kick record from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = sessions.filter((s) => s.id !== id);
          setSessions(updated);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to save updated sessions:', e);
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
          <Text style={styles.headerTitle}>Fetal Movement History</Text>
          <Text style={styles.headerSubtitle}>Cardiff Count-to-10 Movement Log</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/tracking/movement')}
          style={styles.newSessionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.newSessionBtnText}>+ Count</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBadge}>
              <Footprints size={24} color="#E11D48" />
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroSuper}>Weekly Fetal Reactivity</Text>
              <Text style={styles.heroTitle}>Normal Fetal Activity</Text>
            </View>
            <View style={styles.normalBadge}>
              <CheckCircle2 size={14} color="#059669" />
              <Text style={styles.normalBadgeText}>Healthy</Text>
            </View>
          </View>

          {/* Stat Grid */}
          <View style={styles.statGrid}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Avg Duration</Text>
              <Text style={styles.statValue}>{avgDurationMinutes} mins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Target Kicks</Text>
              <Text style={[styles.statValue, { color: '#E11D48' }]}>10 kicks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Clinical Limit</Text>
              <Text style={styles.statValue}>Under 2 hrs</Text>
            </View>
          </View>
        </View>

        {/* Clinical Disclaimer & Protocol */}
        <View style={styles.clinicalAlertBox}>
          <View style={styles.clinicalAlertHeader}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={styles.clinicalAlertTitle}>Reduced Fetal Movement Protocol</Text>
          </View>
          <Text style={styles.clinicalAlertText}>
            If your baby takes longer than 2 hours to achieve 10 distinct kicks, drink a cold sweet beverage, lie on your left side, and recount. If movements remain reduced, contact your maternity ward or triage immediately.
          </Text>
          <TouchableOpacity
            style={styles.callClinicBtn}
            onPress={handleCallClinic}
            activeOpacity={0.85}
          >
            <Phone size={14} color="#FFFFFF" />
            <Text style={styles.callClinicBtnText}>
              Call Maternity Care Team ({profile?.doctorName || 'Hospital Hotline'})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Session Log */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionHeading}>Recorded Kick Sessions</Text>
          <Text style={styles.historyCount}>{sessions.length} sessions</Text>
        </View>

        {sessions.map((item) => (
          <View key={item.id} style={styles.sessionCard}>
            <View style={styles.sessionTopRow}>
              <View style={styles.sessionLeft}>
                <View style={styles.sessionBadge}>
                  <Text style={styles.sessionBadgeText}>10/10</Text>
                </View>
                <View>
                  <Text style={styles.sessionDate}>{item.dateStr}</Text>
                  <Text style={styles.sessionMeta}>
                    Week {item.week} • Completed in {formatDuration(item.durationSeconds)}
                  </Text>
                </View>
              </View>

              <View style={styles.sessionRight}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{item.status}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteSession(item.id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </View>

            {item.notes && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{item.notes}</Text>
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
  newSessionBtn: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newSessionBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
    borderColor: '#FECDD3',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
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
    backgroundColor: '#FFE4E6',
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
    color: '#E11D48',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  normalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  normalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  statGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
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
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  clinicalAlertBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 18,
  },
  clinicalAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  clinicalAlertTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#991B1B',
  },
  clinicalAlertText: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 16,
    marginBottom: 10,
  },
  callClinicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 10,
  },
  callClinicBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
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
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 8,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sessionBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
  },
  sessionDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  sessionMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  deleteBtn: {
    padding: 4,
  },
  noteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E11D48',
  },
  noteText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
});
