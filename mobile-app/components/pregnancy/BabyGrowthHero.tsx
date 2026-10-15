import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface BabyGrowthHeroProps {
  week: number;
  fruit: string;
  emoji: string;
  length: string;
  weight: string;
  headline: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export function BabyGrowthHero({
  week,
  fruit,
  emoji,
  length,
  weight,
  headline,
  isBookmarked,
  onToggleBookmark,
}: BabyGrowthHeroProps) {
  const trimester = week <= 12 ? 1 : week <= 27 ? 2 : 3;

  return (
    <View style={styles.card}>
      {/* Top Meta Bar */}
      <View style={styles.topBar}>
        <View style={styles.tagGroup}>
          <View style={styles.trimesterPill}>
            <Text style={styles.trimesterText}>Trimester {trimester}</Text>
          </View>
          <View style={styles.weekPill}>
            <Text style={styles.weekPillText}>Week {week}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onToggleBookmark}
          style={[styles.saveBtn, isBookmarked && styles.saveBtnActive]}
          activeOpacity={0.75}
        >
          <Text style={styles.saveIcon}>{isBookmarked ? '★' : '☆'}</Text>
          <Text style={[styles.saveLabel, isBookmarked && styles.saveLabelActive]}>
            {isBookmarked ? 'Saved' : 'Bookmark'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content Layout */}
      <View style={styles.bodyLayout}>
        <View style={styles.fruitOrb}>
          <Text style={styles.fruitEmoji}>{emoji}</Text>
        </View>

        <View style={styles.detailsCol}>
          <Text style={styles.subTitle}>BABY SIZE COMPARISON</Text>
          <Text style={styles.fruitTitle}>
            Size of a <Text style={styles.fruitName}>{fruit}</Text>
          </Text>

          {/* Metric Badges */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Length</Text>
              <Text style={styles.metricValue}>{length}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Weight</Text>
              <Text style={styles.metricValue}>{weight}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Editorial Headline */}
      <View style={styles.headlineBox}>
        <Text style={styles.headlineText}>{headline}</Text>
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
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  trimesterPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  trimesterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  weekPill: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  weekPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE123C',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  saveBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  saveIcon: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 4,
  },
  saveLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  saveLabelActive: {
    color: '#B45309',
    fontWeight: '700',
  },
  bodyLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  fruitOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fruitEmoji: {
    fontSize: 34,
  },
  detailsCol: {
    flex: 1,
  },
  subTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 2,
  },
  fruitTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  fruitName: {
    color: '#BE123C',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  headlineBox: {
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E11D48',
  },
  headlineText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
  },
});
