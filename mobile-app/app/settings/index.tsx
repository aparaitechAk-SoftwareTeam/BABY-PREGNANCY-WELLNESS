import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Users,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Moon,
  Lock,
  Heart,
  Scale,
  Sparkles,
  Headphones,
  Globe,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function SettingsIndexScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const profile = usePregnancyStore((state) => state.profile);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hydrationReminders, setHydrationReminders] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of AparaiTech?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
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
          <Text style={styles.headerTitle}>Settings & Preferences</Text>
          <Text style={styles.headerSubtitle}>Account, privacy, and notifications</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Account Header Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.name || 'M').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Mama'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'mother@example.com'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user?.role === 'caregiver' ? 'Caregiver Account' : 'Expecting Mother'}
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Pregnancy & Care Team Setup */}
        <Text style={styles.sectionHeader}>Pregnancy & Care Team</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/(onboarding)/pregnancy-setup')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E6' }]}>
              <Heart size={18} color="#E11D48" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Pregnancy Baseline & Doctor Info</Text>
              <Text style={styles.itemSubtitle}>
                {profile?.doctorName ? `${profile.doctorName} • ${profile.hospitalName || ''}` : 'Due date, height, weight, OB-GYN'}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/partner')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Users size={18} color="#15803D" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Family & Partner Circle</Text>
              <Text style={styles.itemSubtitle}>Manage caregiver pairing code & access</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/partner/permissions')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Shield size={18} color="#7E22CE" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Caregiver Sharing Permissions</Text>
              <Text style={styles.itemSubtitle}>Configure confidential data categories</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/birth-prep')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E6' }]}>
              <Heart size={18} color="#E11D48" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Birth Prep & Hospital Bag</Text>
              <Text style={styles.itemSubtitle}>Hospital checklist, birth plan & recovery</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 2. Notifications & Reminders */}
        <Text style={styles.sectionHeader}>Notifications & Routine</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingsItem}>
            <View style={[styles.itemIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Bell size={18} color="#0284C7" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Clinic Visit Reminders</Text>
              <Text style={styles.itemSubtitle}>Alerts 1 day & 2 hours before checkups</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
              thumbColor={notificationsEnabled ? '#0284C7' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingsItem}>
            <View style={[styles.itemIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Sparkles size={18} color="#0369A1" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Hydration Prompts</Text>
              <Text style={styles.itemSubtitle}>Gentle hourly reminders to sip water</Text>
            </View>
            <Switch
              value={hydrationReminders}
              onValueChange={setHydrationReminders}
              trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
              thumbColor={hydrationReminders ? '#0284C7' : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/reminders')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Bell size={18} color="#D97706" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>All Reminders & Quiet Hours</Text>
              <Text style={styles.itemSubtitle}>Vitamins, calcium, and sleep silence</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 3. Customer & Clinical Support */}
        <Text style={styles.sectionHeader}>Customer & Clinical Support</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/support')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#E0F2FE' }]}>
              <HelpCircle size={18} color="#0284C7" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Care Support Hub & Live Chat</Text>
              <Text style={styles.itemSubtitle}>Live chat, FAQs, guides, and ticket submission</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/education/audio-guides')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E6' }]}>
              <Headphones size={18} color="#E11D48" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Regional Audio Guides & Languages</Text>
              <Text style={styles.itemSubtitle}>Marathi, Hindi & English clinical audio tracks</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 4. Clinical & Legal Disclaimers */}
        <Text style={styles.sectionHeader}>Security & Medical Policies</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() =>
              Alert.alert(
                '🔒 Medical Disclaimer',
                'AparaiTech is an educational and wellness tracking platform designed to support expectant mothers. It is not an approved medical device, and does not provide clinical diagnosis. Always consult your qualified OB-GYN or midwife for diagnostic interpretation.'
              )
            }
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E2' }]}>
              <FileText size={18} color="#DC2626" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Medical Non-Diagnostic Disclaimer</Text>
              <Text style={styles.itemSubtitle}>PRD Section 19 regulatory guidelines</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push('/settings/privacy-center')}
            activeOpacity={0.7}
          >
            <View style={[styles.itemIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Lock size={18} color="#475569" />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>Privacy & Data Access Center</Text>
              <Text style={styles.itemSubtitle}>Caregiver permissions, audit log & exports</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 4. Logout Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={16} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sign Out of AparaiTech</Text>
        </TouchableOpacity>

        <Text style={styles.versionFooter}>AparaiTech Maternal Wellness v1.0.4 • Build 2026</Text>
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    marginBottom: 20,
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
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E11D48',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13.5,
  },
  versionFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
});
