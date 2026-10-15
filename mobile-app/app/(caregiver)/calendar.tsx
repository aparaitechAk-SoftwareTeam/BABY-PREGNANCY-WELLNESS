import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Calendar, MapPin, Clock, User } from 'lucide-react-native';
import { useAppointmentStore } from '../../store/appointment.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function CaregiverCalendar() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const appointments = useAppointmentStore((state) => state.appointments);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
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
            <Text style={styles.screenHeading}>Caregiver Appointments</Text>
            <Text style={styles.screenSubtitle}>
              Week {currentWeek || 20} • Synced visits with mother's care team
            </Text>
          </View>
        </View>

        {/* Month Overview */}
        <View style={styles.monthCard}>
          <Text style={styles.monthTitle}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <Text style={styles.monthSubtitle}>
            Week {currentWeek || 20} - Week {(currentWeek || 20) + 2}
          </Text>
        </View>

        {/* Appointments Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Mother's Upcoming Appointments</Text>

          {appointments.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>No appointments scheduled by mother yet</Text>
            </View>
          ) : (
            appointments.map((item) => (
              <View key={item.id} style={styles.appointmentCard}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dayNumber}>{item.dateStr.slice(0, 3)}</Text>
                  <Text style={styles.monthLabel}>{item.type}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTitle}>{item.title}</Text>
                  <View style={styles.appointmentMeta}>
                    <Clock size={12} color="#64748B" strokeWidth={2} />
                    <Text style={styles.appointmentTime}>{item.dateStr} at {item.timeStr}</Text>
                  </View>
                  <View style={styles.appointmentMeta}>
                    <User size={12} color="#10B981" strokeWidth={2} />
                    <Text style={[styles.appointmentLocation, { color: '#166534', fontWeight: '600' }]}>
                      {item.doctorName}
                    </Text>
                  </View>
                  <View style={styles.appointmentMeta}>
                    <MapPin size={12} color="#64748B" strokeWidth={2} />
                    <Text style={styles.appointmentLocation}>{item.hospitalName}</Text>
                  </View>
                </View>
                <View style={styles.appointmentStatus}>
                  <Text style={styles.statusBadge}>{item.isCompleted ? 'Attended' : 'Scheduled'}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Milestones Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Pregnancy Milestones</Text>

          <View style={styles.milestoneCard}>
            <View style={styles.milestoneMarker}>
              <Text style={styles.milestoneMarkerText}>20</Text>
            </View>
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>Week 20 - Halfway Point!</Text>
              <Text style={styles.milestoneSubtitle}>Mid-pregnancy scan scheduled</Text>
            </View>
            <Text style={styles.milestoneBadge}>✓</Text>
          </View>

          <View style={styles.milestoneCard}>
            <View style={styles.milestoneMarker}>
              <Text style={styles.milestoneMarkerText}>24</Text>
            </View>
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>Week 24 - Glucose Testing</Text>
              <Text style={styles.milestoneSubtitle}>Gestational diabetes screening</Text>
            </View>
            <Text style={styles.milestoneBadge}>Upcoming</Text>
          </View>

          <View style={styles.milestoneCard}>
            <View style={styles.milestoneMarker}>
              <Text style={styles.milestoneMarkerText}>28</Text>
            </View>
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>Week 28 - Third Trimester</Text>
              <Text style={styles.milestoneSubtitle}>Beginning of home stretch</Text>
            </View>
            <Text style={styles.milestoneBadge}>Upcoming</Text>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Important Notes</Text>
          <Text style={styles.notesText}>
            • All appointments are tentative and subject to change
          </Text>
          <Text style={styles.notesText}>
            • The mother will notify you of any changes
          </Text>
          <Text style={styles.notesText}>
            • You can view appointment details if shared with you
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
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 16,
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
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  monthSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateColumn: {
    width: 50,
    alignItems: 'center',
    backgroundColor: '#FEE2E6',
    borderRadius: 10,
    paddingVertical: 8,
    marginRight: 12,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E11D48',
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E11D48',
    marginTop: 2,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  appointmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  appointmentTime: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  appointmentLocation: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  appointmentStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  milestoneMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneMarkerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0EA5E9',
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  milestoneSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  milestoneBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  notesCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 11,
    color: '#B91C1C',
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
});
