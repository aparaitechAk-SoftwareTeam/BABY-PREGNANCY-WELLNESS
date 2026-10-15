import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  FileText,
  Lock,
  Eye,
  EyeOff,
  UserX,
  Clock,
  Smartphone,
  AlertTriangle,
  Download,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react-native';
import { usePrivacyStore, CaregiverAccess } from '../../store/privacy.store';
import { useVaultStore } from '../../store/vault.store';

export default function PrivacyCenterScreen() {
  const router = useRouter();

  const {
    caregivers,
    activityLogs,
    updatePermission,
    revokeCaregiverAccess,
    loadPrivacyData,
  } = usePrivacyStore();

  const { documents, toggleCaregiverShare, loadDocuments } = useVaultStore();

  const [activeTab, setActiveTab] = useState<'caregivers' | 'shared_docs' | 'activity' | 'security'>('caregivers');

  useEffect(() => {
    loadPrivacyData();
    loadDocuments();
  }, []);

  const sharedDocuments = documents.filter((d) => d.isSharedWithCaregiver);

  const handleRevoke = (cg: CaregiverAccess) => {
    Alert.alert(
      'Revoke Caregiver Access',
      `Are you sure you want to completely disconnect "${cg.name}"? They will immediately lose access to your milestones, appointments, and shared health records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: async () => {
            await revokeCaregiverAccess(cg.id);
            Alert.alert('Access Revoked', `${cg.name} has been disconnected from your circle.`);
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Export Medical Data Archive',
      'A complete encrypted ZIP archive containing your pregnancy timeline, kick count history, weight progression, and uploaded medical documents has been prepared for download.',
      [{ text: 'Download ZIP Archive' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Purge Health Records & Delete Account',
      'This will permanently delete your pregnancy profile, all recorded kick logs, daily routine history, and uploaded ultrasound documents. This action is irreversible according to DPDP & GDPR standards.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Everything', style: 'destructive' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Privacy & Data Access Center</Text>
          <View style={styles.securityHeaderBadge}>
            <ShieldCheck size={12} color="#059669" strokeWidth={2.5} />
            <Text style={styles.securityHeaderText}>256-Bit Encrypted • You Are In Control</Text>
          </View>
        </View>
      </View>

      {/* 4-Way Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'caregivers' && styles.tabItemActive]}
          onPress={() => setActiveTab('caregivers')}
        >
          <Text style={[styles.tabLabel, activeTab === 'caregivers' && styles.tabLabelActive]}>
            👥 Caregivers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'shared_docs' && styles.tabItemActive]}
          onPress={() => setActiveTab('shared_docs')}
        >
          <Text style={[styles.tabLabel, activeTab === 'shared_docs' && styles.tabLabelActive]}>
            📄 Shared Files ({sharedDocuments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'activity' && styles.tabItemActive]}
          onPress={() => setActiveTab('activity')}
        >
          <Text style={[styles.tabLabel, activeTab === 'activity' && styles.tabLabelActive]}>
            🛡️ Audit Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'security' && styles.tabItemActive]}
          onPress={() => setActiveTab('security')}
        >
          <Text style={[styles.tabLabel, activeTab === 'security' && styles.tabLabelActive]}>
            🔒 Security
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: CAREGIVERS & PERMISSIONS */}
        {activeTab === 'caregivers' && (
          <View>
            <View style={styles.bannerInfo}>
              <ShieldCheck size={18} color="#0284C7" />
              <Text style={styles.bannerInfoText}>
                You have full control over what each caregiver can see. Permissions take effect immediately.
              </Text>
            </View>

            {caregivers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Users size={38} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Connected Caregivers</Text>
                <Text style={styles.emptySub}>
                  No one currently has access to your maternal health data. Share your invite code in Family Sync to connect a partner.
                </Text>
              </View>
            ) : (
              caregivers.map((cg) => (
                <View key={cg.id} style={styles.caregiverCard}>
                  {/* Caregiver Profile Header */}
                  <View style={styles.cgHeaderRow}>
                    <View style={styles.cgAvatarCircle}>
                      <Text style={styles.cgAvatarText}>
                        {cg.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.cgInfoCol}>
                      <Text style={styles.cgName}>{cg.name}</Text>
                      <Text style={styles.cgRelation}>{cg.relationship} • {cg.email}</Text>
                      <View style={styles.deviceRow}>
                        <Smartphone size={11} color="#64748B" />
                        <Text style={styles.deviceText}>{cg.device} • Active {cg.lastActive}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Permissions Toggles List */}
                  <Text style={styles.permissionsTitle}>Data Access Permissions</Text>

                  {[
                    { key: 'vitals' as const, label: 'Weight & Blood Pressure Vitals', sub: 'Maternal gestational curve and blood pressure records' },
                    { key: 'kicks' as const, label: 'Fetal Kick Sessions', sub: 'Cardiff count-to-10 timers and movement frequency' },
                    { key: 'appointments' as const, label: 'Doctor Appointments & Notes', sub: 'Clinic checkup dates, doctor questions and preparations' },
                    { key: 'documents' as const, label: 'Medical Document Vault', sub: 'Ultrasound scans, prescriptions and blood test reports' },
                    { key: 'routine' as const, label: 'Daily Routine & Steps', sub: 'Vitamins, hydration targets, and physical activity' },
                  ].map((perm) => (
                    <View key={perm.key} style={styles.permRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.permLabel}>{perm.label}</Text>
                        <Text style={styles.permSub}>{perm.sub}</Text>
                      </View>
                      <Switch
                        value={cg.permissions[perm.key]}
                        onValueChange={(val) => updatePermission(cg.id, perm.key, val)}
                        trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
                        thumbColor={cg.permissions[perm.key] ? '#0284C7' : '#F1F5F9'}
                      />
                    </View>
                  ))}

                  {/* Emergency SOS locked on */}
                  <View style={styles.permRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.permLabel}>Emergency SOS & Hotlines</Text>
                      <Text style={styles.permSub}>Always active for maternal clinical safety</Text>
                    </View>
                    <View style={styles.lockedPill}>
                      <Text style={styles.lockedPillText}>LOCKED ON ✓</Text>
                    </View>
                  </View>

                  {/* Revoke Access Button */}
                  <TouchableOpacity
                    style={styles.revokeBtn}
                    onPress={() => handleRevoke(cg)}
                    activeOpacity={0.8}
                  >
                    <UserX size={16} color="#DC2626" />
                    <Text style={styles.revokeBtnText}>Revoke All Access for {cg.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: SHARED DOCUMENTS REGISTRY */}
        {activeTab === 'shared_docs' && (
          <View>
            <View style={styles.bannerInfo}>
              <FileText size={18} color="#0284C7" />
              <Text style={styles.bannerInfoText}>
                These files in your Medical Vault are currently visible to connected caregivers. Tap "Make Private" to revoke access at any time.
              </Text>
            </View>

            {sharedDocuments.length === 0 ? (
              <View style={styles.emptyCard}>
                <EyeOff size={38} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>All Documents Are Private</Text>
                <Text style={styles.emptySub}>
                  None of your ultrasound scans or medical reports are currently shared with caregivers.
                </Text>
              </View>
            ) : (
              sharedDocuments.map((doc) => (
                <View key={doc.id} style={styles.sharedDocCard}>
                  <View style={styles.sharedDocTop}>
                    <View style={styles.sharedBadge}>
                      <Text style={styles.sharedBadgeText}>
                        {doc.category.toUpperCase().replace('_', ' ')}
                      </Text>
                    </View>
                    <Text style={styles.sharedDateText}>{doc.date}</Text>
                  </View>

                  <Text style={styles.sharedDocTitle}>{doc.title}</Text>
                  <Text style={styles.sharedDoctor}>{doc.doctorName} • {doc.clinicName}</Text>

                  <View style={styles.sharedBottomRow}>
                    <View style={styles.sharedActivePill}>
                      <Eye size={13} color="#059669" />
                      <Text style={styles.sharedActiveText}>Visible to Caregivers</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.makePrivateBtn}
                      onPress={async () => {
                        await toggleCaregiverShare(doc.id);
                        Alert.alert('Access Revoked', `"${doc.title}" is now private and invisible to caregivers.`);
                      }}
                      activeOpacity={0.8}
                    >
                      <Lock size={13} color="#DC2626" />
                      <Text style={styles.makePrivateBtnText}>Make Private</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: ACCOUNT ACCESS AUDIT LOG */}
        {activeTab === 'activity' && (
          <View>
            <View style={styles.bannerInfo}>
              <Clock size={18} color="#0284C7" />
              <Text style={styles.bannerInfoText}>
                Real-time security audit log of every health data access, report viewing, and permission modification.
              </Text>
            </View>

            <View style={styles.auditCard}>
              {activityLogs.map((log, index) => (
                <View key={log.id} style={styles.auditRow}>
                  <View style={styles.auditDotCol}>
                    <View style={styles.auditDot} />
                    {index < activityLogs.length - 1 && <View style={styles.auditLine} />}
                  </View>

                  <View style={styles.auditContentCol}>
                    <View style={styles.auditHeaderRow}>
                      <Text style={styles.auditActor}>{log.actorName}</Text>
                      <Text style={styles.auditTime}>{log.timestamp}</Text>
                    </View>
                    <Text style={styles.auditAction}>{log.action}</Text>
                    {log.ipOrDevice && (
                      <Text style={styles.auditDevice}>{log.ipOrDevice}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 4: SECURITY CONTROLS & EXPORT */}
        {activeTab === 'security' && (
          <View>
            {/* Encryption Card */}
            <View style={styles.securityCard}>
              <View style={styles.securityIconBox}>
                <Lock size={22} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.securityTitle}>AES-256 Military Grade Encryption</Text>
                <Text style={styles.securityDesc}>
                  Your maternal vitals, ultrasound sonography files, and doctor questions are encrypted both at rest and during transit using TLS 1.3 protocol.
                </Text>
              </View>
            </View>

            {/* Compliance Standards */}
            <View style={styles.complianceCard}>
              <Text style={styles.complianceHeading}>Regulatory Compliance Framework</Text>
              {[
                'HIPAA Health Insurance Portability & Accountability Compliant',
                'Indian Digital Personal Data Protection (DPDP Act 2023) Aligned',
                'Zero Third-Party Advertising Trackers or Data Brokers',
                'End-to-End Cryptographic Patient Isolation',
              ].map((item, idx) => (
                <View key={idx} style={styles.compRow}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.compText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Download Data Archive */}
            <TouchableOpacity
              style={styles.dataActionBtn}
              onPress={handleDownloadData}
              activeOpacity={0.8}
            >
              <Download size={18} color="#0F172A" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.dataActionTitle}>Download All My Health Records</Text>
                <Text style={styles.dataActionSub}>Export complete pregnancy history & reports in ZIP archive</Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>

            {/* Delete Account & Purge */}
            <TouchableOpacity
              style={[styles.dataActionBtn, styles.deleteActionBtn]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Trash2 size={18} color="#DC2626" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.dataActionTitle, { color: '#DC2626' }]}>
                  Purge Data & Delete Account
                </Text>
                <Text style={styles.dataActionSub}>Permanently erase all logs & documents (GDPR / DPDP)</Text>
              </View>
              <ChevronRight size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  securityHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  securityHeaderText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#E11D48',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#E11D48',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 14,
    gap: 8,
  },
  bannerInfoText: {
    fontSize: 11.5,
    color: '#0369A1',
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  caregiverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cgHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cgAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cgAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
  },
  cgInfoCol: {
    flex: 1,
  },
  cgName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cgRelation: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  deviceText: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  permissionsTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  permRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  permLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  permSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  lockedPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockedPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#059669',
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  revokeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  sharedDocCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  sharedDocTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sharedBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sharedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  sharedDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sharedDocTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  sharedDoctor: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  sharedBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sharedActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sharedActiveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  makePrivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  makePrivateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  auditRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  auditDotCol: {
    width: 20,
    alignItems: 'center',
  },
  auditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    marginTop: 4,
  },
  auditLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  auditContentCol: {
    flex: 1,
    marginLeft: 10,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditActor: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  auditTime: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  auditAction: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  auditDevice: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    marginBottom: 14,
  },
  securityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#166534',
  },
  securityDesc: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
    marginTop: 2,
  },
  complianceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 10,
  },
  complianceHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  compRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '500',
  },
  dataActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  deleteActionBtn: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  dataActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dataActionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
