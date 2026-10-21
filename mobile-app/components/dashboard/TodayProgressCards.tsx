import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Footprints, Droplets, Moon } from 'lucide-react-native';

interface TodayProgressCardsProps {
  stepsCurrent?: number;
  stepsGoal?: number;
  waterGlasses?: number;
  waterGoalGlasses?: number;
  sleepHours?: string;
  sleepQuality?: string;
}

export function TodayProgressCards({
  stepsCurrent = 0,
  stepsGoal = 6000,
  waterGlasses = 0,
  waterGoalGlasses = 8,
  sleepHours = '--',
  sleepQuality = 'Restful',
}: TodayProgressCardsProps) {
  const router = useRouter();

  const stepsPercent = stepsGoal > 0 ? Math.min(100, Math.round((stepsCurrent / stepsGoal) * 100)) : 0;
  const waterPercent = waterGoalGlasses > 0 ? Math.min(100, Math.round((waterGlasses / waterGoalGlasses) * 100)) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Today's Progress</Text>
        <TouchableOpacity onPress={() => router.push('/(mother)/track')} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsRow}>
        {/* 1. Steps Card */}
        <TouchableOpacity
          style={[styles.metricCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
          activeOpacity={0.8}
          onPress={() => router.push('/tracking/steps')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Footprints size={18} color="#10B981" strokeWidth={2.5} />
          </View>
          <Text style={styles.metricLabel}>Steps</Text>
          <Text style={styles.metricValue}>
            {stepsCurrent.toLocaleString()}
          </Text>
          <Text style={styles.metricGoal}>/ {stepsGoal.toLocaleString()}</Text>

          {/* Mini progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${stepsPercent}%`, backgroundColor: '#10B981' }]} />
          </View>
        </TouchableOpacity>

        {/* 2. Water Card */}
        <TouchableOpacity
          style={[styles.metricCard, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}
          activeOpacity={0.8}
          onPress={() => router.push('/tracking/water')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#BAE6FD' }]}>
            <Droplets size={18} color="#0284C7" strokeWidth={2.5} />
          </View>
          <Text style={styles.metricLabel}>Water</Text>
          <Text style={styles.metricValue}>
            {waterGlasses} <Text style={styles.metricUnit}>gls</Text>
          </Text>
          <Text style={styles.metricGoal}>/ {waterGoalGlasses} glasses</Text>

          {/* Mini progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${waterPercent}%`, backgroundColor: '#0284C7' }]} />
          </View>
        </TouchableOpacity>

        {/* 3. Sleep Card */}
        <TouchableOpacity
          style={[styles.metricCard, { backgroundColor: '#F3E8FF', borderColor: '#DDD6FE' }]}
          activeOpacity={0.8}
          onPress={() => router.push('/tracking/sleep')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#DDD6FE' }]}>
            <Moon size={18} color="#8B5CF6" strokeWidth={2.5} />
          </View>
          <Text style={styles.metricLabel}>Sleep</Text>
          <Text style={styles.metricValue}>{sleepHours}</Text>
          <Text style={[styles.metricGoal, { color: '#7C3AED', fontWeight: '700' }]}>{sleepQuality}</Text>

          {/* Mini progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '85%', backgroundColor: '#8B5CF6' }]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  metricGoal: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
