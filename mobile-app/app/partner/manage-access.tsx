import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Users,
  UserX,
  UserPlus,
  Send,
  ShieldAlert,
  CheckCircle2,
  Clock,
  History,
  Trash2,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface CaregiverMember {
  id: string;
  name: string;
  relation: string;
  emailOrPhone: string;
  status: 'Active' | 'Pending';
  lastActive: string;
}

interface AccessLog {
  id: string;
  user: string;
  action: string;
  timeStr: string;
}

export default function ManageAccessScreen() {
  const router = useRouter();
  const profile = usePregnancyStore((state) => state.profile);

  const initialMembers: CaregiverMember[] = profile?.emergencyContactName
    ? [
        {
          id: 'cg-emergency',
          name: profile.emergencyContactName,
          relation: profile.emergencyContactRelation || 'Emergency Contact / Partner',
          emailOrPhone: profile.emergencyContactPhone || 'Configured by Mother',
          status: 'Active',
          lastActive: 'Connected in Profile Setup',
        },
      ]
    : [];

  const [members, setMembers] = useState<CaregiverMember[]>(initialMembers);
  const [auditLogs, setAuditLogs] = useState<AccessLog[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRelation, setInviteRelation] = useState('Partner / Husband');
  const [inviteContact, setInviteContact] = useState('');

  const handleRevoke = (member: CaregiverMember) => {
    Alert.alert(
      `Revoke Access for ${member.name}?`,
      `They will immediately lose access to your pregnancy timeline, appointments, and movement logs. You can re-invite them at any time.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: () => {
            setMembers((prev) => prev.filter((m) => m.id !== member.id));
            Alert.alert('Access Revoked', `${member.name}'s caregiver access has been removed.`);
          },
        },
      ]
    );
  };

  const handleResendInvite = (member: CaregiverMember) => {
    Alert.alert('Invite Resent', `A new invitation link has been dispatched to ${member.emailOrPhone}.`);
  };

  const handleSendInvite = () => {
    if (!inviteName.trim() || !inviteContact.trim()) {
      Alert.alert('Missing Fields', 'Please enter both the caregiver name and phone/email.');
      return;
    }

    const newMember: CaregiverMember = {
      id: 'cg_' + Date.now(),
      name: inviteName.trim(),
      relation: inviteRelation,
      emailOrPhone: inviteContact.trim(),
      status: 'Pending',
      lastActive: 'Just invited',
    };

    setMembers((prev) => [...prev, newMember]);
    setInviteName('');
    setInviteContact('');
    setShowInviteModal(false);
    Alert.alert('Invitation Dispatched! ✉️', `Invitation sent to ${newMember.name}. They will appear here once registered.`);
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
          <Text style={styles.headerTitle}>Manage Caregiver Access</Text>
          <Text style={styles.headerSubtitle}>Revoke, re-invite, and review sharing history</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Action Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>Add Another Caregiver</Text>
            <Text style={styles.bannerSub}>Support for partners, doulas, or maternal grandparents</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowInviteModal(!showInviteModal)}
            activeOpacity={0.8}
          >
            <UserPlus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Invite</Text>
          </TouchableOpacity>
        </View>

        {/* Inline Invite Form */}
        {showInviteModal && (
          <View style={styles.inviteFormCard}>
            <Text style={styles.formTitle}>Invite a New Caregiver</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter caregiver full name"
                placeholderTextColor="#94A3B8"
                value={inviteName}
                onChangeText={setInviteName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Partner / Mother / Sister / Doula"
                placeholderTextColor="#94A3B8"
                value={inviteRelation}
                onChangeText={setInviteRelation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number or Email</Text>
              <TextInput
                style={styles.inputField}
                placeholder="+91 98765 43210 or email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                value={inviteContact}
                onChangeText={setInviteContact}
              />
            </View>

            <View style={styles.formBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowInviteModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSendInvite}
                activeOpacity={0.8}
              >
                <Send size={14} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Send Invitation</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Members List */}
        <Text style={styles.sectionHeading}>Current Caregivers ({members.length})</Text>

        {members.length === 0 ? (
          <View style={styles.emptyCircleCard}>
            <Users size={28} color="#94A3B8" />
            <Text style={styles.emptyCircleTitle}>No Caregivers Linked</Text>
            <Text style={styles.emptyCircleSub}>
              Tap "Invite" above to share access with your partner or trusted family member.
            </Text>
          </View>
        ) : (
          members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberTop}>
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relation} • {member.emailOrPhone}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    member.status === 'Active' ? styles.statusActive : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      member.status === 'Active' ? styles.statusTextActive : styles.statusTextPending,
                    ]}
                  >
                    {member.status}
                  </Text>
                </View>
              </View>

              <View style={styles.memberMetaRow}>
                <Clock size={12} color="#64748B" />
                <Text style={styles.memberLastActive}>{member.lastActive}</Text>
              </View>

              {/* Action buttons */}
              <View style={styles.memberActionsRow}>
                {member.status === 'Pending' && (
                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={() => handleResendInvite(member)}
                    activeOpacity={0.8}
                  >
                    <Send size={13} color="#0284C7" />
                    <Text style={styles.resendBtnText}>Resend Invite</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={() => handleRevoke(member)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={13} color="#DC2626" />
                  <Text style={styles.revokeBtnText}>Revoke Access</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Audit Log Section */}
        <View style={styles.auditHeaderRow}>
          <History size={16} color="#0F172A" />
          <Text style={styles.sectionHeading}>Recent Access & Activity Audit</Text>
        </View>

        <View style={styles.auditCard}>
          {auditLogs.length === 0 ? (
            <Text style={styles.emptyAuditText}>No caregiver access events recorded yet.</Text>
          ) : (
            auditLogs.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.auditItem,
                  idx === auditLogs.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.auditDot} />
                <View style={styles.auditContent}>
                  <Text style={styles.auditAction}>{item.action}</Text>
                  <Text style={styles.auditMeta}>{item.user} • {item.timeStr}</Text>
                </View>
              </View>
            ))
          )}
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  inviteFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  memberTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberRelation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#15803D',
  },
  statusTextPending: {
    color: '#B45309',
  },
  memberMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  memberLastActive: {
    fontSize: 10.5,
    color: '#64748B',
  },
  memberActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  resendBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  revokeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  auditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 10,
  },
  auditCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  auditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginTop: 5,
  },
  auditContent: {
    flex: 1,
  },
  auditAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  auditMeta: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
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
    marginTop: 8,
    marginBottom: 4,
  },
  emptyCircleSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyAuditText: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
