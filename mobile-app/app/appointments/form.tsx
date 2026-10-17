import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  Building2,
  Phone,
  Bell,
  Check,
  ChevronLeft,
  Sparkles,
  FileText,
  AlertCircle,
} from 'lucide-react-native';
import { useAppointmentStore, AppointmentType } from '../../store/appointment.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

const APPOINTMENT_TYPES: { id: AppointmentType; label: string; icon: string }[] = [
  { id: 'Routine', label: 'Routine Visit', icon: '🩺' },
  { id: 'Scan', label: 'Ultrasound Scan', icon: '📷' },
  { id: 'Lab', label: 'Lab & Blood Test', icon: '🧪' },
  { id: 'Consultation', label: 'Doctor Consult', icon: '👩‍⚕️' },
  { id: 'Nutrition', label: 'Diet & Nutrition', icon: '🥗' },
];

const COMMON_TITLES = [
  'Routine Prenatal Checkup',
  'Level-II Anomaly Ultrasound Scan',
  'Gestational Glucose Screening (GTT)',
  'Growth & Doppler Scan',
  'Third Trimester Checkup',
  'Doctor Consultation',
];

const TIME_PRESETS = ['09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '04:30 PM', '06:00 PM'];

const COMMON_QUESTIONS = [
  'Placenta position & amniotic fluid level?',
  'Safe sleeping & exercise guidelines?',
  'Remedies for nausea / acid reflux?',
  'Is fetal movement frequency normal?',
  'Hospital bag & admission checklist?',
];

export default function AppointmentFormScreen() {
  const router = useRouter();
  const addAppointment = useAppointmentStore((state) => state.addAppointment);
  const pregnancyProfile = usePregnancyStore((state) => state.profile);

  // Default values pulled from mother's onboarding profile
  const defaultDoctor = pregnancyProfile?.doctorName || '';
  const defaultHospital = pregnancyProfile?.hospitalName || '';
  const defaultPhone = pregnancyProfile?.doctorPhone || '';

  // Form states
  const [title, setTitle] = useState('Routine Prenatal Checkup');
  const [selectedType, setSelectedType] = useState<AppointmentType>('Routine');
  const [doctorName, setDoctorName] = useState(defaultDoctor);
  const [hospitalName, setHospitalName] = useState(defaultHospital);
  const [doctorPhone, setDoctorPhone] = useState(defaultPhone);

  // Date selection states
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [dateStr, setDateStr] = useState(
    tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [timeStr, setTimeStr] = useState('10:30 AM');
  const [notes, setNotes] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTiming, setReminderTiming] = useState<'1_DAY_BEFORE' | '2_HOURS_BEFORE' | 'BOTH'>('BOTH');

  // Handle adding pre-written question
  const toggleQuestion = (q: string) => {
    if (questions.includes(q)) {
      setQuestions(questions.filter((item) => item !== q));
    } else {
      setQuestions([...questions, q]);
    }
  };

  // Quick Date Shortcut
  const handleDateShortcut = (daysFromNow: number) => {
    const d = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
    setDateStr(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  };

  // Reset to Mother's primary doctor & hospital
  const handleResetToPrimary = () => {
    setDoctorName(defaultDoctor);
    setHospitalName(defaultHospital);
    setDoctorPhone(defaultPhone);
  };

  // Save handler
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter an appointment title');
      return;
    }

    if (!doctorName.trim()) {
      Alert.alert('Missing Field', 'Please enter a doctor name');
      return;
    }

    if (!hospitalName.trim()) {
      Alert.alert('Missing Field', 'Please enter the hospital or clinic name');
      return;
    }

    await addAppointment({
      title: title.trim(),
      type: selectedType,
      doctorName: doctorName.trim(),
      hospitalName: hospitalName.trim(),
      doctorPhone: doctorPhone.trim(),
      dateStr: dateStr.trim(),
      timeStr: timeStr.trim(),
      notes: notes.trim(),
      questionsForDoctor: questions,
      reminderEnabled,
      reminderTiming,
    });

    Alert.alert('Appointment Saved! 📅', 'Your clinic visit and reminders have been scheduled.', [
      { text: 'View Schedule', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Add Clinical Appointment</Text>
          <Text style={styles.headerSubtitle}>Schedule visits and configure reminders</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            CARD 1: DOCTOR & HOSPITAL PRE-FILLED BANNER
            ======================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Stethoscope size={18} color="#10B981" strokeWidth={2.4} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Doctor & Hospital Details</Text>
              <Text style={styles.cardSubtitle}>
                Auto-filled from your registered healthcare profile
              </Text>
            </View>
          </View>

          {/* Primary Doctor Synced Badge */}
          <View style={styles.doctorSyncBadge}>
            <Sparkles size={14} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.doctorSyncText}>
              Pre-filled with your registered OB-GYN & hospital
            </Text>
          </View>

          {/* Doctor Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Doctor / Specialist Name</Text>
            <View style={styles.inputWrapper}>
              <User size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Dr. Priya Sharma"
                placeholderTextColor="#94A3B8"
                value={doctorName}
                onChangeText={setDoctorName}
              />
            </View>
          </View>

          {/* Hospital / Clinic */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Hospital / Maternity Clinic</Text>
            <View style={styles.inputWrapper}>
              <Building2 size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Apollo Cradle Maternity Hospital"
                placeholderTextColor="#94A3B8"
                value={hospitalName}
                onChangeText={setHospitalName}
              />
            </View>
          </View>

          {/* Doctor Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Clinic Contact / Phone (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Phone size={16} color="#10B981" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={doctorPhone}
                onChangeText={setDoctorPhone}
              />
            </View>
          </View>

          {/* Quick reset button */}
          {(doctorName !== defaultDoctor || hospitalName !== defaultHospital) && (
            <TouchableOpacity onPress={handleResetToPrimary} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>↺ Reset to My Primary Doctor</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ========================================================
            CARD 2: VISIT DETAILS & CATEGORY
            ======================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEE2E6' }]}>
              <Calendar size={18} color="#E11D48" strokeWidth={2.4} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Appointment Type & Reason</Text>
              <Text style={styles.cardSubtitle}>Select category and description</Text>
            </View>
          </View>

          {/* Type Selector Pills */}
          <View style={styles.typeGrid}>
            {APPOINTMENT_TYPES.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typePill, isSelected && styles.typePillActive]}
                  onPress={() => setSelectedType(type.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Appointment Title */}
          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Visit Title / Description</Text>
            <View style={styles.inputWrapper}>
              <FileText size={16} color="#E11D48" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Detailed Anatomy Ultrasound Scan"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Quick Suggestions */}
          <View style={styles.suggestionsRow}>
            {COMMON_TITLES.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.suggestionChip}
                onPress={() => setTitle(item)}
              >
                <Text style={styles.suggestionChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ========================================================
            CARD 3: DATE & TIME
            ======================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Clock size={18} color="#0284C7" strokeWidth={2.4} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Date & Time Schedule</Text>
              <Text style={styles.cardSubtitle}>Set the appointment date and arrival time</Text>
            </View>
          </View>

          {/* Date Input with Shortcuts */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Appointment Date</Text>
            <View style={styles.inputWrapper}>
              <Calendar size={16} color="#0284C7" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Oct 24, 2026"
                placeholderTextColor="#94A3B8"
                value={dateStr}
                onChangeText={setDateStr}
              />
            </View>
            {/* Date Shortcuts */}
            <View style={styles.shortcutRow}>
              {[
                { label: 'Tomorrow', days: 1 },
                { label: '+1 Week', days: 7 },
                { label: '+2 Weeks', days: 14 },
                { label: '+4 Weeks', days: 28 },
              ].map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={styles.shortcutChip}
                  onPress={() => handleDateShortcut(s.days)}
                >
                  <Text style={styles.shortcutChipText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Input with Presets */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Appointment Time</Text>
            <View style={styles.inputWrapper}>
              <Clock size={16} color="#0284C7" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="10:30 AM"
                placeholderTextColor="#94A3B8"
                value={timeStr}
                onChangeText={setTimeStr}
              />
            </View>
            {/* Time Presets */}
            <View style={styles.shortcutRow}>
              {TIME_PRESETS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.shortcutChip, timeStr === t && styles.shortcutChipActive]}
                  onPress={() => setTimeStr(t)}
                >
                  <Text
                    style={[
                      styles.shortcutChipText,
                      timeStr === t && styles.shortcutChipTextActive,
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ========================================================
            CARD 4: QUESTIONS FOR DOCTOR & NOTES
            ======================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconBg, { backgroundColor: '#FEF3C7' }]}>
              <AlertCircle size={18} color="#D97706" strokeWidth={2.4} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Questions for the Doctor</Text>
              <Text style={styles.cardSubtitle}>
                Add questions you want to ask during this consultation
              </Text>
            </View>
          </View>

          {/* Question Suggestion Chips */}
          <View style={styles.questionsList}>
            {COMMON_QUESTIONS.map((q) => {
              const isSelected = questions.includes(q);
              return (
                <TouchableOpacity
                  key={q}
                  style={[styles.questionChip, isSelected && styles.questionChipActive]}
                  onPress={() => toggleQuestion(q)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.questionChipText, isSelected && styles.questionChipTextActive]}>
                    {isSelected ? '✓ ' : '+ '}
                    {q}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Preparation Notes */}
          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Special Instructions / Notes (Fasting, Reports)</Text>
            <View style={[styles.inputWrapper, { height: 70, alignItems: 'flex-start', paddingTop: 8 }]}>
              <TextInput
                style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                placeholder="e.g. Fasting 8 hours before test, bring scan films, drink 1 liter water"
                placeholderTextColor="#94A3B8"
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
        </View>

        {/* ========================================================
            CARD 5: REMINDER NOTIFICATIONS
            ======================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Bell size={18} color="#9333EA" strokeWidth={2.4} />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Smart Notifications & Reminders</Text>
              <Text style={styles.cardSubtitle}>
                Receive alerts so you never miss this clinical visit
              </Text>
            </View>
          </View>

          {/* Reminder Toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setReminderEnabled(!reminderEnabled)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, reminderEnabled && styles.checkboxActive]}>
              {reminderEnabled && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={styles.toggleText}>Enable automated appointment reminders</Text>
          </TouchableOpacity>

          {reminderEnabled && (
            <View style={styles.reminderTimingRow}>
              {[
                { id: '1_DAY_BEFORE', label: '1 Day Before' },
                { id: '2_HOURS_BEFORE', label: '2 Hours Before' },
                { id: 'BOTH', label: 'Both (Recommended)' },
              ].map((opt) => {
                const isSelected = reminderTiming === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.timingPill, isSelected && styles.timingPillActive]}
                    onPress={() => setReminderTiming(opt.id as any)}
                  >
                    <Text
                      style={[
                        styles.timingPillText,
                        isSelected && styles.timingPillTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          activeOpacity={0.88}
        >
          <Text style={styles.saveBtnText}>Save & Schedule Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  cardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  doctorSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  doctorSyncText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  resetBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  resetBtnText: {
    fontSize: 11.5,
    color: '#0284C7',
    fontWeight: '600',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  typePillActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#E11D48',
  },
  typeIcon: {
    fontSize: 13,
  },
  typeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  typeTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  suggestionChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  suggestionChipText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '500',
  },
  shortcutRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  shortcutChip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shortcutChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  shortcutChipText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  shortcutChipTextActive: {
    color: '#FFFFFF',
  },
  questionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  questionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  questionChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  questionChipTextActive: {
    color: '#92400E',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#9333EA',
    borderColor: '#9333EA',
  },
  toggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  reminderTimingRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  timingPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timingPillActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#9333EA',
  },
  timingPillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  timingPillTextActive: {
    color: '#9333EA',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
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
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
