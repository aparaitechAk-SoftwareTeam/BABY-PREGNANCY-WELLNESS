import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import {
  ChevronLeft,
  Footprints,
  Flame,
  Clock,
  MapPin,
  Play,
  Pause,
  Square,
  Plus,
  Target,
  AlertCircle,
  TrendingUp,
  Info,
  X,
  CheckCircle,
} from 'lucide-react-native';
import { useStepsStore, getTrimesterDefaultGoal } from '../../store/steps.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function MaternalStepsScreen() {
  const router = useRouter();
  const trimester = usePregnancyStore((state) => state.trimester) || 2;
  const currentWeek = usePregnancyStore((state) => state.currentWeek) || 20;

  const todaySteps = useStepsStore((state) => state.todaySteps);
  const stepGoal = useStepsStore((state) => state.stepGoal);
  const distanceKm = useStepsStore((state) => state.distanceKm);
  const activeMinutes = useStepsStore((state) => state.activeMinutes);
  const caloriesKcal = useStepsStore((state) => state.caloriesKcal);
  const weeklyHistory = useStepsStore((state) => state.weeklyHistory);
  const walkingSession = useStepsStore((state) => state.walkingSession);

  const addSteps = useStepsStore((state) => state.addSteps);
  const setDailyGoal = useStepsStore((state) => state.setDailyGoal);
  const startWalkingSession = useStepsStore((state) => state.startWalkingSession);
  const tickWalkingSession = useStepsStore((state) => state.tickWalkingSession);
  const pauseWalkingSession = useStepsStore((state) => state.pauseWalkingSession);
  const finishWalkingSession = useStepsStore((state) => state.finishWalkingSession);
  const loadSteps = useStepsStore((state) => state.loadSteps);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customStepsInput, setCustomStepsInput] = useState('500');

  useEffect(() => {
    loadSteps(trimester);
  }, [loadSteps, trimester]);

  // Session timer ticker
  useEffect(() => {
    let interval: any = null;
    if (walkingSession.isActive) {
      interval = setInterval(() => {
        tickWalkingSession();
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [walkingSession.isActive, tickWalkingSession]);

  const percentage = Math.min(100, Math.round((todaySteps / stepGoal) * 100));

  // Circular Progress Ring Math
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFinishSession = async () => {
    Alert.alert(
      'Finish Walk Session?',
      `Add ${walkingSession.stepsInSession} steps (${walkingSession.distanceKm} km) to your daily total?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save Walk',
          onPress: async () => {
            await finishWalkingSession();
          },
        },
      ]
    );
  };

  const handleAddCustomSteps = async () => {
    const num = parseInt(customStepsInput, 10);
    if (!isNaN(num) && num > 0) {
      await addSteps(num);
      setShowAddModal(false);
      setCustomStepsInput('500');
    } else {
      Alert.alert('Invalid Entry', 'Please enter a valid step number.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Daily Steps & Activity</Text>
          <Text style={styles.headerSubtitle}>
            Week {currentWeek} • Trimester {trimester} Safe Walking
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowGoalModal(true)}
          style={styles.goalTargetBtn}
          activeOpacity={0.8}
        >
          <Target size={18} color="#0D9488" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Main Apple Health-Style Activity Card with SVG Ring */}
        <View style={styles.heroCard}>
          <View style={styles.ringWrapper}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              {/* Background Circle */}
              <Circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress Ring */}
              <Circle
                cx="100"
                cy="100"
                r={radius}
                stroke="#0D9488"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform="rotate(-90 100 100)"
              />
            </Svg>

            {/* Centered Steps Stats */}
            <View style={styles.ringCenterContent}>
              <Footprints size={22} color="#0D9488" strokeWidth={2.5} />
              <Text style={styles.ringStepCount}>{todaySteps.toLocaleString()}</Text>
              <Text style={styles.ringGoalLabel}>Goal: {stepGoal.toLocaleString()}</Text>
              <Text style={styles.ringPercentText}>{percentage}% Completed</Text>
            </View>
          </View>

          {/* 3 Metric Pills below Ring */}
          <View style={styles.metricsPillsRow}>
            <View style={styles.metricCard}>
              <View style={[styles.metricDot, { backgroundColor: '#0284C7' }]} />
              <Text style={styles.metricCardLabel}>Distance</Text>
              <Text style={styles.metricCardVal}>{distanceKm} km</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricDot, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.metricCardLabel}>Active Walk</Text>
              <Text style={styles.metricCardVal}>{activeMinutes} min</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricDot, { backgroundColor: '#EA580C' }]} />
              <Text style={styles.metricCardLabel}>Calories</Text>
              <Text style={styles.metricCardVal}>{caloriesKcal} kcal</Text>
            </View>
          </View>

          {/* Quick Add Buttons */}
          <View style={styles.quickStepChipsRow}>
            <TouchableOpacity
              onPress={() => addSteps(250)}
              style={styles.stepChip}
              activeOpacity={0.75}
            >
              <Text style={styles.stepChipText}>+250 Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => addSteps(500)}
              style={styles.stepChip}
              activeOpacity={0.75}
            >
              <Text style={styles.stepChipText}>+500 Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => addSteps(1000)}
              style={styles.stepChip}
              activeOpacity={0.75}
            >
              <Text style={styles.stepChipText}>+1,000 Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={[styles.stepChip, styles.stepChipCustom]}
              activeOpacity={0.75}
            >
              <Plus size={14} color="#0F766E" />
              <Text style={styles.stepChipText}>Custom</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Live Prenatal Walk Session Recorder */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionHeaderRow}>
            <View>
              <Text style={styles.sessionCardTitle}>Record Prenatal Walk</Text>
              <Text style={styles.sessionCardSub}>Live timer, pace & step ticker</Text>
            </View>
            {walkingSession.isActive && (
              <View style={styles.liveRecordingBadge}>
                <View style={styles.livePulseDot} />
                <Text style={styles.liveRecordingText}>WALKING</Text>
              </View>
            )}
          </View>

          <View style={styles.sessionDisplayRow}>
            <View style={styles.sessionStatCol}>
              <Text style={styles.sessionStatLabel}>SESSION TIME</Text>
              <Text style={styles.sessionStatVal}>
                {formatTimer(walkingSession.elapsedSeconds)}
              </Text>
            </View>

            <View style={styles.sessionStatCol}>
              <Text style={styles.sessionStatLabel}>STEPS RECORDED</Text>
              <Text style={styles.sessionStatVal}>{walkingSession.stepsInSession}</Text>
            </View>

            <View style={styles.sessionStatCol}>
              <Text style={styles.sessionStatLabel}>DISTANCE</Text>
              <Text style={styles.sessionStatVal}>{walkingSession.distanceKm} km</Text>
            </View>
          </View>

          {/* Session Controls */}
          <View style={styles.sessionControlsRow}>
            {!walkingSession.isActive && walkingSession.elapsedSeconds === 0 ? (
              <TouchableOpacity
                onPress={startWalkingSession}
                style={styles.startSessionBtn}
                activeOpacity={0.8}
              >
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.startSessionText}>Start Prenatal Walk</Text>
              </TouchableOpacity>
            ) : walkingSession.isActive ? (
              <>
                <TouchableOpacity
                  onPress={pauseWalkingSession}
                  style={styles.pauseSessionBtn}
                  activeOpacity={0.8}
                >
                  <Pause size={18} color="#0F172A" />
                  <Text style={styles.pauseSessionText}>Pause</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFinishSession}
                  style={styles.finishSessionBtn}
                  activeOpacity={0.8}
                >
                  <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.finishSessionText}>Finish & Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => startWalkingSession()}
                  style={styles.resumeSessionBtn}
                  activeOpacity={0.8}
                >
                  <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.resumeSessionText}>Resume</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleFinishSession}
                  style={styles.finishSessionBtn}
                  activeOpacity={0.8}
                >
                  <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.finishSessionText}>Finish & Save</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* 3. 7-Day Weekly History Bar Chart */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.historyTitle}>Weekly Walking Trends</Text>
              <Text style={styles.historySub}>Past 7 days activity vs goal</Text>
            </View>
            <View style={styles.avgBadge}>
              <TrendingUp size={14} color="#0D9488" />
              <Text style={styles.avgBadgeText}>4,800 Avg</Text>
            </View>
          </View>

          {/* SVG Bar Chart */}
          <View style={styles.chartWrapper}>
            <Svg width="100%" height={160} viewBox="0 0 320 160">
              {/* Target Goal Dotted Line */}
              <Line
                x1="20"
                y1="50"
                x2="300"
                y2="50"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <SvgText x="20" y="42" fill="#64748B" fontSize="10" fontWeight="600">
                Goal: {stepGoal}
              </SvgText>

              {/* Day Bars */}
              {weeklyHistory.map((item, index) => {
                const barWidth = 24;
                const spacing = 38;
                const x = 30 + index * spacing;
                const maxSteps = 7000;
                const barHeight = Math.min(100, Math.max(10, (item.steps / maxSteps) * 100));
                const y = 140 - barHeight;
                const isToday = index === weeklyHistory.length - 1;
                const fillColor = isToday ? '#0D9488' : item.isGoalMet ? '#10B981' : '#CBD5E1';

                return (
                  <React.Fragment key={item.date}>
                    <Rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx={6}
                      fill={fillColor}
                    />
                    <SvgText
                      x={x + barWidth / 2}
                      y="155"
                      fill={isToday ? '#0D9488' : '#64748B'}
                      fontSize="11"
                      fontWeight={isToday ? '800' : '600'}
                      textAnchor="middle"
                    >
                      {item.dayLabel}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>

          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Goal Met</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#CBD5E1' }]} />
              <Text style={styles.legendText}>In Progress</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendBox, { backgroundColor: '#0D9488' }]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>

        {/* 4. ACOG Maternal Walking Guidelines & Safety Red Flags */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <AlertCircle size={20} color="#DC2626" />
            <Text style={styles.safetyCardTitle}>Obstetric Safety Rules for Walking</Text>
          </View>

          <View style={styles.safetyPointsList}>
            <Text style={styles.safetyPoint}>
              💧 <Text style={styles.boldText}>Hydrate Every 15 Mins:</Text> Dehydration triggers false Braxton-Hicks contractions. Drink 250ml water before and after every walk.
            </Text>
            <Text style={styles.safetyPoint}>
              👟 <Text style={styles.boldText}>Supportive Footwear:</Text> Relaxin hormones loosen pelvic and ankle ligaments. Wear cushioned athletic shoes.
            </Text>
            <Text style={styles.safetyPoint}>
              🗣️ <Text style={styles.boldText}>The "Talk Test":</Text> You should be able to maintain a conversation while walking without gasping for breath.
            </Text>
          </View>

          <View style={styles.redFlagsBox}>
            <Text style={styles.redFlagsTitle}>🚨 STOP WALKING IMMEDIATELY IF YOU FEEL:</Text>
            <Text style={styles.redFlagsItem}>• Vaginal bleeding or fluid leakage</Text>
            <Text style={styles.redFlagsItem}>• Regular, painful uterine contractions</Text>
            <Text style={styles.redFlagsItem}>• Dizziness, chest pain, or calf swelling & pain</Text>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================
          CHANGE DAILY GOAL MODAL
          ======================================================== */}
      <Modal visible={showGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Trimester Step Goal</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Choose a goal tailored to your comfort and doctor recommendations for Week {currentWeek}.
            </Text>

            <View style={styles.goalOptionsList}>
              {[
                { label: 'Gentle (Trimester 3 / Rest)', steps: 3500 },
                { label: 'Moderate (ACOG Standard)', steps: 5000 },
                { label: 'Active (Trimester 2 Energy)', steps: 6500 },
                { label: 'High Activity', steps: 8000 },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.steps}
                  onPress={() => {
                    setDailyGoal(opt.steps);
                    setShowGoalModal(false);
                  }}
                  style={[
                    styles.goalOptionBtn,
                    stepGoal === opt.steps && styles.goalOptionBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text
                      style={[
                        styles.goalOptionText,
                        stepGoal === opt.steps && styles.goalOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={styles.goalOptionSub}>{opt.steps.toLocaleString()} steps/day</Text>
                  </View>
                  {stepGoal === opt.steps && (
                    <CheckCircle size={20} color="#0D9488" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          CUSTOM STEPS ENTRY MODAL
          ======================================================== */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Steps Manually</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Enter steps completed on treadmill, outdoor stroll, or fitness band sync.
            </Text>

            <TextInput
              style={styles.customStepInput}
              keyboardType="numeric"
              value={customStepsInput}
              onChangeText={setCustomStepsInput}
              placeholder="e.g. 1200"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity
              onPress={handleAddCustomSteps}
              style={styles.saveCustomStepsBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.saveCustomStepsText}>Add to Today's Steps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  goalTargetBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
        elevation: 2,
      },
    }),
  },
  ringWrapper: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  ringCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringStepCount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  ringGoalLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  ringPercentText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0D9488',
    marginTop: 2,
  },
  metricsPillsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 18,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  metricCardLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
  },
  metricCardVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  quickStepChipsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  stepChipCustom: {
    backgroundColor: '#FFFFFF',
    borderColor: '#99F6E4',
  },
  stepChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sessionCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sessionCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  liveRecordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
  },
  liveRecordingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.5,
  },
  sessionDisplayRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sessionStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  sessionStatLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sessionStatVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sessionControlsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  startSessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 13,
    borderRadius: 14,
  },
  startSessionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pauseSessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
  },
  pauseSessionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  resumeSessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 13,
    borderRadius: 14,
  },
  resumeSessionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  finishSessionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 14,
  },
  finishSessionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  historySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avgBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  safetyCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 20,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  safetyCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#9F1239',
  },
  safetyPointsList: {
    gap: 8,
    marginBottom: 12,
  },
  safetyPoint: {
    fontSize: 12,
    lineHeight: 17,
    color: '#4C0519',
  },
  boldText: {
    fontWeight: '700',
  },
  redFlagsBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E11D48',
  },
  redFlagsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE123C',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  redFlagsItem: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  goalOptionsList: {
    gap: 10,
    marginBottom: 10,
  },
  goalOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalOptionBtnActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  goalOptionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  goalOptionTextActive: {
    color: '#0D9488',
  },
  goalOptionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  customStepInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  saveCustomStepsBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveCustomStepsText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
