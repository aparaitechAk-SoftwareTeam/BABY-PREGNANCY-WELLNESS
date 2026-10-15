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
import { Copy, AlertCircle, LogOut, Heart, Calendar, Users, Lock, Settings, ListTodo, Headphones } from 'lucide-react-native';

// Stores
import { useAuthStore } from '../../store/auth.store';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { EmergencySOSModal } from '../../components/common';

export default function MotherProfile() {
  const router = useRouter();
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);

  const user = useAuthStore((state: any) => state.user);
  const logout = useAuthStore((state: any) => state.logout);

  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);
  const profile = usePregnancyStore((state) => state.profile);

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

  const formattedDueDate = profile?.dueDate
    ? new Date(profile.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not configured';

  const handleCopyPartnerCode = () => {
    Alert.alert(
      '✅ Code Copied!',
      '👥 Partner Invite Code: AP-8492\n\nShare this with your partner or family. They can sign up as "Partner" and get real-time access to your pregnancy milestones, doctor checklist, and fetal kick logs.',
      [
        { text: 'Got it', style: 'default' },
      ]
    );
  };

  const handleEmergencyContacts = () => {
    setShowSOSModal(true);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out?', 'Are you sure you want to sign out? You can always sign back in with your credentials.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (logout) logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
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
        {/* Screen Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenHeading}>My Profile</Text>
            <Text style={styles.screenSubtitle}>
              Account • Pregnancy details • Emergency contacts
            </Text>
          </View>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              onPress={() => setShowSOSModal(true)}
              style={styles.headerSosBtn}
              activeOpacity={0.8}
              accessibilityLabel="Emergency SOS"
            >
              <View style={styles.headerSosDot} />
              <Text style={styles.headerSosBtnText}>SOS</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.settingsHeaderBtn}
              activeOpacity={0.7}
            >
              <Settings size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 1. Profile Identity Hero Card */}
        <View style={styles.profileHeroCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Heart size={28} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.profileInfoCol}>
              <Text style={styles.userName}>{user?.name || 'Mama'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'mother@aparaitech.com'}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>👶 Expecting Mother</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. Gestational Timeline Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Calendar size={18} color="#0284C7" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Pregnancy Timeline</Text>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Week</Text>
              <View style={styles.detailValueBadge}>
                <Text style={styles.detailValueBadgeText}>Week {currentWeek} of 40</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trimester</Text>
              <View style={styles.detailValueBadge}>
                <Text style={styles.detailValueBadgeText}>T{trimester}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Days Remaining</Text>
              <Text style={styles.detailValue}>{daysRemaining} days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailValueHighlight}>{formattedDueDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Baby Nickname</Text>
              <Text style={styles.detailValue}>{profile?.nickname || 'Little One'}</Text>
            </View>
          </View>
        </View>

        {/* 3. Mother's Health & Doctor Profile */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Heart size={18} color="#E11D48" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Health & Clinical Care Team</Text>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Weight</Text>
              <Text style={styles.detailValue}>
                {profile?.currentWeight ? `${profile.currentWeight} kg` : '65.5 kg'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailValue}>
                {profile?.heightFt || (profile?.height ? `${profile.height} cm` : "5'6\"")}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Blood Group</Text>
              <View style={styles.detailValueBadge}>
                <Text style={styles.detailValueBadgeText}>{profile?.bloodGroup || 'O+'}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Doctor / OB-GYN</Text>
              <Text style={styles.detailValueHighlight}>
                {profile?.doctorName || 'Dr. Priya Sharma'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hospital / Center</Text>
              <Text style={styles.detailValue}>
                {profile?.hospitalName || 'Apollo Cradle Hospital'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Doctor Contact</Text>
              <Text style={styles.detailValue}>
                {profile?.doctorPhone || '+91 98765 43210'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(onboarding)/pregnancy-setup')}
            style={styles.editProfileBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.editProfileBtnText}>✏️ Edit Pregnancy & Doctor Information</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Daily Routine & Habits Tracker */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ListTodo size={18} color="#E11D48" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Daily Routine & Habits</Text>
          </View>

          <Text style={styles.sectionSubtitleText}>
            Personalized prenatal timeline including vitamins, hydration checkpoints, kick counting sessions, and safe rest postures.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/routine')}
            style={styles.routineShortcutBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.routineShortcutBtnText}>📋 Open Today's Routine & Tasks Tracker ›</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Partner & Family Pairing */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Users size={18} color="#059669" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Family & Partner Sync</Text>
          </View>

          <Text style={styles.sectionSubtitleText}>
            Give your partner read-only access to fetal milestones, doctor checklists, and kick logs in real time.
          </Text>

          <TouchableOpacity
            onPress={handleCopyPartnerCode}
            style={styles.partnerCodeBox}
            activeOpacity={0.85}
          >
            <View style={styles.partnerCodeLeft}>
              <Text style={styles.partnerCodeLabel}>INVITE CODE</Text>
              <Text style={styles.partnerCodeValue}>MOM-8492</Text>
            </View>
            <Copy size={20} color="#0F172A" strokeWidth={2.5} />
          </TouchableOpacity>

          <Text style={styles.partnerHintText}>
            💡 Tip: Share this code with your partner to enable shared pregnancy tracking
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/partner')}
            style={styles.managePartnerBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.managePartnerBtnText}>👥 Manage Caregiver Circle & Permissions</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Safety & Emergency Contacts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={18} color="#DC2626" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Medical Emergency Protocol</Text>
          </View>

          <TouchableOpacity
            onPress={handleEmergencyContacts}
            style={styles.emergencyRow}
            activeOpacity={0.85}
          >
            <View style={styles.emergencyLeft}>
              <Text style={styles.emergencyNumber}>🚨</Text>
              <View style={styles.emergencyTextCol}>
                <Text style={styles.emergencyTitle}>24/7 Clinical Hotline</Text>
                <Text style={styles.emergencySub}>Call hospital triage immediately</Text>
              </View>
            </View>
            <Text style={styles.emergencyArrow}>›</Text>
          </TouchableOpacity>

          {/* Prominent Emergency SOS Button */}
          <TouchableOpacity
            onPress={() => setShowSOSModal(true)}
            style={styles.sosTriggerBtn}
            activeOpacity={0.85}
          >
            <View style={styles.sosPulsingDot} />
            <Text style={styles.sosTriggerBtnText}>🚨 TRIGGER EMERGENCY SOS PROTOCOL</Text>
          </TouchableOpacity>

          <View style={styles.emergencyWarning}>
            <Text style={styles.emergencyWarningText}>
              ⚠️ Call emergency if: severe cramping, vaginal bleeding, fluid leakage, or reduced baby movements
            </Text>
          </View>
        </View>

        {/* 5. Data & Privacy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Lock size={18} color="#7C3AED" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
          </View>

          <View style={styles.privacyList}>
            <View style={styles.privacyItem}>
              <Text style={styles.privacyCheck}>✓</Text>
              <Text style={styles.privacyText}>256-bit encrypted all data</Text>
            </View>
            <View style={styles.privacyItem}>
              <Text style={styles.privacyCheck}>✓</Text>
              <Text style={styles.privacyText}>HIPAA & DISHA compliant healthcare storage</Text>
            </View>
            <View style={styles.privacyItem}>
              <Text style={styles.privacyCheck}>✓</Text>
              <Text style={styles.privacyText}>Caregiver access controls with instant revoke</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/settings/privacy-center')}
            style={[styles.managePartnerBtn, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE', marginTop: 12 }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.managePartnerBtnText, { color: '#6D28D9' }]}>
              🛡️ Privacy & Caregiver Permissions Center ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* 6. Care Support & Live Chat */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Headphones size={18} color="#0284C7" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Help & Care Support Team</Text>
          </View>
          <Text style={styles.sectionSubtitleText}>
            Connect with our dedicated maternal care team for questions, app guidance, or clinical assistance.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/support')}
            style={[styles.managePartnerBtn, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', marginTop: 10 }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.managePartnerBtnText, { color: '#0369A1' }]}>
              💬 Open Live Support Chat & FAQs ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7. Sign Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
          activeOpacity={0.85}
        >
          <LogOut size={18} color="#E11D48" strokeWidth={2.5} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Security Footer */}
        <View style={styles.securityFooter}>
          <Text style={styles.securityFooterText}>
            AparaiTech v1.0 • Medical Grade Security
          </Text>
        </View>
      </Animated.ScrollView>

      {/* 24/7 Rapid Obstetric Triage & Emergency SOS Modal */}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerSosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  headerSosBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  settingsHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
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
  profileHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
    flex: 1,
  },
  sectionSubtitleText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#64748B',
    marginBottom: 12,
  },
  detailsList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  detailValueHighlight: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  detailValueBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailValueBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  partnerCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  partnerCodeLeft: {
    flex: 1,
  },
  partnerCodeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  partnerCodeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: 1,
  },
  partnerHintText: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
  emergencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 10,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  emergencyNumber: {
    fontSize: 20,
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BE123C',
  },
  emergencySub: {
    fontSize: 11,
    color: '#9F1239',
    marginTop: 1,
  },
  emergencyArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#BE123C',
    marginLeft: 8,
  },
  emergencyWarning: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E11D48',
  },
  emergencyWarningText: {
    fontSize: 11.5,
    color: '#BE123C',
    fontWeight: '600',
    lineHeight: 15,
  },
  sosTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sosPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  sosTriggerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  privacyList: {
    gap: 10,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  privacyCheck: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '700',
  },
  privacyText: {
    fontSize: 12.5,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
  },
  editProfileBtn: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  routineShortcutBtn: {
    marginTop: 10,
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  routineShortcutBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  managePartnerBtn: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  managePartnerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E6',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: 6,
    marginBottom: 16,
  },
  logoutBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  securityFooter: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  securityFooterText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
});
