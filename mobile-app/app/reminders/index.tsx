import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  Clock,
  Calendar,
  Pill,
  Droplet,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Stethoscope,
  Building2,
  CheckCircle,
} from 'lucide-react-native';
import { useAppointmentStore } from '../../store/appointment.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function RemindersScreen() {
  const router = useRouter();
  const appointments = useAppointmentStore((state) => state.appointments);
  const pregnancyProfile = usePregnancyStore((state) => state.profile);

  // Reminders states
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [prenatalVitamins, setPrenatalVitamins] = useState(true);
  const [calciumSupplements, setCalciumSupplements] = useState(true);
  const [hydrationAlerts, setHydrationAlerts] = useState(true);
  const [kickCounterReminder, setKickCounterReminder] = useState(true);
  const [quietHours, setQuietHours] = useState(true);

  const upcomingAppointments = appointments.filter((a) => !a.isCompleted);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Reminders & Alerts</Text>
          <Text style={styles.headerSubtitle}>Medication, appointments & wellness</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================================
            SECTION 1: CLINICAL APPOINTMENT REMINDERS
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#F0FDF4' }]}>
              <Calendar size={18} color="#10B981" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionTitle}>Doctor Appointment Reminders</Text>
              <Text style={styles.sectionSubtitle}>
                Alerts for visits with your doctor & hospital
              </Text>
            </View>
            <Switch
              value={appointmentReminders}
              onValueChange={setAppointmentReminders}
              trackColor={{ false: '#CBD5E1', true: '#BBF7D0' }}
              thumbColor={appointmentReminders ? '#10B981' : '#F1F5F9'}
            />
          </View>

          {/* Active Appointments Preview */}
          {appointmentReminders && (
            <View style={styles.appointmentList}>
              {upcomingAppointments.length === 0 ? (
                <View style={styles.emptyNotice}>
                  <Text style={styles.emptyNoticeText}>No upcoming appointments scheduled</Text>
                </View>
              ) : (
                upcomingAppointments.slice(0, 2).map((item) => (
                  <View key={item.id} style={styles.appointmentItem}>
                    <View style={styles.aptLeft}>
                      <Text style={styles.aptTitle}>{item.title}</Text>
                      <View style={styles.aptMeta}>
                        <Stethoscope size={11} color="#166534" />
                        <Text style={styles.aptDoctorText}>
                          {item.doctorName || pregnancyProfile?.doctorName}
                        </Text>
                      </View>
                      <View style={styles.aptMeta}>
                        <Building2 size={11} color="#64748B" />
                        <Text style={styles.aptHospitalText}>
                          {item.hospitalName || pregnancyProfile?.hospitalName}
                        </Text>
                      </View>
                      <Text style={styles.aptScheduleText}>
                        🗓️ {item.dateStr} at {item.timeStr}
                      </Text>
                    </View>
                    <View style={styles.reminderBadge}>
                      <Bell size={10} color="#9333EA" />
                      <Text style={styles.reminderBadgeText}>Alert Active</Text>
                    </View>
                  </View>
                ))
              )}

              <TouchableOpacity
                onPress={() => router.push('/appointments/form')}
                style={styles.scheduleMoreBtn}
                activeOpacity={0.8}
              >
                <Plus size={14} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.scheduleMoreText}>Schedule New Doctor Visit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ========================================================
            SECTION 2: PRENATAL VITAMINS & MEDICATION
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#FEE2E6' }]}>
              <Pill size={18} color="#E11D48" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionTitle}>Prenatal Supplements & Vitamins</Text>
              <Text style={styles.sectionSubtitle}>Daily reminders for essential nutrients</Text>
            </View>
          </View>

          <View style={styles.reminderRow}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderItemTitle}>Prenatal Multivitamin & Folic Acid</Text>
              <Text style={styles.reminderItemSub}>Every morning at 09:00 AM • with breakfast</Text>
            </View>
            <Switch
              value={prenatalVitamins}
              onValueChange={setPrenatalVitamins}
              trackColor={{ false: '#CBD5E1', true: '#FECDD3' }}
              thumbColor={prenatalVitamins ? '#E11D48' : '#F1F5F9'}
            />
          </View>

          <View style={[styles.reminderRow, { borderBottomWidth: 0 }]}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderItemTitle}>Calcium & Vitamin D3 Tablet</Text>
              <Text style={styles.reminderItemSub}>Every afternoon at 02:00 PM • after lunch</Text>
            </View>
            <Switch
              value={calciumSupplements}
              onValueChange={setCalciumSupplements}
              trackColor={{ false: '#CBD5E1', true: '#FECDD3' }}
              thumbColor={calciumSupplements ? '#E11D48' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* ========================================================
            SECTION 3: HYDRATION & BABY KICKS
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Droplet size={18} color="#0284C7" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionTitle}>Daily Wellness Habits</Text>
              <Text style={styles.sectionSubtitle}>Hydration and movement check-ins</Text>
            </View>
          </View>

          <View style={styles.reminderRow}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderItemTitle}>Hourly Water Intake Alert</Text>
              <Text style={styles.reminderItemSub}>Every 2 hours (10:00 AM - 08:00 PM)</Text>
            </View>
            <Switch
              value={hydrationAlerts}
              onValueChange={setHydrationAlerts}
              trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
              thumbColor={hydrationAlerts ? '#0284C7' : '#F1F5F9'}
            />
          </View>

          <View style={[styles.reminderRow, { borderBottomWidth: 0 }]}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderItemTitle}>Evening Baby Movement Session</Text>
              <Text style={styles.reminderItemSub}>Daily at 08:30 PM • Cardiff count-to-10</Text>
            </View>
            <Switch
              value={kickCounterReminder}
              onValueChange={setKickCounterReminder}
              trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
              thumbColor={kickCounterReminder ? '#0284C7' : '#F1F5F9'}
            />
          </View>
        </View>

        {/* ========================================================
            SECTION 4: QUIET HOURS (DO NOT DISTURB)
            ======================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: '#F3E8FF' }]}>
              <Moon size={18} color="#9333EA" strokeWidth={2.4} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionTitle}>Maternal Sleep & Quiet Hours</Text>
              <Text style={styles.sectionSubtitle}>Mutes non-urgent alerts during rest</Text>
            </View>
            <Switch
              value={quietHours}
              onValueChange={setQuietHours}
              trackColor={{ false: '#CBD5E1', true: '#E9D5FF' }}
              thumbColor={quietHours ? '#9333EA' : '#F1F5F9'}
            />
          </View>

          <View style={styles.quietNotice}>
            <Text style={styles.quietNoticeText}>
              🌙 All wellness & routine alerts are automatically paused between 10:00 PM and 07:00 AM so you get uninterrupted sleep.
            </Text>
          </View>
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
  sectionCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  appointmentList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  emptyNotice: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyNoticeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aptLeft: {
    flex: 1,
    gap: 2,
  },
  aptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  aptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aptDoctorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  aptHospitalText: {
    fontSize: 10.5,
    color: '#475569',
  },
  aptScheduleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 2,
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  reminderBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#9333EA',
  },
  scheduleMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 4,
  },
  scheduleMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  reminderTextCol: {
    flex: 1,
  },
  reminderItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reminderItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quietNotice: {
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: 6,
  },
  quietNoticeText: {
    fontSize: 11,
    color: '#6B21A8',
    lineHeight: 16,
  },
});
