import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  Heart,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Calendar,
  History,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useAuthStore } from '../../store/auth.store';
import { trackingApi } from '../../services/api/tracking.api';

interface KickSession {
  id: string;
  dateStr: string;
  startTime: string;
  durationSeconds: number;
  kicks: number;
  reachedTen: boolean;
  notes?: string;
}

const DEFAULT_SESSIONS: KickSession[] = [
  {
    id: 'ks-1',
    dateStr: 'Today, 08:30 PM',
    startTime: '08:30 PM',
    durationSeconds: 1140, // 19 mins
    kicks: 10,
    reachedTen: true,
    notes: 'Active after dinner & glass of cold water',
  },
  {
    id: 'ks-2',
    dateStr: 'Yesterday, 02:15 PM',
    startTime: '02:15 PM',
    durationSeconds: 1560, // 26 mins
    kicks: 10,
    reachedTen: true,
    notes: 'Resting on left side',
  },
  {
    id: 'ks-3',
    dateStr: 'Oct 13, 09:00 PM',
    startTime: '09:00 PM',
    durationSeconds: 1320, // 22 mins
    kicks: 10,
    reachedTen: true,
  },
];

const STORAGE_KEY = 'aparai_kick_sessions';

export default function MovementTrackerScreen() {
  const router = useRouter();
  const pregnancyProfile = usePregnancyStore((state) => state.profile);
  const user = useAuthStore((state: any) => state.user);

  // Kick session states
  const [isActive, setIsActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessions, setSessions] = useState<KickSession[]>(DEFAULT_SESSIONS);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load history on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSessions(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load kick sessions:', e);
      }
    })();
  }, []);

  // Timer interval
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setIsActive(true);
  };

  const handlePauseSession = () => {
    setIsActive(false);
  };

  const handleResetSession = () => {
    setIsActive(false);
    setKickCount(0);
    setSecondsElapsed(0);
    setSessionNotes('');
  };

  const handleRecordKick = () => {
    if (!isActive) {
      setIsActive(true);
    }
    const newCount = kickCount + 1;
    setKickCount(newCount);

    if (newCount === 10) {
      Alert.alert(
        '🎉 10 Kicks Reached!',
        `Your baby completed 10 movements in ${formatTimer(secondsElapsed)}! Great job monitoring your little one.`,
        [
          { text: 'Keep Counting', style: 'cancel' },
          { text: 'Save Session', onPress: () => handleSaveSession(newCount) },
        ]
      );
    }
  };

  const handleSaveSession = async (finalCount?: number) => {
    const count = finalCount !== undefined ? finalCount : kickCount;
    if (count === 0) {
      Alert.alert('No Kicks Logged', 'Please tap the counter button to log at least one movement.');
      return;
    }

    const now = new Date();
    const newSession: KickSession = {
      id: 'ks_' + Date.now(),
      dateStr: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      startTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationSeconds: secondsElapsed,
      kicks: count,
      reachedTen: count >= 10,
      notes: sessionNotes.trim() || undefined,
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save session locally:', e);
    }

    // Sync to Neon PostgreSQL Database
    try {
      await trackingApi.logMovement({
        userId: user?.id,
        email: user?.email,
        kicks: count,
        durationSeconds: secondsElapsed,
        reachedTen: count >= 10,
        startTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        notes: sessionNotes.trim() || undefined,
      });
    } catch (apiErr: any) {
      console.warn('Backend kick session sync notice:', apiErr?.message || apiErr);
    }

    handleResetSession();
    Alert.alert('Session Saved! ✅', 'Your movement tracking session has been added to your log and cloud timeline.');
  };

  const handleEmergencyCall = () => {
    const phone = pregnancyProfile?.doctorPhone || '112';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Emergency Helpline', 'Please contact local maternity emergency services: 112 / 108');
    });
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
          <Text style={styles.headerTitle}>Fetal Movement & Kick Counter</Text>
          <Text style={styles.headerSubtitle}>Cardiff Count-to-10 Movement Tracking</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/tracking/movement-history')}
          style={styles.historyBtn}
          activeOpacity={0.7}
        >
          <History size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Counter Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.sessionMetaRow}>
            <View style={styles.timerBadge}>
              <Clock size={13} color="#0284C7" />
              <Text style={styles.timerText}>{formatTimer(secondsElapsed)}</Text>
            </View>
            <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusPaused]}>
              <View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotPaused]} />
              <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextPaused]}>
                {isActive ? 'Session Live' : 'Ready'}
              </Text>
            </View>
          </View>

          {/* Large Tap to Kick Button */}
          <View style={styles.kickButtonOuter}>
            <TouchableOpacity
              onPress={handleRecordKick}
              style={styles.kickButton}
              activeOpacity={0.82}
            >
              <Heart size={44} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.kickNumber}>{kickCount}</Text>
              <Text style={styles.kickLabel}>TAP PER KICK</Text>
            </TouchableOpacity>
          </View>

          {/* Goal Progress Track (0 to 10) */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (kickCount / 10) * 100)}%` },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>{kickCount} of 10 kicks recorded</Text>
              <Text style={styles.progressLabelRight}>
                {kickCount >= 10 ? 'Goal Reached! 🌟' : `${10 - kickCount} more to 10`}
              </Text>
            </View>
          </View>

          {/* Controls: Play/Pause, Reset, Finish */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={isActive ? handlePauseSession : handleStartSession}
              style={[styles.controlBtn, isActive ? styles.pauseBtn : styles.startBtn]}
              activeOpacity={0.8}
            >
              {isActive ? (
                <>
                  <Pause size={16} color="#0F172A" />
                  <Text style={styles.controlBtnTextDark}>Pause</Text>
                </>
              ) : (
                <>
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.controlBtnTextLight}>Start</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResetSession}
              style={styles.resetBtn}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color="#64748B" />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSaveSession()}
              style={styles.saveBtn}
              activeOpacity={0.8}
            >
              <CheckCircle size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Optional Notes */}
          <View style={styles.notesContainer}>
            <TextInput
              style={styles.notesInput}
              placeholder="Add session note (e.g., after lunch, resting on left side)..."
              placeholderTextColor="#94A3B8"
              value={sessionNotes}
              onChangeText={setSessionNotes}
            />
          </View>
        </View>

        {/* ========================================================
            SAFETY ESCALATION BANNER (PRD Section 8 & 19)
            ======================================================== */}
        <View style={styles.escalationCard}>
          <View style={styles.escalationHeader}>
            <AlertCircle size={18} color="#DC2626" strokeWidth={2.4} />
            <Text style={styles.escalationTitle}>Clinical Safety Guidance</Text>
          </View>
          <Text style={styles.escalationBody}>
            Babies have unique daily activity patterns. If you notice significantly reduced or absent movements over a 2-hour resting session, please contact your maternity triage or healthcare provider immediately.
          </Text>
          <TouchableOpacity
            onPress={handleEmergencyCall}
            style={styles.escalationCallBtn}
            activeOpacity={0.85}
          >
            <Phone size={14} color="#FFFFFF" />
            <Text style={styles.escalationCallText}>
              Call Maternity Hospital ({pregnancyProfile?.doctorPhone || '+91 98765 43210'})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            RECENT SESSION HISTORY
            ======================================================== */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <History size={16} color="#0F172A" />
            <Text style={styles.historyTitle}>Recent Kick History</Text>
          </View>

          {sessions.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyTop}>
                <View>
                  <Text style={styles.historyDate}>{item.dateStr}</Text>
                  <Text style={styles.historyDuration}>
                    Duration: {formatTimer(item.durationSeconds)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.historyBadge,
                    item.reachedTen ? styles.historyBadgeTen : styles.historyBadgePart,
                  ]}
                >
                  <Text
                    style={[
                      styles.historyBadgeText,
                      item.reachedTen ? styles.historyBadgeTextTen : styles.historyBadgeTextPart,
                    ]}
                  >
                    {item.kicks} Kicks {item.reachedTen ? '✓' : ''}
                  </Text>
                </View>
              </View>
              {!!item.notes && <Text style={styles.historyNotes}>"{item.notes}"</Text>}
            </View>
          ))}
        </View>
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
  historyBtn: {
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
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sessionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusPaused: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotPaused: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextPaused: {
    color: '#64748B',
  },
  kickButtonOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 6,
    borderColor: '#FEE2E6',
  },
  kickButton: {
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  kickNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 34,
  },
  kickLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.9,
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabelLeft: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  progressLabelRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 14,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
  },
  startBtn: {
    backgroundColor: '#0F172A',
  },
  pauseBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  controlBtnTextLight: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  controlBtnTextDark: {
    color: '#0F172A',
    fontSize: 12.5,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  resetBtnText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#10B981',
    borderRadius: 10,
    gap: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  notesContainer: {
    width: '100%',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  escalationCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  escalationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  escalationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  escalationBody: {
    fontSize: 11.5,
    color: '#7F1D1D',
    lineHeight: 16.5,
    marginBottom: 12,
  },
  escalationCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 9,
    gap: 6,
  },
  escalationCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  historySection: {
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyBadgeTen: {
    backgroundColor: '#F0FDF4',
  },
  historyBadgePart: {
    backgroundColor: '#F1F5F9',
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyBadgeTextTen: {
    color: '#166534',
  },
  historyBadgeTextPart: {
    color: '#64748B',
  },
  historyNotes: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 6,
  },
});
