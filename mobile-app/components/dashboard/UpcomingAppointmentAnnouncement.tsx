import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  UserCheck,
  ChevronRight,
  BellRing,
  AlertCircle,
  FileQuestion,
  Sparkles,
} from 'lucide-react-native';
import { useAppointmentStore, Appointment } from '../../store/appointment.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface UpcomingAppointmentAnnouncementProps {
  mode?: 'mother' | 'caregiver' | 'family';
  onPressViewAll?: () => void;
}

export function UpcomingAppointmentAnnouncement({
  mode = 'mother',
  onPressViewAll,
}: UpcomingAppointmentAnnouncementProps) {
  const router = useRouter();
  const appointments = useAppointmentStore((state) => state.appointments);
  const pregnancyProfile = usePregnancyStore((state) => state.profile);

  // Filter for uncompleted upcoming appointments
  const upcomingList = appointments
    .filter((a) => !a.isCompleted)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  if (upcomingList.length === 0) {
    return null;
  }

  // Identify earliest upcoming appointment
  const currentAppointment = upcomingList[0];
  const isToday =
    currentAppointment.dateStr.toLowerCase().includes('today') ||
    new Date(currentAppointment.timestamp).toDateString() === new Date().toDateString();

  const isTomorrow =
    currentAppointment.dateStr.toLowerCase().includes('tomorrow') ||
    new Date(currentAppointment.timestamp).toDateString() ===
      new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

  // Doctor & Hospital with fallbacks from mother profile
  const doctorName =
    currentAppointment.doctorName || pregnancyProfile?.doctorName || 'Your Doctor';
  const hospitalName =
    currentAppointment.hospitalName ||
    pregnancyProfile?.hospitalName ||
    'Maternity Clinic';
  const doctorPhone =
    currentAppointment.doctorPhone || pregnancyProfile?.doctorPhone || '';

  const handleCallClinic = () => {
    if (!doctorPhone) {
      Alert.alert('Phone Number Needed', 'Please add your doctor or clinic phone number in your profile.');
      return;
    }
    Alert.alert(
      'Call Clinic / Doctor',
      `Dial ${doctorName} at ${hospitalName} (${doctorPhone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => Linking.openURL(`tel:${doctorPhone.replace(/[^0-9+]/g, '')}`),
        },
      ]
    );
  };

  const handleOpenAppointmentDetails = () => {
    if (onPressViewAll) {
      onPressViewAll();
    } else if (mode === 'caregiver') {
      router.push('/(caregiver)/calendar');
    } else {
      router.push('/appointments');
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.announcementCard,
          isToday ? styles.cardToday : styles.cardUpcoming,
        ]}
      >
        {/* Top Header Pill Banner */}
        <View style={styles.topBannerRow}>
          <View style={styles.badgeGroup}>
            <View
              style={[
                styles.liveBadge,
                isToday ? styles.liveBadgeToday : styles.liveBadgeUpcoming,
              ]}
            >
              <View
                style={[
                  styles.pulsingDot,
                  isToday ? styles.pulsingDotToday : styles.pulsingDotUpcoming,
                ]}
              />
              <BellRing
                size={12}
                color={isToday ? '#B91C1C' : '#0284C7'}
                strokeWidth={2.5}
              />
              <Text
                style={[
                  styles.badgeText,
                  isToday ? styles.badgeTextToday : styles.badgeTextUpcoming,
                ]}
              >
                {isToday
                  ? mode === 'caregiver'
                    ? "TODAY'S PARTNER APPOINTMENT ALERT"
                    : "TODAY'S CLINIC APPOINTMENT"
                  : isTomorrow
                  ? "TOMORROW'S SCHEDULED VISIT"
                  : 'UPCOMING CLINIC ANNOUNCEMENT'}
              </Text>
            </View>

            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{currentAppointment.type}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleOpenAppointmentDetails}
            style={styles.viewDetailsHeaderBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.viewDetailsHeaderText}>View List</Text>
            <ChevronRight size={14} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Title of Appointment */}
        <Text style={styles.appointmentTitle}>{currentAppointment.title}</Text>

        {/* Time, Doctor, & Hospital Grid */}
        <View style={styles.infoGrid}>
          {/* Timing */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Clock size={14} color="#0F172A" />
            </View>
            <Text style={styles.infoHighlight}>
              {isToday ? 'Today' : currentAppointment.dateStr} at{' '}
              <Text style={styles.infoTimeBold}>{currentAppointment.timeStr}</Text>
            </Text>
          </View>

          {/* Doctor Name */}
          <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E6' }]}>
              <UserCheck size={14} color="#E11D48" />
            </View>
            <Text style={styles.doctorNameText}>
              {doctorName}{' '}
              <Text style={styles.doctorRoleTag}>• Attending OB-GYN</Text>
            </Text>
          </View>

          {/* Hospital / Clinic */}
          <View style={styles.infoRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
              <MapPin size={14} color="#0284C7" />
            </View>
            <Text style={styles.hospitalNameText} numberOfLines={1}>
              {hospitalName}
            </Text>
          </View>
        </View>

        {/* Preparation / Note banner */}
        {currentAppointment.notes ? (
          <View style={styles.notesBox}>
            <Sparkles size={13} color="#D97706" />
            <Text style={styles.notesText} numberOfLines={2}>
              <Text style={styles.notesLabel}>Preparation: </Text>
              {currentAppointment.notes}
            </Text>
          </View>
        ) : null}

        {/* Caregiver specific guidance */}
        {mode === 'caregiver' && (
          <View style={styles.caregiverNotice}>
            <Text style={styles.caregiverNoticeText}>
              💡 <Text style={{ fontWeight: '700' }}>Partner Tip:</Text> Please accompany mother or confirm transport. Carry ultrasound scans & hospital registration file.
            </Text>
          </View>
        )}

        {/* Horizontal Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.callClinicBtn}
            onPress={handleCallClinic}
            activeOpacity={0.8}
          >
            <Phone size={14} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.callClinicBtnText}>Call Clinic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={handleOpenAppointmentDetails}
            activeOpacity={0.8}
          >
            <Calendar size={14} color="#0F172A" strokeWidth={2} />
            <Text style={styles.detailsBtnText}>Checklist & Questions</Text>
            {currentAppointment.questionsForDoctor &&
              currentAppointment.questionsForDoctor.length > 0 && (
                <View style={styles.qCountBadge}>
                  <Text style={styles.qCountText}>
                    {currentAppointment.questionsForDoctor.length}
                  </Text>
                </View>
              )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardToday: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFFDFD',
  },
  cardUpcoming: {
    borderColor: '#BAE6FD',
    backgroundColor: '#FFFFFF',
  },
  topBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveBadgeToday: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  liveBadgeUpcoming: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pulsingDotToday: {
    backgroundColor: '#DC2626',
  },
  pulsingDotUpcoming: {
    backgroundColor: '#0284C7',
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextToday: {
    color: '#991B1B',
  },
  badgeTextUpcoming: {
    color: '#0369A1',
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  viewDetailsHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  viewDetailsHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  appointmentTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  infoGrid: {
    gap: 7,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoHighlight: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
  },
  infoTimeBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  doctorNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  doctorRoleTag: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  hospitalNameText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
  },
  notesLabel: {
    fontWeight: '700',
    color: '#92400E',
  },
  caregiverNotice: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  caregiverNoticeText: {
    fontSize: 11,
    color: '#166534',
    lineHeight: 15,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  callClinicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  callClinicBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  detailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  detailsBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12,
  },
  qCountBadge: {
    backgroundColor: '#FEE2E6',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E11D48',
  },
});
