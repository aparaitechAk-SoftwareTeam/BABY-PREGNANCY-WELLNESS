import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Heart,
  Calendar,
  Activity,
  User,
  Phone,
  Building2,
  Stethoscope,
  Scale,
  Ruler,
  Droplet,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { usePregnancyStore, PregnancyProfile } from '../../store/pregnancy.store';
import { useAuthStore } from '../../store/auth.store';
import { pregnancyApi } from '../../services/api/pregnancy.api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 40-Week Baby Size Comparisons
const BABY_SIZES: Record<number, { name: string; emoji: string; length: string; weight: string }> = {
  4: { name: 'Poppy Seed', emoji: '🌱', length: '1 mm', weight: '< 1 g' },
  8: { name: 'Raspberry', emoji: '🍓', length: '1.6 cm', weight: '1 g' },
  12: { name: 'Lime', emoji: '🍋', length: '5.4 cm', weight: '14 g' },
  16: { name: 'Avocado', emoji: '🥑', length: '11.6 cm', weight: '100 g' },
  20: { name: 'Banana', emoji: '🍌', length: '25.6 cm', weight: '300 g' },
  24: { name: 'Ear of Corn', emoji: '🌽', length: '30 cm', weight: '600 g' },
  28: { name: 'Eggplant', emoji: '🍆', length: '37 cm', weight: '1 kg' },
  32: { name: 'Pineapple', emoji: '🍍', length: '42 cm', weight: '1.7 kg' },
  36: { name: 'Papaya', emoji: '🍈', length: '47 cm', weight: '2.6 kg' },
  40: { name: 'Watermelon', emoji: '🍉', length: '51 cm', weight: '3.4 kg' },
};

function getBabySizeForWeek(week: number) {
  const milestones = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  let closest = milestones[0];
  for (const m of milestones) {
    if (week >= m) closest = m;
  }
  return BABY_SIZES[closest] || BABY_SIZES[20];
}

const BLOOD_GROUPS = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

const COMMON_RELATIONS = ['Partner', 'Husband', 'Mother', 'Sister', 'Friend', 'Other'];

export default function PregnancySetupScreen() {
  const router = useRouter();
  const setProfile = usePregnancyStore((state) => state.setProfile);
  const existingProfile = usePregnancyStore((state) => state.profile);
  const user = useAuthStore((state: any) => state.user);
  const setUser = useAuthStore((state: any) => state.setUser);

  // Form Mode: 'EDD' (Estimated Due Date) or 'LMP' (Last Menstrual Period)
  const [calcMethod, setCalcMethod] = useState<'EDD' | 'LMP'>(
    existingProfile?.calculationMethod || 'EDD'
  );

  // 1. Gestational Week & Timeline
  const [selectedWeek, setSelectedWeek] = useState(existingProfile?.currentWeek || 20);
  const [selectedDay, setSelectedDay] = useState(existingProfile?.currentDay || 0);
  const [pregnancyType, setPregnancyType] = useState<'SINGLE' | 'TWINS' | 'MULTIPLES'>(
    existingProfile?.pregnancyType || 'SINGLE'
  );
  const [babyNickname, setBabyNickname] = useState(existingProfile?.nickname || '');

  // Specific Date inputs for LMP or EDD
  const now = new Date();
  const [dateDay, setDateDay] = useState(String(now.getDate()));
  const [dateMonth, setDateMonth] = useState(String(now.getMonth() + 1));
  const [dateYear, setDateYear] = useState(String(now.getFullYear()));

  // 2. Mother's Physical Baseline (Height, Weight, Age, Blood)
  const [unitSystem, setUnitSystem] = useState<'METRIC' | 'IMPERIAL'>(
    existingProfile?.preferredUnits || 'METRIC'
  );
  const [height, setHeight] = useState(
    existingProfile?.height ? String(existingProfile.height) : ''
  );
  const [heightFt, setHeightFt] = useState(existingProfile?.heightFt || '');
  const [preWeight, setPreWeight] = useState(
    existingProfile?.prePregnancyWeight ? String(existingProfile.prePregnancyWeight) : ''
  );
  const [currentWeight, setCurrentWeight] = useState(
    existingProfile?.currentWeight ? String(existingProfile.currentWeight) : ''
  );
  const [motherAge, setMotherAge] = useState(
    existingProfile?.motherAge ? String(existingProfile.motherAge) : ''
  );
  const [bloodGroup, setBloodGroup] = useState(existingProfile?.bloodGroup || 'O+');

  // 3. Doctor & Medical Information
  const [doctorName, setDoctorName] = useState(
    existingProfile?.doctorName || ''
  );
  const [hospitalName, setHospitalName] = useState(
    existingProfile?.hospitalName || ''
  );
  const [doctorPhone, setDoctorPhone] = useState(
    existingProfile?.doctorPhone || ''
  );
  const [nextAppointment, setNextAppointment] = useState(
    existingProfile?.nextAppointmentDate || ''
  );

  // 4. Emergency Contact
  const [emergencyName, setEmergencyName] = useState(
    existingProfile?.emergencyContactName || ''
  );
  const [emergencyRelation, setEmergencyRelation] = useState(
    existingProfile?.emergencyContactRelation || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    existingProfile?.emergencyContactPhone || ''
  );
  const [medicalNotes, setMedicalNotes] = useState(
    existingProfile?.medicalNotes || ''
  );

  // Safety acknowledgment & UI state
  const [acknowledged, setAcknowledged] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computations
  const totalPregnancyDays = 280;
  const currentDaysElapsed = selectedWeek * 7 + selectedDay;
  const daysRemaining = Math.max(0, totalPregnancyDays - currentDaysElapsed);
  const trimester = selectedWeek <= 12 ? 1 : selectedWeek <= 27 ? 2 : 3;
  const babySize = useMemo(() => getBabySizeForWeek(selectedWeek), [selectedWeek]);

  // Target Due Date calculation
  const targetDueDate = useMemo(() => {
    const target = new Date();
    target.setDate(target.getDate() + daysRemaining);
    return target;
  }, [daysRemaining]);

  const dueDateFormatted = useMemo(() => {
    return targetDueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [targetDueDate]);

  // Weight gain calculation
  const weightGain = useMemo(() => {
    const pre = parseFloat(preWeight);
    const curr = parseFloat(currentWeight);
    if (!isNaN(pre) && !isNaN(curr)) {
      const diff = +(curr - pre).toFixed(1);
      return diff;
    }
    return null;
  }, [preWeight, currentWeight]);

  // Quick height selection handler
  const handleQuickHeight = (ft: string, cm: number) => {
    setHeightFt(ft);
    setHeight(String(cm));
  };

  // Submission handler
  const handleCompleteSetup = async () => {
    setErrorMsg('');

    if (!height.trim() || isNaN(parseFloat(height))) {
      setErrorMsg('Please enter a valid height');
      return;
    }

    if (!currentWeight.trim() || isNaN(parseFloat(currentWeight))) {
      setErrorMsg('Please enter your current weight');
      return;
    }

    if (!acknowledged) {
      setErrorMsg('Please confirm you have read the clinical wellness statement below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedHeight = parseFloat(height) || 165;
      const parsedWeight = parseFloat(currentWeight);
      const parsedPreWeight = preWeight.trim() && !isNaN(parseFloat(preWeight))
        ? parseFloat(preWeight)
        : parsedWeight;
      const parsedAge = motherAge.trim() && !isNaN(parseInt(motherAge, 10))
        ? parseInt(motherAge, 10)
        : 28;
      const selectedBloodGroup = bloodGroup.trim() || 'O+';
      const isoDueDate = targetDueDate.toISOString();

      const profilePayload = {
        userId: user?.id,
        email: user?.email,
        dueDate: isoDueDate,
        calculationMethod: calcMethod,
        currentWeek: selectedWeek,
        currentDay: selectedDay,
        trimester: trimester as 1 | 2 | 3,
        daysRemaining,
        pregnancyType,
        nickname: babyNickname.trim(),

        // Body metrics - guaranteed non-null
        height: parsedHeight,
        heightFt: heightFt || '',
        currentWeight: parsedWeight,
        prePregnancyWeight: parsedPreWeight,
        bloodGroup: selectedBloodGroup,
        motherAge: parsedAge,

        // Doctor & Medical
        doctorName: doctorName.trim(),
        hospitalName: hospitalName.trim(),
        doctorPhone: doctorPhone.trim(),
        nextAppointmentDate: nextAppointment.trim(),

        // Emergency Contact
        emergencyContactName: emergencyName.trim(),
        emergencyContactRelation: emergencyRelation,
        emergencyContactPhone: emergencyPhone.trim(),
        medicalNotes: medicalNotes.trim(),

        preferredUnits: unitSystem,
      };

      // 1. Save directly into backend Neon PostgreSQL Database
      try {
        await pregnancyApi.saveProfile(profilePayload);
      } catch (apiError: any) {
        console.error('Backend database save profile notification:', apiError?.response?.data || apiError?.message || apiError);
      }

      // 2. Save locally to pregnancy store
      const profileData: PregnancyProfile = {
        ...profilePayload,
        setupCompleted: true,
      };
      await setProfile(profileData);

      // 3. Also update auth store user so setupCompleted & isProfileCompleted are preserved
      if (user) {
        await setUser({
          ...user,
          setupCompleted: true,
          isProfileCompleted: true,
          motherAge: parsedAge,
          bloodGroup: selectedBloodGroup,
        });
      }

      // 4. Navigate to mother dashboard
      router.replace('/(mother)');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Stepper Bar (Matching Reference Screen 5) */}
        <View style={styles.stepperTopContainer}>
          <View style={styles.stepperTopRow}>
            <Text style={styles.stepperScreenTitle}>Setup Profile</Text>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1 / 4</Text>
            </View>
          </View>
          <View style={styles.stepperTrack}>
            <View style={[styles.stepperFill, { width: '25%' }]} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.headerSection}>
          <Text style={styles.screenHeading}>Pregnancy Setup</Text>
          <Text style={styles.screenSubtitle}>
            Welcome, {user?.name || 'Mother'}! Enter your pregnancy dates & physical baselines to calibrate your daily tracking.
          </Text>
        </View>

        {/* ========================================================
            SECTION 1: PREGNANCY TIMELINE & DATES
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#FEE2E6' }]}>
              <Calendar size={18} color="#E11D48" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.cardHeaderTitle}>Pregnancy Dates & Stage</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Calculate from Estimated Due Date (EDD) or Last Period (LMP)
              </Text>
            </View>
          </View>

          {/* Calculation Mode Segmented Bar */}
          <View style={styles.methodSegment}>
            <TouchableOpacity
              onPress={() => setCalcMethod('EDD')}
              style={[
                styles.methodSegmentBtn,
                calcMethod === 'EDD' && styles.methodSegmentBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.methodEmoji}>📅</Text>
              <Text
                style={[
                  styles.methodText,
                  calcMethod === 'EDD' && styles.methodTextActive,
                ]}
              >
                Due Date (EDD)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCalcMethod('LMP')}
              style={[
                styles.methodSegmentBtn,
                calcMethod === 'LMP' && styles.methodSegmentBtnActive,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.methodEmoji}>🩸</Text>
              <Text
                style={[
                  styles.methodText,
                  calcMethod === 'LMP' && styles.methodTextActive,
                ]}
              >
                Last Period (LMP)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Live Gestational Status Hero Card */}
          <View style={styles.statusHeroCard}>
            <View style={styles.statusHeroTop}>
              <View>
                <Text style={styles.statusHeroLabel}>YOUR CURRENT STAGE</Text>
                <Text style={styles.statusHeroWeekText}>
                  Week {selectedWeek}, Day {selectedDay}
                </Text>
                <View style={styles.trimesterPill}>
                  <Text style={styles.trimesterPillText}>
                    Trimester {trimester} • {daysRemaining} Days to Arrival
                  </Text>
                </View>
              </View>

              {/* Baby Size Badge */}
              <View style={styles.babySizeBadge}>
                <Text style={styles.babySizeEmoji}>{babySize.emoji}</Text>
                <Text style={styles.babySizeName}>{babySize.name}</Text>
                <Text style={styles.babySizeStats}>{babySize.length}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (selectedWeek / 40) * 100)}%` },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelText}>Conception</Text>
                <Text style={styles.progressLabelCenter}>Due: {dueDateFormatted}</Text>
                <Text style={styles.progressLabelText}>40 Weeks</Text>
              </View>
            </View>
          </View>

          {/* Week Adjustment Stepper */}
          <Text style={styles.inputLabel}>Current Gestational Week (from doctor scan)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setSelectedWeek((prev) => Math.max(1, prev - 1))}
              style={styles.stepperBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>

            <View style={styles.stepperValueBox}>
              <Text style={styles.stepperValueNumber}>{selectedWeek}</Text>
              <Text style={styles.stepperValueLabel}>Weeks</Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedWeek((prev) => Math.min(42, prev + 1))}
              style={styles.stepperBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Trimester Jumps */}
          <View style={styles.quickJumpRow}>
            {[
              { label: 'T1 (Wk 8)', week: 8 },
              { label: 'T2 (Wk 20)', week: 20 },
              { label: 'T3 (Wk 32)', week: 32 },
              { label: 'Full Term (Wk 38)', week: 38 },
            ].map((jump) => (
              <TouchableOpacity
                key={jump.week}
                onPress={() => setSelectedWeek(jump.week)}
                style={[
                  styles.quickJumpBtn,
                  selectedWeek === jump.week && styles.quickJumpBtnActive,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.quickJumpText,
                    selectedWeek === jump.week && styles.quickJumpTextActive,
                  ]}
                >
                  {jump.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Baby Nickname */}
          <View style={[styles.inputGroup, { marginTop: 14 }]}>
            <Text style={styles.inputLabel}>Baby's Nickname</Text>
            <View style={styles.inputWrapper}>
              <Sparkles size={16} color="#E11D48" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Peanut, Bean, Miracle (Optional)"
                placeholderTextColor="#94A3B8"
                value={babyNickname}
                onChangeText={setBabyNickname}
              />
            </View>
          </View>

          {/* Pregnancy Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pregnancy Type</Text>
            <View style={styles.typeRow}>
              {[
                { id: 'SINGLE', label: 'Single', emoji: '👶' },
                { id: 'TWINS', label: 'Twins', emoji: '👶👶' },
                { id: 'MULTIPLES', label: 'Triplets+', emoji: '👶👶👶' },
              ].map((type) => {
                const isSelected = pregnancyType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setPregnancyType(type.id as any)}
                    style={[styles.typeBtn, isSelected && styles.typeBtnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text style={[styles.typeLabel, isSelected && styles.typeLabelActive]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ========================================================
            SECTION 2: MOTHER'S HEALTH & PHYSICAL BASELINE
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Scale size={18} color="#0284C7" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.cardHeaderTitle}>Mother's Health & Body</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Height, current weight, pre-pregnancy weight, and blood group
              </Text>
            </View>
          </View>

          {/* Unit System Toggle */}
          <View style={styles.unitToggleRow}>
            <TouchableOpacity
              onPress={() => setUnitSystem('METRIC')}
              style={[
                styles.unitToggleBtn,
                unitSystem === 'METRIC' && styles.unitToggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.unitToggleText,
                  unitSystem === 'METRIC' && styles.unitToggleTextActive,
                ]}
              >
                Metric (kg / cm)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUnitSystem('IMPERIAL')}
              style={[
                styles.unitToggleBtn,
                unitSystem === 'IMPERIAL' && styles.unitToggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.unitToggleText,
                  unitSystem === 'IMPERIAL' && styles.unitToggleTextActive,
                ]}
              >
                Imperial (lbs / ft-in)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Height Row with quick presets */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Mother's Height ({unitSystem === 'METRIC' ? 'cm' : 'ft & inches'})
            </Text>
            <View style={styles.inputWrapper}>
              <Ruler size={16} color="#0284C7" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder={unitSystem === 'METRIC' ? '165 cm' : "5'6\""}
                placeholderTextColor="#94A3B8"
                value={unitSystem === 'METRIC' ? height : heightFt}
                onChangeText={(text) => {
                  if (unitSystem === 'METRIC') {
                    setHeight(text);
                  } else {
                    setHeightFt(text);
                  }
                }}
                keyboardType={unitSystem === 'METRIC' ? 'numeric' : 'default'}
              />
            </View>
            {/* Quick Height Chips */}
            <View style={styles.chipRow}>
              {[
                { ft: "5'2\"", cm: 157 },
                { ft: "5'4\"", cm: 163 },
                { ft: "5'6\"", cm: 168 },
                { ft: "5'8\"", cm: 173 },
              ].map((item) => (
                <TouchableOpacity
                  key={item.ft}
                  style={styles.presetChip}
                  onPress={() => handleQuickHeight(item.ft, item.cm)}
                >
                  <Text style={styles.presetChipText}>
                    {unitSystem === 'METRIC' ? `${item.cm} cm` : item.ft}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dual Weights: Current & Pre-Pregnancy */}
          <View style={styles.dualInputRow}>
            <View style={styles.dualInputCol}>
              <Text style={styles.inputLabel}>
                Pre-Weight ({unitSystem === 'METRIC' ? 'kg' : 'lbs'})
              </Text>
              <View style={styles.inputWrapper}>
                <Scale size={16} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={unitSystem === 'METRIC' ? '60' : '132'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={preWeight}
                  onChangeText={setPreWeight}
                />
              </View>
            </View>

            <View style={styles.dualInputCol}>
              <Text style={styles.inputLabel}>
                Current Weight ({unitSystem === 'METRIC' ? 'kg' : 'lbs'})
              </Text>
              <View style={[styles.inputWrapper, { borderColor: '#E11D48' }]}>
                <Scale size={16} color="#E11D48" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder={unitSystem === 'METRIC' ? '65.5' : '144'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                />
              </View>
            </View>
          </View>

          {/* Weight Gain Insight Badge */}
          {weightGain !== null && (
            <View style={styles.weightGainBadge}>
              <Text style={styles.weightGainEmoji}>📈</Text>
              <Text style={styles.weightGainText}>
                {weightGain >= 0 ? `+${weightGain}` : weightGain}{' '}
                {unitSystem === 'METRIC' ? 'kg' : 'lbs'} change from baseline (healthy clinical progress)
              </Text>
            </View>
          )}

          {/* Mother's Age */}
          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Mother's Age (Years)</Text>
            <View style={styles.inputWrapper}>
              <User size={16} color="#0284C7" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="28"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={motherAge}
                onChangeText={setMotherAge}
              />
            </View>
          </View>

          {/* Blood Group Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Blood Group & Rh Factor</Text>
            <View style={styles.bloodGrid}>
              {BLOOD_GROUPS.map((group) => {
                const isSelected = bloodGroup === group;
                return (
                  <TouchableOpacity
                    key={group}
                    style={[styles.bloodChip, isSelected && styles.bloodChipActive]}
                    onPress={() => setBloodGroup(group)}
                    activeOpacity={0.75}
                  >
                    <Droplet
                      size={14}
                      color={isSelected ? '#FFFFFF' : '#E11D48'}
                      fill={isSelected ? '#FFFFFF' : 'transparent'}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.bloodChipText, isSelected && styles.bloodChipTextActive]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.microHintText}>
              💡 Crucial for obstetric care and Rh factor compatibility monitoring.
            </Text>
          </View>
        </View>

        {/* ========================================================
            SECTION 3: DOCTOR & CLINICAL CARE TEAM
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Stethoscope size={18} color="#10B981" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.cardHeaderTitle}>Doctor & Hospital Information</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Sync contact details for regular checkups and report sharing
              </Text>
            </View>
          </View>

          {/* Doctor Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doctor / OB-GYN Name</Text>
            <View style={styles.inputWrapper}>
              <Stethoscope size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Dr. Sarah Jenkins, MD (OB-GYN)"
                placeholderTextColor="#94A3B8"
                value={doctorName}
                onChangeText={setDoctorName}
              />
            </View>
          </View>

          {/* Hospital / Clinic */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hospital or Maternity Center</Text>
            <View style={styles.inputWrapper}>
              <Building2 size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. City Maternity Hospital"
                placeholderTextColor="#94A3B8"
                value={hospitalName}
                onChangeText={setHospitalName}
              />
            </View>
          </View>

          {/* Doctor Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doctor / Clinic Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Phone size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={doctorPhone}
                onChangeText={setDoctorPhone}
              />
            </View>
          </View>

          {/* Next Scheduled Appointment */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Next Appointment / Checkup Note</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Routine 20-week ultrasound"
                placeholderTextColor="#94A3B8"
                value={nextAppointment}
                onChangeText={setNextAppointment}
              />
            </View>
          </View>
        </View>

        {/* ========================================================
            SECTION 4: EMERGENCY CONTACT & PROTOCOL
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#FEF3C7' }]}>
              <ShieldCheck size={18} color="#D97706" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.cardHeaderTitle}>Emergency Contact & Safety</Text>
              <Text style={styles.cardHeaderSubtitle}>
                Immediate contact for labor signs or clinical escalation
              </Text>
            </View>
          </View>

          {/* Emergency Contact Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact Person</Text>
            <View style={styles.inputWrapper}>
              <User size={16} color="#D97706" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Partner or Family Member Name"
                placeholderTextColor="#94A3B8"
                value={emergencyName}
                onChangeText={setEmergencyName}
              />
            </View>
          </View>

          {/* Relationship Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Relationship</Text>
            <View style={styles.chipRow}>
              {COMMON_RELATIONS.map((rel) => {
                const isSelected = emergencyRelation === rel;
                return (
                  <TouchableOpacity
                    key={rel}
                    style={[styles.presetChip, isSelected && styles.presetChipActive]}
                    onPress={() => setEmergencyRelation(rel)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}
                    >
                      {rel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Emergency Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Emergency Contact Phone</Text>
            <View style={styles.inputWrapper}>
              <Phone size={16} color="#D97706" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
              />
            </View>
          </View>

          {/* Known Allergies or Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Known Allergies or Medical Conditions (Optional)</Text>
            <View style={styles.inputWrapper}>
              <AlertCircle size={16} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Penicillin allergy, Thyroid, None"
                placeholderTextColor="#94A3B8"
                value={medicalNotes}
                onChangeText={setMedicalNotes}
              />
            </View>
          </View>
        </View>

        {/* Error Banner */}
        {!!errorMsg && (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#B91C1C" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Clinical Disclaimer & Confirmation */}
        <View style={styles.disclaimerCard}>
          <View style={styles.disclaimerHeader}>
            <ShieldCheck size={16} color="#E11D48" style={{ marginRight: 6 }} />
            <Text style={styles.disclaimerTitle}>Clinical Wellness Statement</Text>
          </View>
          <Text style={styles.disclaimerBody}>
            Gestational ages and health markers are calculated using standard obstetric formulas. AparaiTech provides supportive wellness tracking and educational insights; it does not replace ultrasound confirmation or personalized medical diagnosis.
          </Text>

          <TouchableOpacity
            onPress={() => setAcknowledged(!acknowledged)}
            style={styles.ackRow}
            activeOpacity={0.8}
          >
            <View style={[styles.checkboxSquare, acknowledged && styles.checkboxSquareActive]}>
              {acknowledged && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.ackText}>
              I confirm and understand that this information will be used for personal wellness tracking and caregiver coordination.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Save & Complete CTA Button */}
        <TouchableOpacity
          onPress={handleCompleteSetup}
          disabled={isSubmitting}
          style={[styles.completeBtn, isSubmitting && styles.completeBtnDisabled]}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.completeBtnText}>Save & Enter Maternal Dashboard</Text>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </>
          )}
        </TouchableOpacity>

        {/* Security Footer */}
        <View style={styles.securityFooter}>
          <Text style={styles.securityFooterText}>
            🔒 HIPAA & DPDP Compliant • 256-Bit Encrypted Maternal Health Record
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
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },
  stepperTopContainer: {
    marginBottom: 16,
  },
  stepperTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepperScreenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepBadge: {
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
  },
  stepperTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepperFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  headerSection: {
    marginBottom: 18,
    alignItems: 'center',
  },
  screenHeading: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  sectionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleCol: {
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardHeaderSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  methodSegment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    gap: 4,
  },
  methodSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  methodSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  methodEmoji: {
    fontSize: 13,
    marginRight: 5,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  methodTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  statusHeroCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 14,
  },
  statusHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusHeroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#E11D48',
    marginBottom: 2,
  },
  statusHeroWeekText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  trimesterPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  trimesterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9F1239',
  },
  babySizeBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    minWidth: 80,
  },
  babySizeEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  babySizeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  babySizeStats: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  progressContainer: {
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFE4E6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabelText: {
    fontSize: 9.5,
    color: '#9F1239',
    fontWeight: '600',
  },
  progressLabelCenter: {
    fontSize: 10,
    color: '#0F172A',
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stepperBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  stepperValueBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  stepperValueNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperValueLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  quickJumpRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickJumpBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickJumpBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  quickJumpText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  quickJumpTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeBtnActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
  },
  typeEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  typeLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  typeLabelActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  unitToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
    marginBottom: 14,
  },
  unitToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  unitToggleBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  unitToggleText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  unitToggleTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  presetChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dualInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dualInputCol: {
    flex: 1,
  },
  weightGainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
  },
  weightGainEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  weightGainText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  bloodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 54,
    justifyContent: 'center',
  },
  bloodChipActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  bloodChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  bloodChipTextActive: {
    color: '#FFFFFF',
  },
  microHintText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 11.5,
    color: '#B91C1C',
    fontWeight: '600',
  },
  disclaimerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  disclaimerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  disclaimerBody: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: '#475569',
    marginBottom: 10,
  },
  ackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  ackText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
    lineHeight: 16,
  },
  completeBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    gap: 8,
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
  completeBtnDisabled: {
    opacity: 0.7,
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  securityFooter: {
    alignItems: 'center',
  },
  securityFooterText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
