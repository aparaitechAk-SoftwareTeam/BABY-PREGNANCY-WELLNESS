import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Footprints, Flame, Clock, MapPin, ArrowRight, Plus, Play } from 'lucide-react-native';
import { useStepsStore } from '../../store/steps.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export function StepCounterCard() {
  const router = useRouter();
  const trimester = usePregnancyStore((state) => state.trimester);
  const todaySteps = useStepsStore((state) => state.todaySteps);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const distanceKm = useStepsStore((state) => state.distanceKm);
  const activeMinutes = useStepsStore((state) => state.activeMinutes);
  const caloriesKcal = useStepsStore((state) => state.caloriesKcal);
  const addSteps = useStepsStore((state) => state.addSteps);
  const loadSteps = useStepsStore((state) => state.loadSteps);

  useEffect(() => {
    loadSteps(trimester);
  }, [loadSteps, trimester]);

  const percentage = Math.min(100, Math.round((todaySteps / stepGoal) * 100));

  return (
    <View style={styles.card}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconBg}>
            <Footprints size={20} color="#0D9488" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.titleText}>Daily Steps & Movement</Text>
            <Text style={styles.subtitleText}>Trimester {trimester || 2} gentle walking target</Text>
          </View>
        </View>

        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>{percentage}%</Text>
        </View>
      </View>

      {/* Main Steps Display */}
      <View style={styles.mainStepsRow}>
        <View>
          <Text style={styles.bigStepNumber}>{todaySteps.toLocaleString()}</Text>
          <Text style={styles.goalText}>of {stepGoal.toLocaleString()} daily steps</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/tracking/steps')}
          style={styles.openDetailBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.openDetailText}>Health View</Text>
          <ArrowRight size={14} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>

      {/* 3 Metric Pills (Distance, Active Time, Calories) */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <MapPin size={13} color="#0284C7" />
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
          <Text style={styles.metricValue}>{distanceKm} km</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Clock size={13} color="#16A34A" />
            <Text style={styles.metricLabel}>Active Time</Text>
          </View>
          <Text style={styles.metricValue}>{activeMinutes} min</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Flame size={13} color="#EA580C" />
            <Text style={styles.metricLabel}>Burned</Text>
          </View>
          <Text style={styles.metricValue}>{caloriesKcal} kcal</Text>
        </View>
      </View>

      {/* Maternal Safety Note */}
      <View style={styles.safetyBox}>
        <Text style={styles.safetyText}>
          🌿 <Text style={styles.safetyBold}>ACOG Guide:</Text> 30 mins of gentle walking improves placental circulation and eases labor. Keep a conversational pace.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          onPress={() => addSteps(500)}
          style={styles.quickAddBtn}
          activeOpacity={0.75}
        >
          <Plus size={15} color="#0F766E" strokeWidth={2.5} />
          <Text style={styles.quickAddText}>+500 Steps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/tracking/steps')}
          style={styles.startWalkBtn}
          activeOpacity={0.8}
        >
          <Play size={14} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startWalkText}>Record Prenatal Walk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
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
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  badgePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F766E',
  },
  mainStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    marginTop: 4,
  },
  bigStepNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  goalText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  openDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  openDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F766E',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  safetyBox: {
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: 12,
  },
  safetyText: {
    fontSize: 11.5,
    color: '#166534',
    lineHeight: 16,
  },
  safetyBold: {
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickAddText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  startWalkBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0D9488',
    paddingVertical: 10,
    borderRadius: 12,
  },
  startWalkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
