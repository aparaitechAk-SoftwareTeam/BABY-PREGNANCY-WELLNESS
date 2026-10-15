import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface MilestoneItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface FetalMilestonesCardProps {
  milestones: MilestoneItem[];
}

export function FetalMilestonesCard({ milestones }: FetalMilestonesCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTag}>DEVELOPMENT</Text>
        <Text style={styles.headerTitle}>Anatomical Milestones</Text>
      </View>

      <View style={styles.list}>
        {milestones.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.itemRow,
              index === milestones.length - 1 && styles.itemRowLast,
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.itemEmoji}>{item.icon}</Text>
            </View>

            <View style={styles.itemTextCol}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  headerRow: {
    marginBottom: 14,
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  list: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemRowLast: {
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 16,
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
  },
});
