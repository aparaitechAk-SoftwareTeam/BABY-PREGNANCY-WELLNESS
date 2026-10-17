import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Users,
  Copy,
  Share2,
  ShieldCheck,
  UserCheck,
  Clock,
  Settings2,
  UserPlus,
  MessageCircle,
  Heart,
  ChevronRight,
  CheckCircle2,
  ListTodo,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface PairedMember {
  id: string;
  name: string;
  relationship: string;
  status: 'Active' | 'Pending';
  connectedDate: string;
  avatarColor: string;
  permissions: {
    milestones: boolean;
    appointments: boolean;
    kicks: boolean;
    emergency: boolean;
  };
}

export default function PartnerSyncScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const profile = usePregnancyStore((state) => state.profile);

  const inviteCode = 'MOM-8492';

  const initialMembers: PairedMember[] = profile?.emergencyContactName
    ? [
        {
          id: 'pm-emergency',
          name: profile.emergencyContactName,
          relationship: profile.emergencyContactRelation || 'Emergency Contact / Partner',
          status: 'Active',
          connectedDate: 'Configured by Mother',
          avatarColor: '#E11D48',
          permissions: {
            milestones: true,
            appointments: true,
            kicks: true,
            emergency: true,
          },
        },
      ]
    : [];

  const [members, setMembers] = useState<PairedMember[]>(initialMembers);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert('Invite Code Copied! 📋', `Share code ${inviteCode} with your partner to connect their Caregiver app.`);
  };

  const handleShareWhatsApp = async () => {
    const message = `Hi! I'm tracking our pregnancy journey on AparaiTech (Week ${currentWeek}). Join my Caregiver Circle using my invite code: *${inviteCode}* to view baby milestones, ultrasound appointments, and kick updates!`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Share.share({ message });
    }
  };

  const handleShareGeneric = async () => {
    const message = `Join my pregnancy wellness journey on AparaiTech (Week ${currentWeek}). Use invite code: ${inviteCode} to pair as my caregiver/partner.`;
    await Share.share({
      title: 'AparaiTech Caregiver Invite',
      message,
    });
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
          <Text style={styles.headerTitle}>Family & Partner Circle</Text>
          <Text style={styles.headerSubtitle}>Shared Caregiver Tracking & Alerts</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/partner/manage-access')}
          style={styles.settingsHeaderBtn}
          activeOpacity={0.7}
        >
          <Settings2 size={20} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card with Invite Code */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconBadge}>
              <Users size={24} color="#059669" />
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroSuper}>Secure Caregiver Pairing</Text>
              <Text style={styles.heroHeading}>Invite Your Partner or Family</Text>
            </View>
          </View>

          <Text style={styles.heroDescription}>
            Paired members get real-time access to week-by-week baby milestones, clinic appointment reminders, and kick count logs.
          </Text>

          {/* Code Box */}
          <View style={styles.codeContainer}>
            <View style={styles.codeTextCol}>
              <Text style={styles.codeLabel}>YOUR 6-CHARACTER PAIRING CODE</Text>
              <Text style={styles.codeNumber}>{inviteCode}</Text>
            </View>

            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnDone]}
              onPress={handleCopyCode}
              activeOpacity={0.8}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={16} color="#FFFFFF" />
                  <Text style={styles.copyBtnText}>Copied</Text>
                </>
              ) : (
                <>
                  <Copy size={16} color="#FFFFFF" />
                  <Text style={styles.copyBtnText}>Copy</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Share Action Buttons */}
          <View style={styles.shareRow}>
            <TouchableOpacity
              style={styles.whatsappBtn}
              onPress={handleShareWhatsApp}
              activeOpacity={0.85}
            >
              <MessageCircle size={16} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>Send via WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moreShareBtn}
              onPress={handleShareGeneric}
              activeOpacity={0.85}
            >
              <Share2 size={16} color="#0F172A" />
              <Text style={styles.moreShareBtnText}>More Options</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Nav to Permissions & Access */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavCard}
            onPress={() => router.push('/partner/tasks')}
            activeOpacity={0.8}
          >
            <View style={[styles.quickNavIconBox, { backgroundColor: '#FEE2E6' }]}>
              <ListTodo size={20} color="#E11D48" />
            </View>
            <View style={styles.quickNavTextCol}>
              <Text style={styles.quickNavTitle}>Family Task Coordination</Text>
              <Text style={styles.quickNavSub}>Assign transport, pharmacy & essentials</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickNavCard, { marginTop: 10 }]}
            onPress={() => router.push('/partner/permissions')}
            activeOpacity={0.8}
          >
            <View style={styles.quickNavIconBox}>
              <ShieldCheck size={20} color="#7E22CE" />
            </View>
            <View style={styles.quickNavTextCol}>
              <Text style={styles.quickNavTitle}>Sharing Permissions</Text>
              <Text style={styles.quickNavSub}>Customize visible health data</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Connected Circle Members List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Connected Caregivers ({members.length})</Text>
          <TouchableOpacity
            onPress={() => router.push('/partner/manage-access')}
            activeOpacity={0.7}
          >
            <Text style={styles.sectionActionText}>Manage Access</Text>
          </TouchableOpacity>
        </View>

        {members.length === 0 ? (
          <View style={styles.emptyCircleCard}>
            <Users size={32} color="#94A3B8" />
            <Text style={styles.emptyCircleTitle}>No Caregiver or Partner Linked</Text>
            <Text style={styles.emptyCircleSub}>
              Share your invite code above or add your partner/emergency contact to give them real-time updates.
            </Text>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberTopRow}>
              <View style={[styles.avatarCircle, { backgroundColor: member.avatarColor }]}>
                <Text style={styles.avatarInitial}>{member.name.charAt(0)}</Text>
              </View>

              <View style={styles.memberDetails}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      member.status === 'Active' ? styles.statusActive : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        member.status === 'Active' ? styles.statusTextActive : styles.statusTextPending,
                      ]}
                    >
                      {member.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.memberRelation}>{member.relationship}</Text>
                <Text style={styles.memberDate}>{member.connectedDate}</Text>
              </View>
            </View>

            {/* Permission Chips */}
            <View style={styles.permissionChipsRow}>
              {member.permissions.milestones && (
                <View style={styles.permChip}>
                  <Text style={styles.permChipText}>✨ Milestones</Text>
                </View>
              )}
              {member.permissions.appointments && (
                <View style={styles.permChip}>
                  <Text style={styles.permChipText}>📅 Clinic Visits</Text>
                </View>
              )}
              {member.permissions.kicks && (
                <View style={styles.permChip}>
                  <Text style={styles.permChipText}>👣 Kick Logs</Text>
                </View>
              )}
              {member.permissions.emergency && (
                <View style={styles.permChip}>
                  <Text style={styles.permChipText}>🚨 SOS Alert</Text>
                </View>
              )}
            </View>
          </View>
        )))}

        {/* Security & Privacy Commitment */}
        <View style={styles.securityBox}>
          <ShieldCheck size={20} color="#059669" />
          <Text style={styles.securityText}>
            <Text style={styles.securityBold}>Maternal Privacy Controlled:</Text> Your partner only sees data you authorize. Private symptoms, diary reflections, and personal weight notes remain confidential unless you enable them.
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
  settingsHeaderBtn: {
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
    padding: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
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
    marginBottom: 8,
  },
  heroIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitleCol: {
    flex: 1,
  },
  heroSuper: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  heroDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  codeTextCol: {},
  codeLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  codeNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  copyBtnDone: {
    backgroundColor: '#047857',
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  shareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 12,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  moreShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 12,
  },
  moreShareBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12.5,
  },
  quickNavRow: {
    marginBottom: 18,
  },
  quickNavCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  quickNavIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickNavTextCol: {
    flex: 1,
  },
  quickNavTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickNavSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  memberTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#15803D',
  },
  statusTextPending: {
    color: '#B45309',
  },
  memberRelation: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  memberDate: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  permissionChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  permChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#334155',
  },
  securityBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#166534',
    lineHeight: 16,
  },
  securityBold: {
    fontWeight: '700',
  },
  emptyCircleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyCircleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 4,
  },
  emptyCircleSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
