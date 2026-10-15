import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ContentGovernanceNotice() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.icon}>🩺</Text>
        <Text style={styles.title}>Clinical Content Governance</Text>
      </View>
      <Text style={styles.bodyText}>
        All gestational development guides and maternal wellness topics are reviewed by certified maternal healthcare and obstetric professionals. This information is intended for educational reference and does not guarantee medical outcomes or replace personalized clinical diagnosis.
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Reviewed: October 2026</Text>
        <Text style={styles.bulletDot}>•</Text>
        <Text style={styles.metaText}>Source: Clinical Maternal Board</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: -0.1,
  },
  bodyText: {
    fontSize: 11.5,
    lineHeight: 16.5,
    color: '#64748B',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  bulletDot: {
    fontSize: 10,
    color: '#CBD5E1',
  },
});
