import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Linking,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import {
  AlertTriangle,
  Phone,
  X,
  ShieldAlert,
  Ambulance,
  HeartHandshake,
  Share2,
  MapPin,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface EmergencySOSModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EmergencySOSModal({ visible, onClose }: EmergencySOSModalProps) {
  const profile = usePregnancyStore((state) => state.profile);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const doctorName = profile?.doctorName || 'Dr. Priya Sharma';
  const hospitalName = profile?.hospitalName || 'Apollo Cradle Maternity Hospital';
  const hospitalPhone = profile?.doctorPhone || '+91 98765 43210';
  const emergencyContactName = profile?.emergencyContactName || 'Rahul Sharma (Partner)';
  const emergencyContactPhone = profile?.emergencyContactPhone || '+91 98765 43210';
  const nationalAmbulance = '108';
  const policeEmergency = '112';

  const handleDialNumber = (phone: string, label: string) => {
    const cleanNumber = phone.replace(/[^0-9+]/g, '');
    Alert.alert(
      `Emergency Call`,
      `Dial ${label} (${cleanNumber}) immediately?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${cleanNumber}`),
        },
      ]
    );
  };

  const handleShareDistressLocation = async () => {
    const message = `🚨 EMERGENCY MEDICAL ALERT 🚨\nI am currently experiencing urgent maternal symptoms at Week ${currentWeek} of pregnancy.\n\nAttending Hospital: ${hospitalName}\nDoctor: ${doctorName} (${hospitalPhone})\nPlease send help or contact me immediately!`;
    try {
      await Share.share({
        title: 'EMERGENCY: Urgent Pregnancy Assistance Needed',
        message,
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header Banner */}
          <View style={styles.emergencyHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.sosBadge}>
                <View style={styles.pulsingDot} />
                <Text style={styles.sosBadgeText}>EMERGENCY SOS</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.emergencyMainTitle}>Rapid Obstetric Triage</Text>
            <Text style={styles.emergencySubtitle}>
              Week {currentWeek} • Immediate clinical assistance and ambulance dispatch
            </Text>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Primary Action 1: Hospital Triage */}
            <TouchableOpacity
              style={styles.primaryCallCard}
              onPress={() => handleDialNumber(hospitalPhone, `${hospitalName} Triage`)}
              activeOpacity={0.85}
            >
              <View style={styles.callIconCircle}>
                <Phone size={22} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.callDetails}>
                <Text style={styles.callTypeLabel}>24/7 MATERNITY HOSPITAL TRIAGE</Text>
                <Text style={styles.callTargetName}>{hospitalName}</Text>
                <Text style={styles.callSubInfo}>{doctorName} • {hospitalPhone}</Text>
              </View>
              <View style={styles.callNowPill}>
                <Text style={styles.callNowPillText}>CALL</Text>
              </View>
            </TouchableOpacity>

            {/* Primary Action 2: National Ambulance */}
            <TouchableOpacity
              style={[styles.primaryCallCard, styles.ambulanceCard]}
              onPress={() => handleDialNumber(nationalAmbulance, 'National Ambulance (108)')}
              activeOpacity={0.85}
            >
              <View style={[styles.callIconCircle, { backgroundColor: '#DC2626' }]}>
                <Ambulance size={22} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.callDetails}>
                <Text style={[styles.callTypeLabel, { color: '#B91C1C' }]}>
                  NATIONAL EMERGENCY AMBULANCE
                </Text>
                <Text style={styles.callTargetName}>Ambulance Dispatch (108 / 112)</Text>
                <Text style={styles.callSubInfo}>Free emergency response service</Text>
              </View>
              <View style={[styles.callNowPill, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.callNowPillText}>108</Text>
              </View>
            </TouchableOpacity>

            {/* Primary Action 3: Emergency Contact / Partner */}
            <TouchableOpacity
              style={[styles.primaryCallCard, styles.contactCard]}
              onPress={() => handleDialNumber(emergencyContactPhone, emergencyContactName)}
              activeOpacity={0.85}
            >
              <View style={[styles.callIconCircle, { backgroundColor: '#059669' }]}>
                <HeartHandshake size={22} color="#FFFFFF" strokeWidth={2.5} />
              </View>
              <View style={styles.callDetails}>
                <Text style={[styles.callTypeLabel, { color: '#047857' }]}>
                  PRIMARY EMERGENCY CONTACT
                </Text>
                <Text style={styles.callTargetName}>{emergencyContactName}</Text>
                <Text style={styles.callSubInfo}>{emergencyContactPhone}</Text>
              </View>
              <View style={[styles.callNowPill, { backgroundColor: '#059669' }]}>
                <Text style={styles.callNowPillText}>CALL</Text>
              </View>
            </TouchableOpacity>

            {/* Action 4: Share Distress Alert */}
            <TouchableOpacity
              style={styles.shareAlertBtn}
              onPress={handleShareDistressLocation}
              activeOpacity={0.85}
            >
              <Share2 size={16} color="#0F172A" />
              <Text style={styles.shareAlertBtnText}>
                Broadcast SOS Alert with Hospital Details
              </Text>
            </TouchableOpacity>

            {/* Red Flag Symptoms Checklist */}
            <View style={styles.checklistCard}>
              <View style={styles.checklistHeader}>
                <ShieldAlert size={16} color="#DC2626" />
                <Text style={styles.checklistTitle}>Seek Immediate Emergency Care If Experiencing:</Text>
              </View>

              <Text style={styles.checklistItem}>
                🩸 <Text style={styles.boldText}>Vaginal Bleeding</Text> or sudden fluid gush / leak.
              </Text>
              <Text style={styles.checklistItem}>
                ⚡ <Text style={styles.boldText}>Severe Abdominal Pain</Text> that is persistent or rigid.
              </Text>
              <Text style={styles.checklistItem}>
                👣 <Text style={styles.boldText}>Drastic Drop in Baby Kicks</Text> (Under 10 kicks in 2 hours).
              </Text>
              <Text style={styles.checklistItem}>
                👁️ <Text style={styles.boldText}>Severe Headache / Vision Blur</Text> with facial swelling.
              </Text>
              <Text style={styles.checklistItem}>
                🌡️ <Text style={styles.boldText}>High Maternal Fever</Text> (&gt;38.5°C) with chills.
              </Text>
            </View>

            {/* Regulatory Disclaimer (PRD Sec 19) */}
            <View style={styles.disclaimerBox}>
              <Info size={14} color="#64748B" />
              <Text style={styles.disclaimerText}>
                AparaiTech is a tracking companion and not an emergency response service. If in doubt or in acute distress, call 108 or proceed to the nearest emergency ward immediately.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  emergencyHeader: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  sosBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#FEE2E2',
    marginTop: 2,
    fontWeight: '500',
  },
  modalBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 32,
  },
  primaryCallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  ambulanceCard: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  contactCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  callIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callDetails: {
    flex: 1,
  },
  callTypeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#BE123C',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  callTargetName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  callSubInfo: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  callNowPill: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  callNowPillText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  shareAlertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  shareAlertBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 12.5,
  },
  checklistCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  checklistItem: {
    fontSize: 11.5,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 28,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
});
