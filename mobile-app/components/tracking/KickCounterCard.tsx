import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

interface KickCounterCardProps {
  onSessionComplete?: (kicks: number, durationSeconds: number) => void;
}

export function KickCounterCard({ onSessionComplete }: KickCounterCardProps) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [recentTimestamps, setRecentTimestamps] = useState<string[]>([]);

  const targetKicks = 10;
  const maxSessionSeconds = 2 * 60 * 60; // 2 hours clinical benchmark

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => {
          if (prev + 1 >= maxSessionSeconds) {
            setIsActive(false);
            Alert.alert(
              '⚠️ 2-Hour Kick Session Ended',
              'If your baby moved fewer than 10 times in 2 hours, drink cold water, rest on your left side, and consult your maternity clinic triage if movement remains low.'
            );
            return maxSessionSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  const handleStartSession = () => {
    setIsActive(true);
    setKickCount(0);
    setSecondsElapsed(0);
    setRecentTimestamps([]);
  };

  const handleLogKick = () => {
    if (!isActive) {
      setIsActive(true);
    }

    const nextCount = kickCount + 1;
    setKickCount(nextCount);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRecentTimestamps((prev) => [timeStr, ...prev.slice(0, 4)]);

    if (nextCount >= targetKicks) {
      setIsActive(false);
      onSessionComplete?.(nextCount, secondsElapsed);
      Alert.alert(
        '🎉 10 Kicks Milestone Reached!',
        `Excellent fetal vitality! 10 kicks recorded in ${formatTime(secondsElapsed)}. Session saved to doctor export log.`
      );
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setKickCount(0);
    setSecondsElapsed(0);
    setRecentTimestamps([]);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>👣</Text>
          <Text style={styles.headerTitle}>Fetal Kick Counter</Text>
        </View>
        <View style={styles.protocolBadge}>
          <Text style={styles.protocolBadgeText}>10 Kicks in 2 Hrs</Text>
        </View>
      </View>

      <Text style={styles.cardSubtitle}>
        Count baby movements while resting comfortably on your left side.
      </Text>

      {/* Main Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>KICKS LOGGED</Text>
          <Text style={styles.statNumber}>
            {kickCount}
            <Text style={styles.statTarget}> / {targetKicks}</Text>
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>SESSION TIMER</Text>
          <Text style={styles.statTimer}>{formatTime(secondsElapsed)}</Text>
        </View>
      </View>

      {/* Primary Tap Action Button */}
      <TouchableOpacity
        onPress={handleLogKick}
        style={styles.tapButton}
        activeOpacity={0.85}
      >
        <View style={styles.tapButtonInner}>
          <Text style={styles.tapButtonEmoji}>👣</Text>
          <Text style={styles.tapButtonText}>
            {isActive ? 'Tap Each Time Baby Kicks' : 'Tap to Start Session'}
          </Text>
          <Text style={styles.tapButtonHint}>
            {kickCount === 0 ? 'Fetal Movement Tracker' : `${targetKicks - kickCount > 0 ? targetKicks - kickCount : 0} kicks to goal`}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Control Buttons */}
      <View style={styles.controlRow}>
        {!isActive && kickCount === 0 ? (
          <TouchableOpacity
            onPress={handleStartSession}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>▶ Start Timer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setIsActive(!isActive)}
            style={styles.secondaryBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>
              {isActive ? '⏸ Pause Timer' : '▶ Resume Timer'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.resetBtnText}>↺ Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Timestamps Preview */}
      {recentTimestamps.length > 0 && (
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampHeader}>Recent movements recorded:</Text>
          <View style={styles.timestampPillRow}>
            {recentTimestamps.map((ts, idx) => (
              <View key={idx} style={styles.timestampPill}>
                <Text style={styles.timestampText}>#{kickCount - idx}: {ts}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Clinical Guidance Footnote */}
      <View style={styles.clinicalHintBox}>
        <Text style={styles.clinicalHintText}>
          💡 Clinical Standard: A healthy baby typically achieves 10 movements within 20 to 60 minutes. Contact your provider if you notice a significant decrease.
        </Text>
      </View>

      {/* View Sessions History Button */}
      <TouchableOpacity
        onPress={() => router.push('/tracking/movement-history')}
        style={styles.historyBtn}
        activeOpacity={0.8}
      >
        <Text style={styles.historyBtnText}>
          👣 View Kick Sessions & Reactivity History by Date ›
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  protocolBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  protocolBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E11D48',
    letterSpacing: 0.4,
  },
  cardSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  statTarget: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statTimer: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  tapButton: {
    backgroundColor: '#E11D48',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tapButtonInner: {
    alignItems: 'center',
  },
  tapButtonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  tapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  tapButtonHint: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: '500',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  resetBtn: {
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  timestampContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  timestampHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 6,
  },
  timestampPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timestampPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timestampText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
  clinicalHintBox: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  clinicalHintText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#64748B',
  },
  historyBtn: {
    backgroundColor: '#FFF1F2',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: 10,
  },
  historyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
});
