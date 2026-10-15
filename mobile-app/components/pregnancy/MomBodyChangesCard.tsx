import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export interface BodyChangeItem {
  id: string;
  symptom: string;
  tip: string;
}

interface MomBodyChangesCardProps {
  changes: BodyChangeItem[];
}

export function MomBodyChangesCard({ changes }: MomBodyChangesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>🌸</Text>
        <Text style={styles.headerTitle}>What Mom Might Feel This Week</Text>
      </View>

      <Text style={styles.subText}>
        Every maternal body is unique. Here are common hormonal and physical adaptations expected during this week:
      </Text>

      <View style={styles.changesList}>
        {changes.map((item) => (
          <View key={item.id} style={styles.changeCard}>
            <View style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.symptomTitle}>{item.symptom}</Text>
            </View>
            <Text style={styles.tipText}>💡 Tip: {item.tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 12,
  },
  changesList: {
    gap: 8,
  },
  changeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
    marginRight: 8,
  },
  symptomTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    paddingLeft: 14,
  },
});
