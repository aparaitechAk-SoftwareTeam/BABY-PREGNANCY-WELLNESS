import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Heart, Droplet, Brain, Footprints, CheckCircle2, Clock } from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useRoutineStore } from '../../store/routine.store';
import { useStepsStore } from '../../store/steps.store';

export default function CaregiverTrack() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const profile = usePregnancyStore((state) => state.profile);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);

  const routineTasks = useRoutineStore((state) => state.tasks);
  const completedRoutineTasks = routineTasks.filter((t) => t.isCompleted);

  const todaySteps = useStepsStore((state) => state.todaySteps);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const distanceKm = useStepsStore((state) => state.distanceKm);
  const activeMinutes = useStepsStore((state) => state.activeMinutes);
  const caloriesKcal = useStepsStore((state) => state.caloriesKcal);
  const stepPercentage = stepGoal > 0 ? Math.min(100, Math.round((todaySteps / stepGoal) * 100)) : 0;

  // Scroll to top and refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      useStepsStore.getState().loadTodaySteps();
      useRoutineStore.getState().loadTasks(currentWeek);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [currentWeek])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      useStepsStore.getState().loadTodaySteps(),
      useRoutineStore.getState().loadTasks(currentWeek),
    ]);
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#E11D48"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenHeading}>Mother's Health</Text>
            <Text style={styles.screenSubtitle}>
              Week {currentWeek || 20} • Trimester {trimester || 2} • Monitor vital health metrics
            </Text>
          </View>
        </View>

        {/* Information Message */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Caregiver Live View</Text>
          <Text style={styles.infoText}>
            As a caregiver, you have real-time visibility into the mother's daily habits, step activity, and shared vitals.
          </Text>
        </View>

        {/* Live Step Activity Tracker */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Daily Step Activity</Text>
          <View style={styles.stepCard}>
            <View style={styles.stepHeaderRow}>
              <View style={styles.stepIconBg}>
                <Footprints size={20} color="#0D9488" strokeWidth={2.5} />
              </View>
              <View style={styles.stepHeaderInfo}>
                <Text style={styles.stepCountText}>
                  {todaySteps.toLocaleString()} <Text style={styles.stepGoalSub}>/ {stepGoal.toLocaleString()} steps</Text>
                </Text>
                <Text style={styles.stepProgressSub}>{stepPercentage}% of daily prenatal goal</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${stepPercentage}%` }]} />
            </View>

            {/* Metrics Chips */}
            <View style={styles.stepMetricsRow}>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipValue}>{distanceKm} km</Text>
                <Text style={styles.metricChipLabel}>Distance</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipValue}>{activeMinutes} mins</Text>
                <Text style={styles.metricChipLabel}>Active Walk</Text>
              </View>
              <View style={styles.metricChip}>
                <Text style={styles.metricChipValue}>{caloriesKcal} kcal</Text>
                <Text style={styles.metricChipLabel}>Calories</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vital Signs Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Vitals</Text>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: '#FEE2E6' }]}>
              <Heart size={18} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.vitalInfo}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={styles.vitalValue}>78 bpm</Text>
              <Text style={styles.vitalTime}>Normal maternal resting rate</Text>
            </View>
            <Text style={styles.vitalStatus}>Normal</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: '#DBEAFE' }]}>
              <Droplet size={18} color="#0EA5E9" strokeWidth={2} />
            </View>
            <View style={styles.vitalInfo}>
              <Text style={styles.vitalLabel}>Weight & BP</Text>
              <Text style={styles.vitalValue}>
                {profile?.currentWeight ? `${profile.currentWeight} kg` : '--'} • 120/80 mmHg
              </Text>
              <Text style={styles.vitalTime}>Healthy gestational range</Text>
            </View>
            <Text style={styles.vitalStatus}>Healthy</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Brain size={18} color="#10B981" strokeWidth={2} />
            </View>
            <View style={styles.vitalInfo}>
              <Text style={styles.vitalLabel}>Hydration & Wellness</Text>
              <Text style={styles.vitalValue}>
                {routineTasks.find((t) => t.id === 'water-goal')?.isCompleted ? 'Goal Met (2.5L)' : 'Logging in Progress'}
              </Text>
              <Text style={styles.vitalTime}>ACOG Recommended intake</Text>
            </View>
            <Text style={styles.vitalStatus}>
              {routineTasks.find((t) => t.id === 'water-goal')?.isCompleted ? 'Optimal' : 'Active'}
            </Text>
          </View>
        </View>

        {/* Routine Activities Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.routineHeaderRow}>
            <Text style={styles.sectionTitle}>Daily Routine Habits</Text>
            <Text style={styles.routineBadgeCount}>
              {completedRoutineTasks.length} / {routineTasks.length} Done
            </Text>
          </View>

          {routineTasks.map((task) => (
            <View key={task.id} style={styles.activityCard}>
              <View
                style={[
                  styles.activityDot,
                  { backgroundColor: task.isCompleted ? '#10B981' : '#CBD5E1' },
                ]}
              />
              <View style={styles.activityInfo}>
                <Text
                  style={[
                    styles.activityTitle,
                    task.isCompleted && styles.activityTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>
                <Text style={styles.activityTime}>
                  {task.timeStr} • {task.category.toUpperCase()}
                </Text>
              </View>
              {task.isCompleted ? (
                <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} />
              ) : (
                <Clock size={16} color="#94A3B8" strokeWidth={2} />
              )}
            </View>
          ))}
        </View>

        {/* Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Privacy Notice</Text>
          <Text style={styles.noticeText}>
            The mother's tracking data is private. Only information shared with you through the family sharing feature will appear here.
          </Text>
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 16,
  },
  headerRow: {
    marginBottom: 18,
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  vitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vitalIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vitalInfo: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  vitalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  vitalTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  vitalStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  activityBadge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  noticeCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 16,
    fontWeight: '500',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepHeaderInfo: {
    flex: 1,
  },
  stepCountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepGoalSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  stepProgressSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0D9488',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 4,
  },
  stepMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
  },
  metricChip: {
    alignItems: 'center',
    flex: 1,
  },
  metricChipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricChipLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  routineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routineBadgeCount: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
});
