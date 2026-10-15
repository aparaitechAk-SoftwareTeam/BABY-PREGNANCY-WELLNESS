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
import { User, Mail, Phone, Heart, LogOut, Shield, Bell, AlertTriangle, Headphones, Briefcase, FileText, Sparkles, Car } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { useRouter } from 'expo-router';
import { EmergencySOSModal } from '../../components/common';

export default function CaregiverProfile() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
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
            <Text style={styles.screenHeading}>My Profile</Text>
            <Text style={styles.screenSubtitle}>Caregiver Account Settings</Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBg}>
            <User size={32} color="#E11D48" strokeWidth={2} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Caregiver'}</Text>
            <View style={styles.roleBadge}>
              <Heart size={12} color="#E11D48" strokeWidth={2} />
              <Text style={styles.roleBadgeText}>Family Caregiver</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Mail size={16} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user?.email || 'email@example.com'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Phone size={16} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Heart size={16} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Joined Date</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Today'}
              </Text>
            </View>
          </View>
        </View>

        {/* Caregiver Tools & Readiness */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Caregiver Tools & Readiness</Text>

          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.7}
            onPress={() => router.push('/(caregiver)/birth-readiness')}
          >
            <View style={[styles.prefIconBg, { backgroundColor: '#FEE2E2' }]}>
              <Briefcase size={16} color="#DC2626" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={styles.prefLabel}>Labor & Hospital Readiness</Text>
              <Text style={styles.prefSubtitle}>Emergency route, 5-1-1 guide & hospital bag</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.7}
            onPress={() => router.push('/(caregiver)/reports')}
          >
            <View style={[styles.prefIconBg, { backgroundColor: '#E0F2FE' }]}>
              <FileText size={16} color="#0284C7" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={styles.prefLabel}>Shared Medical Records & Vault</Text>
              <Text style={styles.prefSubtitle}>Ultrasounds, prescriptions & consultation reports</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.7}
            onPress={() => router.push('/partner/tasks')}
          >
            <View style={[styles.prefIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Car size={16} color="#D97706" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={styles.prefLabel}>Family Task Coordination</Text>
              <Text style={styles.prefSubtitle}>Pharmacy pickup, transport & nursery tasks</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.preferenceRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={() => router.push('/timeline')}
          >
            <View style={[styles.prefIconBg, { backgroundColor: '#FDF2F8' }]}>
              <Sparkles size={16} color="#DB2777" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={styles.prefLabel}>Pregnancy Care Timeline</Text>
              <Text style={styles.prefSubtitle}>Chronological visits, scans & milestone tests</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences & Support</Text>

          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.prefIconBg}>
              <Bell size={16} color="#0EA5E9" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={styles.prefLabel}>Notifications Center</Text>
              <Text style={styles.prefSubtitle}>Alerts, doctor reminders & updates</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.preferenceRow}
            activeOpacity={0.7}
            onPress={() => router.push('/support')}
          >
            <View style={[styles.prefIconBg, { backgroundColor: '#E0F2FE' }]}>
              <Headphones size={16} color="#0284C7" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={styles.prefLabel}>Care Support & Live Chat</Text>
              <Text style={styles.prefSubtitle}>24/7 technical and care support</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.preferenceRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
            onPress={() => setShowSOSModal(true)}
          >
            <View style={[styles.prefIconBg, { backgroundColor: '#FEE2E2' }]}>
              <AlertTriangle size={16} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.prefContent}>
              <Text style={[styles.prefLabel, { color: '#E11D48' }]}>Emergency SOS & Contacts</Text>
              <Text style={styles.prefSubtitle}>Instant maternal hotline & dispatch</Text>
            </View>
            <Text style={styles.prefArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Caregiver Info */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Role</Text>
          <View style={styles.roleCard}>
            <View style={styles.roleBadgeLarge}>
              <Heart size={24} color="#E11D48" strokeWidth={2} />
            </View>
            <Text style={styles.roleTitle}>Family Caregiver</Text>
            <Text style={styles.roleDescription}>
              You're connected as a caregiver to support and monitor the mother's pregnancy journey. You can view shared health data, upcoming appointments, and progress milestones.
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={styles.roleFeature}>✓ View health tracking data</Text>
              <Text style={styles.roleFeature}>✓ Access appointments</Text>
              <Text style={styles.roleFeature}>✓ Receive notifications</Text>
              <Text style={styles.roleFeature}>✓ View shared reports</Text>
              <Text style={styles.roleFeature}>✓ Support family member</Text>
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Version 1.0.0 • AparaiTech Pregnancy Wellness
          </Text>
        </View>
      </ScrollView>

      {/* Emergency SOS Modal */}
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarBg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prefIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  prefContent: {
    flex: 1,
  },
  prefLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  prefSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  prefArrow: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleBadgeLarge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  roleFeatures: {
    width: '100%',
    gap: 6,
  },
  roleFeature: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 12,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
