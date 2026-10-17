import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Heart,
  Users,
  Calendar,
  Bell,
  Phone,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Info,
  Clock,
  MapPin,
  UserCheck,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useAppointmentStore } from '../../store/appointment.store';
import { UpcomingAppointmentAnnouncement } from '../../components/dashboard';

export default function FamilyDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const profile = usePregnancyStore((state) => state.profile);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);
  const trimester = usePregnancyStore((state) => state.trimester);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleCallDoctor = () => {
    const phone = profile?.doctorPhone || '+91 98765 43210';
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const formattedDueDate = profile?.dueDate
    ? new Date(profile.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Oct 28, 2026';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Family & Partner Circle</Text>
          <Text style={styles.headerSubtitle}>
            Supporting {profile?.nickname ? `${profile.nickname}'s Mama` : 'Mother'} • Week {currentWeek}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/partner')}
          style={styles.circleSettingsBtn}
          activeOpacity={0.7}
        >
          <Users size={18} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#E11D48"
          />
        }
      >
        {/* 1. TOP HORIZONTAL APPOINTMENT ANNOUNCEMENT (TODAY / UPCOMING) */}
        <UpcomingAppointmentAnnouncement
          mode="family"
          onPressViewAll={() => router.push('/(caregiver)/calendar')}
        />

        {/* 2. Mother & Baby Status Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarBox}>
              <Heart size={24} color="#E11D48" />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.heroSuper}>Gestational Progress</Text>
              <Text style={styles.heroHeading}>
                Week {currentWeek} • Trimester {trimester}
              </Text>
            </View>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>{daysRemaining} days to go</Text>
            </View>
          </View>

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Expected Due Date</Text>
              <Text style={styles.metricValue}>{formattedDueDate}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Attending Doctor</Text>
              <Text style={styles.metricValue}>
                {profile?.doctorName || 'Not specified'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Hospital</Text>
              <Text style={styles.metricValue}>
                {profile?.hospitalName || 'Not specified'}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Family Support Guide for Current Week */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Sparkles size={16} color="#D97706" />
            <Text style={styles.tipTitle}>Partner Support Guide • Week {currentWeek}</Text>
          </View>
          <Text style={styles.tipBody}>
            • <Text style={{ fontWeight: '700' }}>Clinic Checkups:</Text> Confirm transport and ensure the mother has her prenatal documents & hydration bottle.{'\n'}
            • <Text style={{ fontWeight: '700' }}>Evening Rest:</Text> Help elevate her feet for 20 minutes to reduce lower extremity swelling.{'\n'}
            • <Text style={{ fontWeight: '700' }}>Nutrition:</Text> Keep fresh fruits, calcium-rich snacks, and water readily available.
          </Text>
        </View>

        {/* 4. Quick Action Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(caregiver)/calendar')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Calendar size={20} color="#0284C7" />
            </View>
            <Text style={styles.actionCardTitle}>Clinic Calendar</Text>
            <Text style={styles.actionCardSub}>View all visits</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleCallDoctor}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEE2E6' }]}>
              <Phone size={20} color="#E11D48" />
            </View>
            <Text style={styles.actionCardTitle}>Call Doctor</Text>
            <Text style={styles.actionCardSub}>Direct clinic line</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/partner')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Users size={20} color="#15803D" />
            </View>
            <Text style={styles.actionCardTitle}>Circle Members</Text>
            <Text style={styles.actionCardSub}>Permissions</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  circleSettingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextCol: {
    flex: 1,
  },
  heroSuper: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E11D48',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  daysBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  daysBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 9.5,
    color: '#64748B',
    marginBottom: 2,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  tipBody: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 18,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  actionCardSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },
});
