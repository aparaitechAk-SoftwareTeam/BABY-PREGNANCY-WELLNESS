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
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Footprints,
  Droplets,
  Scale,
  Smile,
  AlertCircle,
  Lock,
} from 'lucide-react-native';

interface PermissionOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  enabled: boolean;
  recommended: boolean;
}

export default function PartnerPermissionsScreen() {
  const router = useRouter();

  const [permissions, setPermissions] = useState<PermissionOption[]>([
    {
      id: 'milestones',
      title: 'Fetal Milestones & Development',
      description: 'Allows partner to see week-by-week baby size, fruit comparison, and trimester guides.',
      icon: ShieldCheck,
      iconBg: '#FCE7F3',
      iconColor: '#BE185D',
      enabled: true,
      recommended: true,
    },
    {
      id: 'appointments',
      title: 'Clinic Visits & Doctor Reminders',
      description: 'Shares upcoming OB-GYN checkups, ultrasound scans, and calendar reminders with partner.',
      icon: Calendar,
      iconBg: '#E0F2FE',
      iconColor: '#0284C7',
      enabled: true,
      recommended: true,
    },
    {
      id: 'kicks',
      title: 'Baby Kick Count Logs',
      description: 'Partner receives updates when you complete a Cardiff count-to-10 movement session.',
      icon: Footprints,
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
      enabled: true,
      recommended: true,
    },
    {
      id: 'emergency',
      title: 'Emergency Medical Alerts',
      description: 'Caregiver immediately receives an alert if you tap the Medical Hotline or SOS button.',
      icon: AlertCircle,
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
      enabled: true,
      recommended: true,
    },
    {
      id: 'hydration',
      title: 'Hydration Intake Status',
      description: 'Shares daily water goal progress so partner can remind you to stay hydrated.',
      icon: Droplets,
      iconBg: '#E0F2FE',
      iconColor: '#0369A1',
      enabled: true,
      recommended: false,
    },
    {
      id: 'weight',
      title: 'Maternal Weight Progression',
      description: 'Shares clinical weight curve data and trimester gain progression.',
      icon: Scale,
      iconBg: '#F1F5F9',
      iconColor: '#475569',
      enabled: false,
      recommended: false,
    },
    {
      id: 'mood_diary',
      title: 'Symptoms & Private Reflections',
      description: 'Shares sensitive symptom logs and maternal emotional check-in reflections.',
      icon: Smile,
      iconBg: '#F3E8FF',
      iconColor: '#7E22CE',
      enabled: false,
      recommended: false,
    },
  ]);

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    Alert.alert(
      'Permissions Updated ✅',
      'Your caregiver sharing preferences have been updated. Changes take effect across paired devices immediately.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
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
          <Text style={styles.headerTitle}>Sharing Permissions</Text>
          <Text style={styles.headerSubtitle}>Control what your caregiver can view</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Informative Header Box */}
        <View style={styles.infoBanner}>
          <Lock size={18} color="#059669" />
          <Text style={styles.infoBannerText}>
            You have full ownership of your health records. You can toggle off any health categories at any time without notifying your partner.
          </Text>
        </View>

        {/* Permissions List */}
        <Text style={styles.sectionHeading}>Data Categories</Text>

        {permissions.map((item) => {
          const IconComponent = item.icon;
          return (
            <View key={item.id} style={styles.permissionCard}>
              <View style={styles.permTopRow}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                  <IconComponent size={20} color={item.iconColor} />
                </View>

                <View style={styles.permTextCol}>
                  <View style={styles.permTitleRow}>
                    <Text style={styles.permTitle}>{item.title}</Text>
                    {item.recommended && (
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.permDescription}>{item.description}</Text>
                </View>

                <Switch
                  value={item.enabled}
                  onValueChange={() => togglePermission(item.id)}
                  trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                  thumbColor={item.enabled ? '#059669' : '#F1F5F9'}
                />
              </View>
            </View>
          );
        })}

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <CheckCircle2 size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Sharing Preferences</Text>
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
    paddingTop: 14,
    paddingBottom: 32,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  permTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permTextCol: {
    flex: 1,
  },
  permTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  permTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  recBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  permDescription: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
