import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface HydrationTrackerCardProps {
  loggedMl: number;
  goalMl?: number;
  onAddWater: (amountMl: number) => void;
  onReset?: () => void;
}

export function HydrationTrackerCard({
  loggedMl,
  goalMl = 2500,
  onAddWater,
  onReset,
}: HydrationTrackerCardProps) {
  const router = useRouter();
  const percent = Math.min(100, Math.round((loggedMl / goalMl) * 100));
  const remainingMl = Math.max(0, goalMl - loggedMl);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>💧</Text>
          <View>
            <Text style={styles.headerTitle}>Hydration Tracker</Text>
            <Text style={styles.headerDateText}>Today, {todayStr}</Text>
          </View>
        </View>
        <View style={styles.goalPill}>
          <Text style={styles.goalPillText}>Goal: {goalMl} ml</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Adequate hydration supports amniotic fluid levels and reduces maternal fatigue.
      </Text>

      {/* Main Metric Display */}
      <View style={styles.metricsBox}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>CURRENT INTAKE</Text>
          <Text style={styles.metricValue}>
            {loggedMl} <Text style={styles.metricUnit}>ml</Text>
          </Text>
        </View>

        <View style={styles.percentBadge}>
          <Text style={styles.percentText}>{percent}%</Text>
          <Text style={styles.percentSub}>of goal</Text>
        </View>

        <View style={styles.metricColRight}>
          <Text style={styles.metricLabel}>REMAINING</Text>
          <Text style={styles.metricValueSecondary}>
            {remainingMl} <Text style={styles.metricUnit}>ml</Text>
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
      </View>

      {/* Quick Add Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onAddWater(250)}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnIcon}>🥛</Text>
          <Text style={styles.addBtnText}>+250 ml</Text>
          <Text style={styles.addBtnSub}>1 Glass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onAddWater(500)}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnIcon}>🍶</Text>
          <Text style={styles.addBtnText}>+500 ml</Text>
          <Text style={styles.addBtnSub}>1 Bottle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onAddWater(750)}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnIcon}>🚰</Text>
          <Text style={styles.addBtnText}>+750 ml</Text>
          <Text style={styles.addBtnSub}>Large Bottle</Text>
        </TouchableOpacity>

        {onReset && (
          <TouchableOpacity
            onPress={onReset}
            style={styles.resetBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>↺</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* View Full History Button */}
      <TouchableOpacity
        onPress={() => router.push('/tracking/water')}
        style={styles.fullHydrationBtn}
        activeOpacity={0.8}
      >
        <Text style={styles.fullHydrationText}>
          💧 View Daily Water Intake History & Diary ›
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
  goalPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 14,
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricValueSecondary: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  percentBadge: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  percentText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0284C7',
  },
  percentSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addBtnIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  addBtnSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  resetBtn: {
    width: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  headerDateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  fullHydrationBtn: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 12,
  },
  fullHydrationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
});
