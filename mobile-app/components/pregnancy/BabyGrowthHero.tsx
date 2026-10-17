import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';

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

      {/* Hero Fetus Centerpiece Banner (Screen 7) */}
      <View style={styles.fetusBannerContainer}>
        <Image
          source={require('../../assets/baby_fetus_week.jpg')}
          style={styles.fetusCenterImage}
          resizeMode="cover"
        />
      </View>

      {/* 3 Metric Pills (Screen 7: Banana, 26 cm, 300 g) */}
      <View style={styles.threeMetricsRow}>
        <View style={styles.metricChip}>
          <Text style={styles.metricChipEmoji}>{emoji}</Text>
          <View>
            <Text style={styles.metricChipLabel}>Baby Size</Text>
            <Text style={styles.metricChipValue}>{fruit}</Text>
          </View>
        </View>

        <View style={styles.metricChip}>
          <Text style={styles.metricChipEmoji}>📏</Text>
          <View>
            <Text style={styles.metricChipLabel}>Length</Text>
            <Text style={styles.metricChipValue}>{length}</Text>
          </View>
        </View>

        <View style={styles.metricChip}>
          <Text style={styles.metricChipEmoji}>⚖️</Text>
          <View>
            <Text style={styles.metricChipLabel}>Weight</Text>
            <Text style={styles.metricChipValue}>{weight}</Text>
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
  fetusBannerContainer: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fetusCenterImage: {
    width: '100%',
    height: '100%',
  },
  threeMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  metricChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricChipEmoji: {
    fontSize: 20,
  },
  metricChipLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  metricChipValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
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
