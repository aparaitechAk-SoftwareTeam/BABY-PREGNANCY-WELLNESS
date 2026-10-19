import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Heart,
  Users,
  Calendar,
  Bell,
  LogOut,
  ListTodo,
  CheckCircle2,
  Circle,
  Footprints,
  Sparkles,
  FolderLock,
  Car,
  Briefcase,
  AlertTriangle,
  Link2,
  Droplets,
  Moon,
  Activity,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useRoutineStore } from '../../store/routine.store';
import { useStepsStore } from '../../store/steps.store';
import { useFamilyTasksStore } from '../../store/family-tasks.store';
import { useBirthPrepStore } from '../../store/birth-prep.store';
import { useNotificationStore } from '../../store/notification.store';
import { useFamilyStore } from '../../store/family.store';
import {
  CaregiverStatsCard,
  CaregiverStatusBanner,
  CaregiverQuickInfo,
} from '../../components/caregiver';
import { UpcomingAppointmentAnnouncement } from '../../components/dashboard';
import { EmergencySOSModal } from '../../components/common';

export default function CaregiverHome() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);
  const pregnancyProfile = usePregnancyStore((state) => state.profile);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [pairingInput, setPairingInput] = useState('');

  // Family Store (Live Mother Pairing)
  const isCaregiverPaired = useFamilyStore((state) => state.isCaregiverPaired);
  const motherLiveData = useFamilyStore((state) => state.motherLiveData);
  const isLoadingMotherData = useFamilyStore((state) => state.isLoadingMotherData);
  const isPairingSubmitting = useFamilyStore((state) => state.isPairingSubmitting);
  const fetchCaregiverStatus = useFamilyStore((state) => state.fetchCaregiverStatus);
  const fetchMotherLiveData = useFamilyStore((state) => state.fetchMotherLiveData);
  const pairWithMother = useFamilyStore((state) => state.pairWithMother);

  // Computed Active Mother Metrics (Live from Neon DB if paired, fallback to local)
  const activeMotherName =
    motherLiveData?.mother?.nickname ||
    motherLiveData?.mother?.name ||
    (pregnancyProfile?.nickname ? `${pregnancyProfile.nickname}'s Mother` : user?.partnerName || 'Mother');

  const activeWeek = motherLiveData?.mother?.currentWeek || currentWeek || 20;
  const activeDaysRemaining = motherLiveData?.mother?.daysRemaining || daysRemaining || 140;
  const activeWeight = motherLiveData?.mother?.currentWeight
    ? `${motherLiveData.mother.currentWeight} kg`
    : pregnancyProfile?.currentWeight
    ? `${pregnancyProfile.currentWeight} kg`
    : '--';
  const activeHeight =
    motherLiveData?.mother?.heightFt ||
    (motherLiveData?.mother?.height ? `${motherLiveData.mother.height} cm` : null) ||
    pregnancyProfile?.heightFt ||
    (pregnancyProfile?.height ? `${pregnancyProfile.height} cm` : '--');
  const activeAge = motherLiveData?.mother?.motherAge
    ? `${motherLiveData.mother.motherAge} years`
    : pregnancyProfile?.motherAge
    ? `${pregnancyProfile.motherAge} years`
    : '--';
  const activeDueDate = motherLiveData?.mother?.dueDate
    ? new Date(motherLiveData.mother.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : pregnancyProfile?.dueDate
    ? new Date(pregnancyProfile.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not set';
  const activeBloodType = motherLiveData?.mother?.bloodGroup || pregnancyProfile?.bloodGroup || '--';

  const routineTasks = useRoutineStore((state) => state.tasks);
  const routineTotal = routineTasks.length;
  const routineCompleted = routineTasks.filter((t) => t.isCompleted).length;
  const routinePercentage = routineTotal > 0 ? Math.round((routineCompleted / routineTotal) * 100) : 0;

  const todaySteps = motherLiveData?.today?.steps ?? useStepsStore((state) => state.todaySteps);
  const stepGoal = motherLiveData?.today?.stepGoal ?? useStepsStore((state) => state.stepGoal);
  const stepsPercentage = stepGoal > 0 ? Math.min(100, Math.round((todaySteps / stepGoal) * 100)) : 0;

  const familyTasks = useFamilyTasksStore((state) => state.tasks);
  const toggleFamilyTask = useFamilyTasksStore((state) => state.toggleTask);

  const checklist = useBirthPrepStore((state) => state.checklist);
  const birthStats = useBirthPrepStore((state) => state.getStats());
  const loadBirthPrepData = useBirthPrepStore((state) => state.loadBirthPrepData);
  const toggleItemPacked = useBirthPrepStore((state) => state.toggleItemPacked);
  const unreadUpdates = useNotificationStore((state) => state.unreadCount);

  const handlePairSubmit = async () => {
    if (!pairingInput.trim()) {
      Alert.alert('Pairing Code Required', 'Please enter the 6-character code (e.g. MOM-XXXX) provided by the mother.');
      return;
    }
    const res = await pairWithMother(pairingInput.trim().toUpperCase());
    if (res.success) {
      Alert.alert('Connected! 🎉', res.message);
      setPairingInput('');
    } else {
      Alert.alert('Connection Failed', res.message);
    }
  };

  const refreshCaregiverData = React.useCallback(async () => {
    await Promise.allSettled([
      fetchCaregiverStatus(),
      fetchMotherLiveData(),
      loadBirthPrepData(),
      useStepsStore.getState().loadTodaySteps(),
      useRoutineStore.getState().loadTasks(activeWeek),
      useNotificationStore.getState().loadNotifications(),
    ]);
  }, [activeWeek, fetchCaregiverStatus, fetchMotherLiveData, loadBirthPrepData]);

  // Scroll to top and refresh when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refreshCaregiverData();
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [refreshCaregiverData])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCaregiverData();
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleTrackHealth = () => {
    router.push('/(caregiver)/track');
  };

  const handleAppointments = () => {
    router.push('/(caregiver)/calendar');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleFamilyUpdates = () => {
    router.push('/(caregiver)/reports');
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
            <Text style={styles.screenHeading}>Caregiver Dashboard</Text>
            <Text style={styles.screenSubtitle}>Support & Monitor</Text>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.headerTopRow}>
          <View style={styles.headerIcon}>
            <Heart size={24} color="#E11D48" strokeWidth={2} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeTitle}>Welcome, {user?.name || 'Caregiver'}!</Text>
            <Text style={styles.welcomeSubtitle}>
              {isCaregiverPaired ? `Linked with ${activeMotherName}` : 'Caregiver Circle'}
            </Text>
          </View>

          {/* SOS Emergency Button */}
          <TouchableOpacity
            onPress={() => setShowSOSModal(true)}
            style={styles.sosCaregiverBtn}
            activeOpacity={0.8}
            accessibilityLabel="Emergency SOS"
          >
            <View style={styles.sosDot} />
            <Text style={styles.sosCaregiverText}>SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            activeOpacity={0.7}
          >
            <LogOut size={18} color="#E11D48" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Pairing Code Card (Displayed when Caregiver is NOT paired yet) */}
        {!isCaregiverPaired && (
          <View style={styles.pairingCard}>
            <View style={styles.pairingCardHeader}>
              <View style={styles.pairingIconBadge}>
                <Link2 size={20} color="#E11D48" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.pairingCardTitle}>Link with Mother's Account</Text>
                <Text style={styles.pairingCardSubtitle}>
                  Enter the mother's 6-character invite code (e.g. MOM-XXXX) to view her live vitals.
                </Text>
              </View>
            </View>

            <View style={styles.pairingInputRow}>
              <TextInput
                style={styles.pairingInput}
                placeholder="Enter Code (e.g. MOM-XXXX)"
                placeholderTextColor="#94A3B8"
                value={pairingInput}
                onChangeText={setPairingInput}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.pairingSubmitBtn}
                onPress={handlePairSubmit}
                disabled={isPairingSubmitting}
                activeOpacity={0.8}
              >
                {isPairingSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.pairingSubmitBtnText}>Link</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.pairingHelperText}>
              The mother can find her code in Profile → Family & Partner Circle.
            </Text>
          </View>
        )}

        {/* Clinical Alert Banner (If mother reported urgent symptoms) */}
        {motherLiveData?.clinicalAlerts?.hasUrgentSymptom && (
          <View style={styles.urgentAlertBanner}>
            <AlertTriangle size={20} color="#DC2626" strokeWidth={2.5} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.urgentAlertTitle}>Clinical Red-Flag Alert</Text>
              <Text style={styles.urgentAlertSub}>
                The mother recorded an urgent symptom. Please check in on her immediately or call triage.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(caregiver)/track')}
              style={styles.urgentAlertAction}
            >
              <Text style={styles.urgentAlertActionText}>Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Banner */}
        <CaregiverStatusBanner
          motherName={activeMotherName}
          connectionStatus={isCaregiverPaired ? 'connected' : 'pending'}
        />

        {/* Top Horizontal Appointment Announcement (Today / Upcoming) */}
        <UpcomingAppointmentAnnouncement
          mode="caregiver"
          onPressViewAll={() => router.push('/(caregiver)/calendar')}
        />

        {/* Mother Information Card */}
        <View style={styles.motherInfoCard}>
          <View style={styles.motherInfoHeader}>
            <View style={styles.motherAvatarBg}>
              <Heart size={24} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.motherNameSection}>
              <Text style={styles.motherNameLabel}>Monitored Mother</Text>
              <Text style={styles.motherName}>{activeMotherName}</Text>
            </View>
            {isCaregiverPaired && (
              <View style={styles.liveDbTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveDbTagText}>Live Cloud Sync</Text>
              </View>
            )}
          </View>
          
          <View style={styles.motherStatsRow}>
            <View style={styles.motherStatBox}>
              <Text style={styles.motherStatLabel}>Gestational Week</Text>
              <Text style={styles.motherStatValue}>Week {activeWeek}</Text>
            </View>
            <View style={styles.motherStatBox}>
              <Text style={styles.motherStatLabel}>Weight</Text>
              <Text style={styles.motherStatValue}>{activeWeight}</Text>
            </View>
            <View style={styles.motherStatBox}>
              <Text style={styles.motherStatLabel}>Height</Text>
              <Text style={styles.motherStatValue}>{activeHeight}</Text>
            </View>
          </View>

          <View style={styles.motherDetailsRow}>
            <View style={styles.motherDetailItem}>
              <Text style={styles.motherDetailLabel}>Age</Text>
              <Text style={styles.motherDetailValue}>{activeAge}</Text>
            </View>
            <View style={styles.motherDetailItem}>
              <Text style={styles.motherDetailLabel}>Due Date</Text>
              <Text style={styles.motherDetailValue}>{activeDueDate}</Text>
            </View>
            <View style={styles.motherDetailItem}>
              <Text style={styles.motherDetailLabel}>Blood Type</Text>
              <Text style={styles.motherDetailValue}>{activeBloodType}</Text>
            </View>
          </View>

          {/* Live Vitals Quad Strip (Steps, Hydration, Sleep, Kicks) */}
          <View style={styles.liveVitalsStrip}>
            {/* Step Count */}
            <View style={styles.liveVitalItem}>
              <View style={[styles.liveVitalIconBox, { backgroundColor: '#CCFBF1' }]}>
                <Footprints size={15} color="#0D9488" strokeWidth={2.4} />
              </View>
              <View style={styles.liveVitalTextCol}>
                <Text style={styles.liveVitalLabel}>Gentle Movement</Text>
                <Text style={styles.liveVitalValue}>
                  {todaySteps.toLocaleString()} / {stepGoal.toLocaleString()} steps ({stepsPercentage}%)
                </Text>
              </View>
            </View>

            {/* Hydration */}
            <View style={styles.liveVitalItem}>
              <View style={[styles.liveVitalIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Droplets size={15} color="#0284C7" strokeWidth={2.4} />
              </View>
              <View style={styles.liveVitalTextCol}>
                <Text style={styles.liveVitalLabel}>Today's Hydration</Text>
                <Text style={styles.liveVitalValue}>
                  {motherLiveData?.today?.waterMl ?? 0} ml / {motherLiveData?.today?.waterGoalMl ?? 2500} ml ({motherLiveData?.today?.waterPercentage ?? 0}%)
                </Text>
              </View>
            </View>

            {/* Sleep */}
            <View style={styles.liveVitalItem}>
              <View style={[styles.liveVitalIconBox, { backgroundColor: '#F3E8FF' }]}>
                <Moon size={15} color="#7E22CE" strokeWidth={2.4} />
              </View>
              <View style={styles.liveVitalTextCol}>
                <Text style={styles.liveVitalLabel}>Rest & Sleep</Text>
                <Text style={styles.liveVitalValue}>
                  {motherLiveData?.today?.sleepHoursFormatted || 'Rest recorded'} ({motherLiveData?.today?.sleepQuality || 'Good'})
                </Text>
              </View>
            </View>

            {/* Kicks */}
            {motherLiveData?.today?.kicks && (
              <View style={styles.liveVitalItem}>
                <View style={[styles.liveVitalIconBox, { backgroundColor: '#FFE4E6' }]}>
                  <Activity size={15} color="#E11D48" strokeWidth={2.4} />
                </View>
                <View style={styles.liveVitalTextCol}>
                  <Text style={styles.liveVitalLabel}>Cardiff Kick Counter</Text>
                  <Text style={styles.liveVitalValue}>
                    {motherLiveData.today.kicks.count} kicks recorded ({motherLiveData.today.kicks.durationFormatted})
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Stats Card */}
        <CaregiverStatsCard
          currentWeek={activeWeek}
          daysRemaining={activeDaysRemaining}
          unreadUpdates={unreadUpdates}
        />

        {/* Mother's Daily Routine & Habits Monitoring */}
        <View style={styles.routineCard}>
          <View style={styles.routineHeader}>
            <View style={styles.routineHeaderLeft}>
              <View style={styles.routineIconBg}>
                <ListTodo size={18} color="#E11D48" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.routineTitle}>Mother's Daily Routine & Tasks</Text>
                <Text style={styles.routineSubtitle}>
                  {routineCompleted} of {routineTotal} completed today ({routinePercentage}%)
                </Text>
              </View>
            </View>
            <View style={styles.routinePercentBadge}>
              <Text style={styles.routinePercentText}>{routinePercentage}%</Text>
            </View>
          </View>

          <View style={styles.routineProgressTrack}>
            <View style={[styles.routineProgressFill, { width: `${routinePercentage}%` }]} />
          </View>

          <View style={styles.routineTasksList}>
            {routineTasks.slice(0, 4).map((task) => (
              <View key={task.id} style={styles.routineTaskRow}>
                {task.isCompleted ? (
                  <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} />
                ) : (
                  <Circle size={16} color="#94A3B8" strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.routineTaskName,
                    task.isCompleted && styles.routineTaskNameDone,
                  ]}
                  numberOfLines={1}
                >
                  {task.emoji} {task.title}
                </Text>
                <Text style={styles.routineTaskStatus}>
                  {task.isCompleted ? 'Done ✓' : task.timeStr}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Assigned Family Tasks for Caregiver */}
        <View style={styles.routineCard}>
          <View style={styles.routineHeader}>
            <View style={styles.routineHeaderLeft}>
              <View style={[styles.routineIconBg, { backgroundColor: '#FEF3C7' }]}>
                <Car size={18} color="#D97706" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.routineTitle}>Assigned Tasks for You</Text>
                <Text style={styles.routineSubtitle}>
                  {familyTasks.filter((t) => !t.isCompleted).length} pending support tasks from mother
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/partner/tasks')}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#E11D48' }}>
                View All ›
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.routineTasksList}>
            {familyTasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.routineTaskRow}
                onPress={() => toggleFamilyTask(task.id, 'Partner')}
                activeOpacity={0.7}
              >
                {task.isCompleted ? (
                  <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} />
                ) : (
                  <Circle size={16} color="#CBD5E1" strokeWidth={2} />
                )}
                <Text
                  style={[
                    styles.routineTaskName,
                    task.isCompleted && styles.routineTaskNameDone,
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                <Text
                  style={[
                    styles.routineTaskStatus,
                    { color: task.isCompleted ? '#10B981' : '#E11D48' },
                  ]}
                >
                  {task.isCompleted ? 'Done ✓' : task.dueDate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Labor & Birth Readiness Monitoring Card */}
        <View style={styles.routineCard}>
          <View style={styles.routineHeader}>
            <View style={styles.routineHeaderLeft}>
              <View style={[styles.routineIconBg, { backgroundColor: '#FEE2E2' }]}>
                <Briefcase size={18} color="#DC2626" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.routineTitle}>Labor & Hospital Readiness</Text>
                <Text style={styles.routineSubtitle}>
                  Hospital Bag: {birthStats.packed} of {birthStats.total} packed ({birthStats.percent}%)
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/(caregiver)/birth-readiness')}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>
                Open Guide ›
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.routineProgressTrack}>
            <View
              style={[
                styles.routineProgressFill,
                { width: `${birthStats.percent}%`, backgroundColor: '#DC2626' },
              ]}
            />
          </View>

          {/* Quick Partner Checklist Items Preview */}
          <View style={styles.routineTasksList}>
            {checklist
              .filter((i) => i.category === 'partner' || i.category === 'documents')
              .slice(0, 3)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.routineTaskRow}
                  onPress={() => toggleItemPacked(item.id)}
                  activeOpacity={0.7}
                >
                  {item.isPacked ? (
                    <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} />
                  ) : (
                    <Circle size={16} color="#94A3B8" strokeWidth={2} />
                  )}
                  <Text
                    style={[
                      styles.routineTaskName,
                      item.isPacked && styles.routineTaskNameDone,
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      styles.routineTaskStatus,
                      { color: item.isPacked ? '#10B981' : '#64748B' },
                    ]}
                  >
                    {item.isPacked ? 'Packed ✓' : 'Needed'}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          {/* 5-1-1 Shortcut Strip */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFBEB',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              marginTop: 10,
              borderWidth: 1,
              borderColor: '#FDE68A',
            }}
            onPress={() => router.push('/(caregiver)/birth-readiness')}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#92400E' }}>
              🚑 5-1-1 Labor Rule & Hospital Route
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#D97706' }}>View ›</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Info */}
        <CaregiverQuickInfo />

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.75}
              onPress={handleTrackHealth}
            >
              <View style={styles.actionIconBg}>
                <Heart size={20} color="#E11D48" strokeWidth={2} />
              </View>
              <Text style={styles.actionTitle}>Mother's Health</Text>
              <Text style={styles.actionSubtitle}>View vitals</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.75}
              onPress={handleAppointments}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#E0F2FE' }]}>
                <Calendar size={20} color="#0EA5E9" strokeWidth={2} />
              </View>
              <Text style={styles.actionTitle}>Appointments</Text>
              <Text style={styles.actionSubtitle}>Upcoming dates</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.75}
              onPress={handleNotifications}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FEF2F2' }]}>
                <Bell size={20} color="#E11D48" strokeWidth={2} />
              </View>
              <Text style={styles.actionTitle}>Notifications</Text>
              <Text style={styles.actionSubtitle}>Latest updates</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.75}
              onPress={handleFamilyUpdates}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#F0FDF4' }]}>
                <Users size={20} color="#10B981" strokeWidth={2} />
              </View>
              <Text style={styles.actionTitle}>Family Updates</Text>
              <Text style={styles.actionSubtitle}>Share moments</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.75}
              onPress={() => router.push('/timeline')}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#FFF1F2' }]}>
                <Sparkles size={20} color="#E11D48" strokeWidth={2} />
              </View>
              <Text style={styles.actionTitle}>Care Timeline</Text>
              <Text style={styles.actionSubtitle}>Milestones & tests</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard} 
              activeOpacity={0.75}
              onPress={() => router.push('/vault')}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#ECFDF5' }]}>
                <FolderLock size={20} color="#059669" strokeWidth={2} />
              </View>
              <Text style={styles.actionTitle}>Shared Vault</Text>
              <Text style={styles.actionSubtitle}>Scans & reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Your Role</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoBadge}>
              <Users size={16} color="#E11D48" strokeWidth={2} />
              <Text style={styles.infoBadgeText}>Caregiver</Text>
            </View>
            <Text style={styles.infoText}>
              As a caregiver, you have access to view the mother's pregnancy progress, upcoming appointments, and important health updates. You can provide support and stay informed throughout the pregnancy journey.
            </Text>
            <View style={styles.infoFeatures}>
              <Text style={styles.infoFeatureItem}>✓ View pregnancy milestones</Text>
              <Text style={styles.infoFeatureItem}>✓ Track appointments</Text>
              <Text style={styles.infoFeatureItem}>✓ Receive notifications</Text>
              <Text style={styles.infoFeatureItem}>✓ Share family updates</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Need help? Contact support for any questions about your caregiver account.
          </Text>
        </View>
      </ScrollView>

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
    paddingTop: 25,
    paddingBottom: 24,
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  sosCaregiverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 8,
  },
  sosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  sosCaregiverText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
    fontWeight: '500',
  },
  infoFeatures: {
    gap: 6,
  },
  infoFeatureItem: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Mother Information Card Styles
  motherInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  motherInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  motherAvatarBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  motherNameSection: {
    flex: 1,
  },
  motherNameLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  motherName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  motherStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  motherStatBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  motherStatLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  motherStatValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E11D48',
    marginTop: 4,
  },
  motherDetailsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  motherDetailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  motherDetailLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  motherDetailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  caregiverStepStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  caregiverStepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  caregiverStepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
  caregiverStepValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0D9488',
  },
  routineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routineIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  routineSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  routinePercentBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  routinePercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
  },
  routineProgressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  routineProgressFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  routineTasksList: {
    gap: 8,
  },
  routineTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    gap: 8,
  },
  routineTaskName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  routineTaskNameDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  routineTaskStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  // Caregiver Pairing Card
  pairingCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  pairingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pairingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairingCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9F1239',
  },
  pairingCardSubtitle: {
    fontSize: 11.5,
    color: '#881337',
    marginTop: 2,
    lineHeight: 16,
  },
  pairingInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  pairingInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#FDA4AF',
  },
  pairingSubmitBtn: {
    backgroundColor: '#E11D48',
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pairingSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pairingHelperText: {
    fontSize: 11,
    color: '#9F1239',
    marginTop: 8,
    fontWeight: '500',
  },
  // Urgent Alert Banner
  urgentAlertBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  urgentAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },
  urgentAlertSub: {
    fontSize: 11,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 15,
  },
  urgentAlertAction: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 8,
  },
  urgentAlertActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Live Cloud Sync Tag
  liveDbTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveDbTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  // Live Vitals Quad Strip
  liveVitalsStrip: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  liveVitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
  liveVitalIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveVitalTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveVitalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  liveVitalValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
});

