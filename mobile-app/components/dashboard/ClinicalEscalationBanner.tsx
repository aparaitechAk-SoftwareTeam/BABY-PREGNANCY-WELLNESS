import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ClinicalEscalationBannerProps {
  onEmergencyPress?: () => void;
  onHelpPress?: () => void;
}

export function ClinicalEscalationBanner({
  onEmergencyPress,
  onHelpPress,
}: ClinicalEscalationBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.iconText}>🛡️</Text>
          <Text style={styles.titleText}>Maternal Safety & Clinical Support</Text>
        </View>
        <Text style={styles.badgeText}>24/7 PROTOCOL</Text>
      </View>

      <Text style={styles.bodyText}>
        If you perceive reduced fetal movement, unusual pain, or severe symptoms, please seek prompt evaluation from your doctor or local maternity triage.
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={onEmergencyPress}
          style={styles.emergencyBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.emergencyBtnText}>🚨 Emergency SOS Triage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onHelpPress}
          style={styles.helpBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.helpBtnText}>Ask Maternal AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    marginRight: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyBtn: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  emergencyBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#BE123C',
  },
  helpBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
});
