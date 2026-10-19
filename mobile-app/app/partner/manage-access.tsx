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
  Check,
  X,
  RefreshCw,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useFamilyStore } from '../../store/family.store';
import { familyApi } from '../../services/api/family.api';

interface AccessLog {
  id: string;
  user: string;
  action: string;
  timeStr: string;
}

export default function ManageAccessScreen() {
  const router = useRouter();
  const profile = usePregnancyStore((state) => state.profile);

  const pairedMembers = useFamilyStore((state) => state.pairedMembers);
  const pendingRequests = useFamilyStore((state) => state.pendingRequests);
  const fetchMotherPairingInfo = useFamilyStore((state) => state.fetchMotherPairingInfo);
  const acceptCaregiverRequest = useFamilyStore((state) => state.acceptCaregiverRequest);
  const rejectCaregiverRequest = useFamilyStore((state) => state.rejectCaregiverRequest);
  const unlinkCaregiver = useFamilyStore((state) => state.unlinkCaregiver);
  const generateNewCode = useFamilyStore((state) => state.generateNewCode);

  const [auditLogs, setAuditLogs] = useState<AccessLog[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRelation, setInviteRelation] = useState('Partner / Husband');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    await fetchMotherPairingInfo();
    try {
      const logsRes = await familyApi.getAuditLogs();
      if (logsRes && logsRes.success && Array.isArray(logsRes.data)) {
        setAuditLogs(logsRes.data);
      }
    } catch {
      // Non-blocking
    }
  }, [fetchMotherPairingInfo]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAccept = async (id: string, name: string) => {
    setIsProcessing(id);
    try {
      const res = await acceptCaregiverRequest(id);
      if (res.success) {
        Alert.alert('Request Approved! 🎉', `${name} now has access to your authorized pregnancy vitals.`);
        await loadData();
      } else {
        Alert.alert('Action Failed', res.message);
      }
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = (id: string, name: string) => {
    Alert.alert(
      `Decline Caregiver Request?`,
      `Are you sure you want to decline access for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(id);
            try {
              const res = await rejectCaregiverRequest(id);
              if (res.success) {
                Alert.alert('Request Declined', `${name}'s request was declined.`);
                await loadData();
              } else {
                Alert.alert('Action Failed', res.message);
              }
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handleRevoke = (id: string, name: string) => {
    Alert.alert(
      `Revoke Access for ${name}?`,
      `They will immediately lose access to your pregnancy timeline, appointments, and vitals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke Access',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkCaregiver(id);
              Alert.alert('Access Revoked', `${name}'s access has been removed.`);
              await loadData();
            } catch {
              Alert.alert('Error', 'Could not revoke access. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleGenerateAdditionalCode = async () => {
    try {
      const code = await generateNewCode(inviteRelation);
      Alert.alert('New Code Generated! 🔑', `New invite code for ${inviteRelation}: ${code}\nShare this with them to request access.`);
      setShowInviteModal(false);
      await loadData();
    } catch {
      Alert.alert('Error', 'Could not generate invite code.');
    }
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
            <Text style={styles.formTitle}>Invite an Additional Caregiver</Text>
            <Text style={styles.inviteHelpText}>
              Generate a unique pairing code specifically for another family member or doula.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Relationship</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Doula / Grandmother / Sister"
                placeholderTextColor="#94A3B8"
                value={inviteRelation}
                onChangeText={setInviteRelation}
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
                onPress={handleGenerateAdditionalCode}
                activeOpacity={0.8}
              >
                <Send size={14} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Generate Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Pending Requests Section (Mother Security Gatekeeper) */}
        {pendingRequests.length > 0 && (
          <View style={{ marginBottom: 18 }}>
            <Text style={[styles.sectionHeading, { color: '#B45309' }]}>
              Pending Link Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.map((req) => (
              <View key={req.id} style={[styles.memberCard, { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }]}>
                <View style={styles.memberTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{req.name}</Text>
                    <Text style={styles.memberRelation}>{req.relationship} • {req.email || req.connectedDate}</Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={[styles.statusBadgeText, styles.statusTextPending]}>Awaiting Approval</Text>
                  </View>
                </View>

                <View style={styles.memberActionsRow}>
                  <TouchableOpacity
                    style={[styles.revokeBtn, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}
                    onPress={() => handleReject(req.id, req.name)}
                    disabled={isProcessing === req.id}
                    activeOpacity={0.8}
                  >
                    <X size={13} color="#DC2626" />
                    <Text style={styles.revokeBtnText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resendBtn, { backgroundColor: '#059669', borderColor: '#059669' }]}
                    onPress={() => handleAccept(req.id, req.name)}
                    disabled={isProcessing === req.id}
                    activeOpacity={0.8}
                  >
                    <Check size={13} color="#FFFFFF" />
                    <Text style={[styles.resendBtnText, { color: '#FFFFFF' }]}>Accept Access</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Current Active Caregivers */}
        <Text style={styles.sectionHeading}>Active Caregivers ({pairedMembers.length})</Text>

        {pairedMembers.length === 0 ? (
          <View style={styles.emptyCircleCard}>
            <Users size={28} color="#94A3B8" />
            <Text style={styles.emptyCircleTitle}>No Active Caregivers Linked</Text>
            <Text style={styles.emptyCircleSub}>
              Share your invite code with your partner or trusted family member. Once they enter it, you will see their request here to approve.
            </Text>
          </View>
        ) : (
          pairedMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relationship} • {member.email || member.connectedDate}</Text>
                </View>
                <View style={[styles.statusBadge, styles.statusActive]}>
                  <Text style={[styles.statusBadgeText, styles.statusTextActive]}>Active</Text>
                </View>
              </View>

              <View style={styles.memberMetaRow}>
                <Clock size={12} color="#64748B" />
                <Text style={styles.memberLastActive}>Connected {member.connectedDate}</Text>
              </View>

              <View style={styles.memberActionsRow}>
                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={() => handleRevoke(member.id, member.name)}
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
    marginBottom: 4,
  },
  inviteHelpText: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 16,
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
