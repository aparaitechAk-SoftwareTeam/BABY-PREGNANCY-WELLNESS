import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Footprints,
  Droplets,
  Activity,
  Moon,
  Scale,
  Stethoscope,
  Heart,
  FileText,
  ChevronRight,
  Sparkles,
  ListTodo,
} from 'lucide-react-native';

// Global stores
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useStepsStore } from '../../store/steps.store';
import { useRoutineStore } from '../../store/routine.store';

// Interactive Routine Component for quick check-off
import { RoutineTrackerCard } from '../../components/tracking';

export default function MotherTrack() {
  const router = useRouter();
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);
  const profile = usePregnancyStore((state) => state.profile);

  const todaySteps = useStepsStore((state) => state.todaySteps);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const loadSteps = useStepsStore((state) => state.loadSteps);

  const routineTasks = useRoutineStore((state) => state.tasks);
  const getRoutineStats = useRoutineStore((state) => state.getStats);
  const loadRoutineTasks = useRoutineStore((state) => state.loadTasks);

  const [waterLoggedMl, setWaterLoggedMl] = useState(1750);
  const [currentWeightKg] = useState(
    profile?.prePregnancyWeight ? profile.prePregnancyWeight + 4.2 : 64.2
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRoutines, setShowRoutines] = useState(true);

  // Reload data when focused
  useFocusEffect(
    React.useCallback(() => {
      loadSteps(trimester);
      loadRoutineTasks();
    }, [trimester, loadSteps, loadRoutineTasks])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadSteps(trimester), loadRoutineTasks()]);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsRefreshing(false);
  };

  const routineStats = getRoutineStats();
  const stepPercentage = Math.min(100, Math.round((todaySteps / stepGoal) * 100));
  const waterPercentage = Math.min(100, Math.round((waterLoggedMl / 2500) * 100));

  const trackingHubCards = [
    {
      id: 'movement',
      title: 'Baby Kick Counter',
      category: 'CARDIFF MOTILITY PROTOCOL',
      subtitle: 'Track 10 fetal movements, session history & viability timers',
      metricPill: 'Ready to Count',
      icon: Footprints,
      color: '#E11D48',
      bg: '#FFE4E6',
      route: '/tracking/movement',
      progress: null,
    },
    {
      id: 'water',
      title: 'Daily Hydration Tracker',
      category: 'AMNIOTIC FLUID & CIRCULATION',
      subtitle: 'Target: 2,500 ml • Supports plasma expansion & fetal hydration',
      metricPill: `${waterLoggedMl} / 2,500 ml (${waterPercentage}%)`,
      icon: Droplets,
      color: '#0284C7',
      bg: '#E0F2FE',
      route: '/tracking/water',
      progress: waterPercentage,
    },
    {
      id: 'steps',
      title: 'Maternal Steps & Walking',
      category: 'ACOG LOW-IMPACT FITNESS',
      subtitle: 'Gentle exercise to relieve lumbar compression & pelvic stress',
      metricPill: `${todaySteps.toLocaleString()} / ${stepGoal.toLocaleString()} steps (${stepPercentage}%)`,
      icon: Activity,
      color: '#0D9488',
      bg: '#CCFBF1',
      route: '/tracking/steps',
      progress: stepPercentage,
    },
    {
      id: 'sleep',
      title: 'Sleep & Left-Side SOS Posture',
      category: 'INFERIOR VENA CAVA SAFETY',
      subtitle: 'SOS position guides, rest duration logs & sleep quality scores',
      metricPill: 'Left-Side SOS Guide',
      icon: Moon,
      color: '#6366F1',
      bg: '#EEF2FF',
      route: '/tracking/sleep',
      progress: null,
    },
    {
      id: 'weight',
      title: 'Maternal Weight & Growth',
      category: 'GESTATIONAL GAIN CURVE',
      subtitle: `Trimester ${trimester} curve • Baseline: ${profile?.prePregnancyWeight || 60.0} kg`,
      metricPill: `${currentWeightKg} kg • Optimal`,
      icon: Scale,
      color: '#16A34A',
      bg: '#DCFCE7',
      route: '/tracking/weight',
      progress: null,
    },
    {
      id: 'symptoms',
      title: 'Symptom Check & Red Flags',
      category: 'CLINICAL OBSTETRIC TRIAGE',
      subtitle: 'Check for high BP, preeclampsia flags & get guidance',
      metricPill: 'Daily Check-in',
      icon: Stethoscope,
      color: '#D97706',
      bg: '#FEF3C7',
      route: '/tracking/symptoms',
      progress: null,
    },
    {
      id: 'mood',
      title: 'Mood & Emotional Wellness',
      category: 'PERINATAL MENTAL HEALTH',
      subtitle: 'Track stress, anxiety, emotional balance & gentle affirmations',
      metricPill: 'Daily Reflection',
      icon: Heart,
      color: '#EC4899',
      bg: '#FCE7F3',
      route: '/tracking/mood',
      progress: null,
    },
    {
      id: 'notes',
      title: 'Doctor Questions & Notes',
      category: 'CONSULTATION PREPARATION',
      subtitle: 'Keep your questions ready for your next antenatal visit',
      metricPill: 'Open Notes',
      icon: FileText,
      color: '#7C3AED',
      bg: '#F5F3FF',
      route: '/tracking/notes',
      progress: null,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <Animated.ScrollView
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
        {/* Top Header */}
        <View style={styles.headerRow}>
          <View style={styles.badgeRow}>
            <View style={styles.weekPill}>
              <Text style={styles.weekPillText}>WEEK {currentWeek} • TRIMESTER {trimester}</Text>
            </View>
            <View style={styles.liveSyncPill}>
              <View style={styles.greenDot} />
              <Text style={styles.liveSyncText}>Unified Tracking Hub</Text>
            </View>
          </View>
          <Text style={styles.screenHeading}>Daily Maternal Trackers</Text>
          <Text style={styles.screenSubtitle}>
            Tap any tracker below to access its dedicated full page, clinical timers & analytics.
          </Text>
        </View>

        {/* Today's Quick Metrics Scorecard */}
        <View style={styles.scorecardContainer}>
          <View style={styles.scorecardHeader}>
            <View style={styles.scorecardTitleRow}>
              <Sparkles size={16} color="#E11D48" />
              <Text style={styles.scorecardTitle}>Today's Clinical Progress</Text>
            </View>
            <Text style={styles.scorecardSub}>
              {routineStats.completed} of {routineStats.total} daily tasks completed
            </Text>
          </View>

          <View style={styles.scorecardRow}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.scoreLabel}>Steps Walked</Text>
              <View style={styles.scoreMiniProgress}>
                <View style={[styles.scoreMiniFill, { width: `${stepPercentage}%`, backgroundColor: '#0D9488' }]} />
              </View>
            </View>

            <View style={styles.scoreDivider} />

            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{waterLoggedMl} ml</Text>
              <Text style={styles.scoreLabel}>Water Intake</Text>
              <View style={styles.scoreMiniProgress}>
                <View style={[styles.scoreMiniFill, { width: `${waterPercentage}%`, backgroundColor: '#0284C7' }]} />
              </View>
            </View>

            <View style={styles.scoreDivider} />

            <View style={styles.scoreItem}>
              <Text style={styles.scoreValue}>{currentWeightKg} kg</Text>
              <Text style={styles.scoreLabel}>Weight Log</Text>
              <View style={styles.scoreMiniProgress}>
                <View style={[styles.scoreMiniFill, { width: '85%', backgroundColor: '#16A34A' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Quick-Access Routine Tasks Toggle */}
        <View style={styles.routineSectionWrapper}>
          <TouchableOpacity
            style={styles.routineToggleHeader}
            onPress={() => setShowRoutines(!showRoutines)}
            activeOpacity={0.8}
          >
            <View style={styles.routineToggleLeft}>
              <View style={styles.routineIconBadge}>
                <ListTodo size={16} color="#E11D48" />
              </View>
              <View>
                <Text style={styles.routineToggleTitle}>Today's Routine & Medicine Checklist</Text>
                <Text style={styles.routineToggleSub}>
                  {routineStats.completed}/{routineStats.total} completed ({routineStats.percentage}%)
                </Text>
              </View>
            </View>
            <Text style={styles.routineToggleAction}>
              {showRoutines ? 'Hide ▲' : 'View ▼'}
            </Text>
          </TouchableOpacity>

          {showRoutines && (
            <View style={styles.routineCardInner}>
              <RoutineTrackerCard />
            </View>
          )}
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dedicated Tracking Pages</Text>
          <Text style={styles.sectionSub}>All trackers synchronized with your care profile</Text>
        </View>

        {/* Tracking Hub Cards List */}
        <View style={styles.hubCardsList}>
          {trackingHubCards.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.hubCard}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.85}
              >
                <View style={styles.hubCardTop}>
                  <View style={[styles.hubIconBox, { backgroundColor: item.bg }]}>
                    <Icon size={22} color={item.color} strokeWidth={2.3} />
                  </View>

                  <View style={styles.hubCardInfo}>
                    <Text style={styles.hubCardCategory}>{item.category}</Text>
                    <Text style={styles.hubCardTitle}>{item.title}</Text>
                    <Text style={styles.hubCardSubtitle} numberOfLines={2}>
                      {item.subtitle}
                    </Text>
                  </View>

                  <View style={styles.hubChevronBox}>
                    <ChevronRight size={18} color="#94A3B8" />
                  </View>
                </View>

                {/* Bottom Status Row */}
                <View style={styles.hubCardBottom}>
                  <View style={styles.hubMetricPill}>
                    <Text style={[styles.hubMetricPillText, { color: item.color }]}>
                      {item.metricPill}
                    </Text>
                  </View>

                  <View style={styles.openPageCTA}>
                    <Text style={[styles.openPageText, { color: item.color }]}>Open Full Tracker</Text>
                    <ChevronRight size={13} color={item.color} strokeWidth={2.5} />
                  </View>
                </View>

                {/* Optional mini progress bar */}
                {item.progress !== null && (
                  <View style={styles.cardProgressBar}>
                    <View
                      style={[
                        styles.cardProgressFill,
                        { width: `${item.progress}%`, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.ScrollView>
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
    paddingTop: 14,
    paddingBottom: 40,
  },
  headerRow: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  weekPill: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.4,
  },
  liveSyncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveSyncText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
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
    marginTop: 4,
    fontWeight: '400',
    lineHeight: 18,
  },
  scorecardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
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
  scorecardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  scorecardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scorecardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  scorecardSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  scorecardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  scoreMiniProgress: {
    width: '80%',
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  scoreDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F1F5F9',
  },
  routineSectionWrapper: {
    marginBottom: 16,
  },
  routineToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routineToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routineIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineToggleTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  routineToggleSub: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  routineToggleAction: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  routineCardInner: {
    marginTop: 10,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  hubCardsList: {
    gap: 12,
  },
  hubCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  hubCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  hubIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubCardInfo: {
    flex: 1,
  },
  hubCardCategory: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  hubCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  hubCardSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  hubChevronBox: {
    paddingTop: 2,
  },
  hubCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  hubMetricPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  hubMetricPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  openPageCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  openPageText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  cardProgressBar: {
    height: 3,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
