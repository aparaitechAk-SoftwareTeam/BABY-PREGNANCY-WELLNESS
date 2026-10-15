import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';

// Global stores
import { usePregnancyStore } from '../../store/pregnancy.store';

// Modular tracking components
import {
  KickCounterCard,
  HydrationTrackerCard,
  WeightLogCard,
  SymptomCheckinCard,
  RoutineTrackerCard,
  StepCounterCard,
  NotesCard,
} from '../../components/tracking';

export default function MotherTrack() {
  const router = useRouter();
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);
  const profile = usePregnancyStore((state) => state.profile);

  const [waterLoggedMl, setWaterLoggedMl] = useState(1750);
  const [currentWeightKg, setCurrentWeightKg] = useState(profile?.prePregnancyWeight ? profile.prePregnancyWeight + 4.2 : 64.2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleAddWater = (amount: number) => {
    setWaterLoggedMl((prev) => Math.min(4500, prev + amount));
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
        {/* Top Screen Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenHeading}>Daily Tracking</Text>
            <Text style={styles.screenSubtitle}>
              Week {currentWeek} • Routine, habits & clinical health logs
            </Text>
          </View>
        </View>

        {/* Full Width Cards - Stacked Vertically */}
        <View style={styles.cardsContainer}>
          {/* Today's Routine & Tasks Tracker Card */}
          <View style={styles.cardWrapper}>
            <RoutineTrackerCard />
          </View>

          <View style={styles.cardWrapper}>
            <KickCounterCard />
          </View>

          <View style={styles.cardWrapper}>
            <HydrationTrackerCard
              loggedMl={waterLoggedMl}
              goalMl={2500}
              onAddWater={handleAddWater}
              onReset={() => setWaterLoggedMl(0)}
            />
          </View>

          {/* Daily Steps & Physical Activity Tracker Card */}
          <View style={styles.cardWrapper}>
            <StepCounterCard />
          </View>

          <View style={styles.cardWrapper}>
            <WeightLogCard
              currentWeightKg={currentWeightKg}
              baselineWeightKg={profile?.prePregnancyWeight || 60.0}
              trimester={trimester}
              onSaveWeight={setCurrentWeightKg}
            />
          </View>

          <View style={styles.cardWrapper}>
            <SymptomCheckinCard />
          </View>

          {/* Pregnancy Notes & Doctor Questions */}
          <View style={styles.cardWrapper}>
            <NotesCard />
          </View>

          {/* Sleep & Mood Wellbeing Quick Cards */}
          <View style={styles.extraTrackersRow}>
            <TouchableOpacity
              onPress={() => router.push('/tracking/sleep')}
              style={[styles.extraTrackerTile, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
              activeOpacity={0.8}
            >
              <Text style={styles.extraTrackerEmoji}>🛏️</Text>
              <Text style={styles.extraTrackerTitle}>Sleep Tracker</Text>
              <Text style={styles.extraTrackerSub}>Left-side SOS log ›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/tracking/mood')}
              style={[styles.extraTrackerTile, { backgroundColor: '#FDF4FF', borderColor: '#F5D0FE' }]}
              activeOpacity={0.8}
            >
              <Text style={styles.extraTrackerEmoji}>🧘‍♀️</Text>
              <Text style={styles.extraTrackerTitle}>Mood & Mental</Text>
              <Text style={styles.extraTrackerSub}>Daily emotions ›</Text>
            </TouchableOpacity>
          </View>
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
    paddingTop: 12,
    paddingBottom: 32,
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
  cardsContainer: {
    gap: 14,
  },
  cardWrapper: {
    width: '100%',
  },
  extraTrackersRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  extraTrackerTile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  extraTrackerEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  extraTrackerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  extraTrackerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
});
