import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useAppointmentStore, Appointment } from '../../store/appointment.store';
import { Clock, MapPin, User, Plus, Bell } from 'lucide-react-native';

export default function MotherCalendar() {
  const router = useRouter();
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);

  const appointments = useAppointmentStore((state) => state.appointments);
  const fetchLiveAppointments = useAppointmentStore((state) => state.fetchLiveAppointments);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Scroll to top and reload live appointments from DB when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      fetchLiveAppointments();
    }, [fetchLiveAppointments])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLiveAppointments();
    setIsRefreshing(false);
  };

  const handleAddAppointment = () => {
    router.push('/appointments/form');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Scan':
        return { bg: '#FEE2E6', text: '#E11D48', icon: '🔬' };
      case 'Lab':
        return { bg: '#E0F2FE', text: '#0284C7', icon: '🩸' };
      case 'Consultation':
        return { bg: '#F3E8FF', text: '#9333EA', icon: '👩‍⚕️' };
      default:
        return { bg: '#D1FAE5', text: '#059669', icon: '🩺' };
    }
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
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenHeading}>My Appointments</Text>
            <Text style={styles.screenSubtitle}>
              Trimester {trimester} • {appointments.length} upcoming visits
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddAppointment}
            style={styles.addBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Current Trimester Focus Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTop}>
            <View>
              <Text style={styles.overviewLabel}>CURRENT GESTATIONAL STAGE</Text>
              <Text style={styles.overviewTitle}>Week {currentWeek} of 40</Text>
            </View>
            <View style={styles.trimesterPill}>
              <Text style={styles.trimesterPillText}>Trimester {trimester}</Text>
            </View>
          </View>
          <Text style={styles.overviewBody}>
            Key clinical focus: routine blood pressure, anomaly confirmation & fetal monitoring.
          </Text>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <View style={styles.sectionBadgeContainer}>
            <Text style={styles.sectionBadge}>{appointments.length}</Text>
          </View>
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsList}>
          {appointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateText}>No appointments scheduled yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap + Add to schedule your first visit</Text>
            </View>
          ) : (
            appointments.map((item, index) => {
              const typeColors = getTypeColor(item.type);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.aptCard, index === 0 && styles.aptCardNext]}
                  activeOpacity={0.8}
                >
                  {index === 0 && <Text style={styles.nextLabel}>NEXT</Text>}
                  
                  <View style={styles.aptContentRow}>
                    <View style={[styles.typeIcon, { backgroundColor: typeColors.bg }]}>
                      <Text style={styles.typeIconEmoji}>{typeColors.icon}</Text>
                    </View>

                    <View style={styles.aptDetails}>
                      <View style={styles.aptHeaderRow}>
                        <Text style={styles.aptTitle}>{item.title}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
                          <Text style={[styles.typeBadgeText, { color: typeColors.text }]}>
                            {item.type}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.aptMetaRow}>
                        <View style={styles.aptMeta}>
                          <User size={13} color="#64748B" />
                          <Text style={styles.aptMetaText}>{item.doctorName || (item as any).doctor}</Text>
                        </View>
                      </View>

                      <View style={styles.aptMetaRow}>
                        <View style={styles.aptMeta}>
                          <MapPin size={13} color="#64748B" />
                          <Text style={styles.aptMetaText}>{item.hospitalName || (item as any).clinic}</Text>
                        </View>
                      </View>

                      <View style={styles.aptMetaRow}>
                        <View style={styles.aptMeta}>
                          <Clock size={13} color="#64748B" />
                          <Text style={styles.aptMetaText}>{item.dateStr} at {item.timeStr}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {index === 0 && (
                    <TouchableOpacity style={styles.reminderBtn} activeOpacity={0.7}>
                      <Text style={styles.reminderBtnText}>🔔 Set Reminder</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  addBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  trimesterPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trimesterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  overviewBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionBadgeContainer: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  appointmentsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  aptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  aptCardNext: {
    borderColor: '#E11D48',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },
  nextLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  aptContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconEmoji: {
    fontSize: 24,
  },
  aptDetails: {
    flex: 1,
  },
  aptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  aptTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    lineHeight: 18,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  aptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aptMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  aptMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  reminderBtn: {
    marginTop: 10,
    backgroundColor: '#FEE2E6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reminderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
});
