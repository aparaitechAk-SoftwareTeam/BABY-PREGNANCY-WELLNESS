import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
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
  Phone,
  Plus,
  ChevronLeft,
  Bell,
  CheckCircle2,
  Circle,
  Trash2,
  Stethoscope,
  Filter,
} from 'lucide-react-native';
import { useAppointmentStore, AppointmentType, Appointment, isMockAppointment } from '../../store/appointment.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function AppointmentsListScreen() {
  const router = useRouter();
  const appointments = useAppointmentStore((state) => state.appointments);
  const realAppointments = appointments.filter((a) => !isMockAppointment(a.id));
  const toggleCompleted = useAppointmentStore((state) => state.toggleCompleted);
  const deleteAppointment = useAppointmentStore((state) => state.deleteAppointment);
  const pregnancyProfile = usePregnancyStore((state) => state.profile);

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED'>('UPCOMING');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filteredAppointments = realAppointments.filter((item) => {
    const matchesTab = activeTab === 'UPCOMING' ? !item.isCompleted : !!item.isCompleted;
    const matchesType = selectedType === 'ALL' ? true : item.type === selectedType;
    return matchesTab && matchesType;
  });

  const handleCallDoctor = (phone?: string) => {
    const targetPhone = phone || pregnancyProfile?.doctorPhone;
    if (targetPhone) {
      Linking.openURL(`tel:${targetPhone}`).catch(() => {
        Alert.alert('Unable to place call', `Please dial: ${targetPhone}`);
      });
    } else {
      Alert.alert('No phone number', 'No phone number available for this clinic.');
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Appointment?', `Are you sure you want to remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAppointment(id) },
    ]);
  };

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
          <Text style={styles.headerTitle}>Clinical Appointments</Text>
          <Text style={styles.headerSubtitle}>Prenatal visits, scans & reminders</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/appointments/form')}
          style={styles.addBtn}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Filter (Upcoming vs Completed) */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentBar}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'UPCOMING' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('UPCOMING')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'UPCOMING' && styles.segmentTextActive]}>
              Upcoming Visits ({realAppointments.filter((a) => !a.isCompleted).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'COMPLETED' && styles.segmentBtnActive]}
            onPress={() => setActiveTab('COMPLETED')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, activeTab === 'COMPLETED' && styles.segmentTextActive]}>
              Past History ({realAppointments.filter((a) => !!a.isCompleted).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'Routine', 'Scan', 'Lab', 'Consultation'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, selectedType === cat && styles.filterChipActive]}
              onPress={() => setSelectedType(cat)}
            >
              <Text style={[styles.filterChipText, selectedType === cat && styles.filterChipTextActive]}>
                {cat === 'ALL' ? 'All Visits' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Appointments List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Calendar size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'UPCOMING' ? 'No Upcoming Appointments' : 'No Completed Visits Yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'UPCOMING'
                ? 'Keep your prenatal care on track by scheduling scans and checkups.'
                : 'Appointments you mark as completed will appear here.'}
            </Text>
            {activeTab === 'UPCOMING' && (
              <TouchableOpacity
                onPress={() => router.push('/appointments/form')}
                style={styles.emptyActionBtn}
                activeOpacity={0.85}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.emptyActionBtnText}>Schedule New Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAppointments.map((item) => (
            <View key={item.id} style={styles.appointmentCard}>
              {/* Card Header: Type Badge & Reminder Pill */}
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, getTypeBadgeStyle(item.type)]}>
                  <Text style={[styles.typeBadgeText, getTypeTextStyle(item.type)]}>
                    {item.type} Visit
                  </Text>
                </View>

                <View style={styles.headerRightRow}>
                  {item.reminderEnabled && (
                    <View style={styles.reminderPill}>
                      <Bell size={11} color="#9333EA" strokeWidth={2.5} />
                      <Text style={styles.reminderPillText}>Alert On</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id, item.title)}
                    style={styles.deleteIconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title & Complete Checkbox */}
              <View style={styles.titleRow}>
                <TouchableOpacity
                  onPress={() => toggleCompleted(item.id)}
                  style={styles.checkboxBtn}
                  activeOpacity={0.7}
                >
                  {item.isCompleted ? (
                    <CheckCircle2 size={22} color="#10B981" />
                  ) : (
                    <Circle size={22} color="#CBD5E1" />
                  )}
                </TouchableOpacity>

                <Text
                  style={[
                    styles.appointmentTitle,
                    item.isCompleted && styles.appointmentTitleCompleted,
                  ]}
                >
                  {item.title}
                </Text>
              </View>

              {/* Schedule Info (Date & Time) */}
              <View style={styles.scheduleRow}>
                <View style={styles.scheduleItem}>
                  <Calendar size={13} color="#E11D48" />
                  <Text style={styles.scheduleText}>{item.dateStr}</Text>
                </View>
                <View style={styles.scheduleDivider} />
                <View style={styles.scheduleItem}>
                  <Clock size={13} color="#0284C7" />
                  <Text style={styles.scheduleText}>{item.timeStr}</Text>
                </View>
              </View>

              {/* Doctor & Hospital Details */}
              <View style={styles.clinicInfoBox}>
                <View style={styles.clinicDetailRow}>
                  <User size={13} color="#10B981" style={{ marginTop: 2 }} />
                  <Text style={styles.doctorNameText}>{item.doctorName}</Text>
                </View>
                <View style={styles.clinicDetailRow}>
                  <MapPin size={13} color="#64748B" style={{ marginTop: 2 }} />
                  <Text style={styles.hospitalNameText}>{item.hospitalName}</Text>
                </View>
              </View>

              {/* Notes / Instructions if present */}
              {!!item.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>Instructions:</Text>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              )}

              {/* Questions Count */}
              {item.questionsForDoctor && item.questionsForDoctor.length > 0 && (
                <View style={styles.questionsPreview}>
                  <Text style={styles.questionsCountText}>
                    📝 {item.questionsForDoctor.length} questions prepared for consultation
                  </Text>
                </View>
              )}

              {/* Action Buttons: Call Doctor */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleCallDoctor(item.doctorPhone)}
                  style={styles.callDoctorBtn}
                  activeOpacity={0.8}
                >
                  <Phone size={13} color="#10B981" />
                  <Text style={styles.callDoctorText}>Call Clinic</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => toggleCompleted(item.id)}
                  style={[
                    styles.statusToggleBtn,
                    item.isCompleted ? styles.statusUndoBtn : styles.statusDoneBtn,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.statusToggleText,
                      item.isCompleted ? styles.statusUndoText : styles.statusDoneText,
                    ]}
                  >
                    {item.isCompleted ? 'Mark Pending' : 'Mark as Attended ✓'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getTypeBadgeStyle(type: AppointmentType) {
  switch (type) {
    case 'Scan':
      return { backgroundColor: '#FEE2E6' };
    case 'Lab':
      return { backgroundColor: '#E0F2FE' };
    case 'Consultation':
      return { backgroundColor: '#F3E8FF' };
    default:
      return { backgroundColor: '#F0FDF4' };
  }
}

function getTypeTextStyle(type: AppointmentType) {
  switch (type) {
    case 'Scan':
      return { color: '#E11D48' };
    case 'Lab':
      return { color: '#0284C7' };
    case 'Consultation':
      return { color: '#9333EA' };
    default:
      return { color: '#166534' };
  }
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
    gap: 10,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
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
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
  },
  reminderPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9333EA',
  },
  deleteIconBtn: {
    padding: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  checkboxBtn: {
    marginTop: 1,
  },
  appointmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 20,
  },
  appointmentTitleCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scheduleDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
  },
  scheduleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  clinicInfoBox: {
    gap: 4,
    marginBottom: 10,
  },
  clinicDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  doctorNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  hospitalNameText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  notesBox: {
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 1,
  },
  notesText: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
  },
  questionsPreview: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  questionsCountText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 2,
  },
  callDoctorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  callDoctorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  statusToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusToggleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusDoneBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusUndoBtn: {
    backgroundColor: '#FEF2F2',
  },
  statusUndoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B91C1C',
  },
});
