import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Global stores
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useAuthStore } from '../../store/auth.store';
import { useStepsStore } from '../../store/steps.store';
import { useRoutineStore } from '../../store/routine.store';
import { useNotificationStore } from '../../store/notification.store';
import { trackingApi } from '../../services/api/tracking.api';

// Modular UI Components from components/dashboard
import {
  HeaderProfileBar,
  UnifiedMilestoneCard,
  TodayProgressCards,
  QuickActionsGrid,
  TodayRemindersCard,
  UpcomingAppointmentAnnouncement,
  SmartTimelineCard,
} from '../../components/dashboard';
import { EmergencySOSModal } from '../../components/common';

export default function MotherDashboard() {
  const router = useRouter();
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Stores
  const user = useAuthStore((state: any) => state.user);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const currentDay = usePregnancyStore((state) => state.currentDay);
  const trimester = usePregnancyStore((state) => state.trimester);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);
  const profile = usePregnancyStore((state) => state.profile);

  // Realtime Stores
  const todaySteps = useStepsStore((state) => state.todaySteps);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const loadTodaySteps = useStepsStore((state) => state.loadTodaySteps);

  const loadTasks = useRoutineStore((state) => state.loadTasks);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);

  // Local interactive tracking states
  const [waterLoggedMl, setWaterLoggedMl] = useState(0);
  const [sleepStats, setSleepStats] = useState({ hours: '--', quality: 'Not logged' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  // Refresh all realtime data from DB
  const refreshLiveDashboard = React.useCallback(async () => {
    try {
      await Promise.allSettled([
        loadTodaySteps(),
        loadTasks(currentWeek),
        loadNotifications(),
        (async () => {
          try {
            const res = await trackingApi.getTodaySummary();
            const summary = res?.data;
            if (summary) {
              if (typeof summary.waterMl === 'number') {
                setWaterLoggedMl(summary.waterMl);
              }
              if (summary.sleep) {
                setSleepStats({
                  hours: summary.sleep.hoursFormatted || `${Math.floor(summary.sleep.durationMinutes / 60)}h ${summary.sleep.durationMinutes % 60}m`,
                  quality: summary.sleep.quality || 'Restful',
                });
              }
            }
          } catch (e) {
            // Ignore offline fallback
          }
        })(),
      ]);
    } catch (e) {
      // Quiet catch
    }
  }, [currentWeek, user?.id, loadTodaySteps, loadTasks, loadNotifications]);

  // Scroll to top and reload live data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      refreshLiveDashboard();
    }, [refreshLiveDashboard])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshLiveDashboard();
    setIsRefreshing(false);
  };

  const handleAddWater = async (amount: number) => {
    setWaterLoggedMl((prev) => Math.min(4000, prev + amount));
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await trackingApi.logWater({
        userId: user?.id,
        email: user?.email,
        amountMl: amount,
        label: 'Quick Water',
        timeStr,
      });
    } catch (e) {
      // Ignore background sync errors
    }
  };

  const handleKickCounter = () => {
    router.push('/tracking/movement');
  };

  const handleHydration = () => {
    router.push('/tracking/water');
  };

  const handleWeight = () => {
    router.push('/tracking/weight');
  };

  const handleSymptoms = () => {
    router.push('/tracking/symptoms');
  };

  const handleNotes = () => {
    router.push('/tracking/mood');
  };

  const handleEmergencyGuidance = () => {
    setShowSOSModal(true);
  };

  const handleAIAssistant = () => {
    Alert.alert(
      '🤖 Maternal AI Assistant',
      'Ask any symptom, nutrition, or safe stretch questions. AI provides evidence-backed guidance verified by OB-GYN guidelines.'
    );
  };

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
        {/* 1. Header Profile & Status Bar */}
        <HeaderProfileBar
          userName={user?.name || 'Mama'}
          babyNickname={profile?.nickname || 'Little Miracle'}
          isPartnerSynced={false}
          onNotificationsPress={() => router.push('/notifications')}
          onPartnerPress={() => router.push('/partner')}
          onSOSPress={() => setShowSOSModal(true)}
        />

        {/* 2. Top Horizontal Appointment Announcement Banner (if upcoming/today) */}
        <UpcomingAppointmentAnnouncement
          mode="mother"
          onPressViewAll={() => router.push('/(mother)/calendar')}
        />

        {/* 3. Unified Hero Milestone Card (Consolidates Week Progress, Due Date & Baby Fruit Size with 1 Click) */}
        <UnifiedMilestoneCard
          currentWeek={currentWeek}
          currentDay={currentDay}
          trimester={trimester}
          daysRemaining={daysRemaining}
          dueDate={profile?.dueDate || new Date().toISOString()}
          onPressDetails={() => router.push(`/pregnancy/week/${currentWeek}` as any)}
        />

        {/* 4. Today's Progress: Steps, Water, Sleep (Realtime Database Synced) */}
        <TodayProgressCards
          stepsCurrent={todaySteps}
          stepsGoal={stepGoal}
          waterGlasses={Math.round(waterLoggedMl / 250)}
          waterGoalGlasses={10}
          sleepHours={sleepStats.hours}
          sleepQuality={sleepStats.quality}
        />

        {/* 5. Quick Actions Grid (All 8 Essential Tools clearly visible without hidden scrolling) */}
        <QuickActionsGrid
          onKickCounterPress={handleKickCounter}
          onStepsPress={() => router.push('/tracking/steps')}
          onHydrationPress={handleHydration}
          onWeightPress={handleWeight}
          onSymptomsPress={handleSymptoms}
          onVaultPress={() => router.push('/vault')}
          onTimelinePress={() => router.push('/timeline')}
          onSupportPress={() => router.push('/support')}
        />

        {/* 5. Smart Pregnancy Timeline & Incomplete Logs Card */}
        <SmartTimelineCard />

        {/* 6. Today's Routine & Reminders Card */}
        <TodayRemindersCard
          waterLoggedMl={waterLoggedMl}
          waterGoalMl={2500}
          onAddWater={handleAddWater}
          onViewAppointments={() => router.push('/(mother)/calendar')}
        />
      </Animated.ScrollView>

      {/* 24/7 Rapid Obstetric Triage & Emergency SOS Modal */}
      <EmergencySOSModal
        visible={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />
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
    paddingTop: 10,
    paddingBottom: 28,
  },
});
