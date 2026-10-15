import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface BabyDevelopmentCardProps {
  week: number;
  onPressExplore?: () => void;
}

// 40-Week developmental data catalog
const WEEK_DEVELOPMENTS: Record<number, { fruit: string; emoji: string; length: string; weight: string; insight: string }> = {
  4: {
    fruit: 'Poppy Seed',
    emoji: '🌱',
    length: '1 mm',
    weight: '< 1 g',
    insight: 'The blastocyst is safely implanting into your uterine wall. The neural tube is beginning to form.',
  },
  8: {
    fruit: 'Raspberry',
    emoji: '🍓',
    length: '1.6 cm',
    weight: '1 g',
    insight: 'Little webbed fingers and toes are developing. Your baby’s heart is beating at 150 bpm!',
  },
  12: {
    fruit: 'Lime',
    emoji: '🍋',
    length: '5.4 cm',
    weight: '14 g',
    insight: 'All vital organs, reflex muscles, and tiny vocal cords are completely formed.',
  },
  16: {
    fruit: 'Avocado',
    emoji: '🥑',
    length: '11.6 cm',
    weight: '100 g',
    insight: 'Baby can make facial expressions and may react to bright light through your belly.',
  },
  20: {
    fruit: 'Banana',
    emoji: '🍌',
    length: '25.6 cm',
    weight: '300 g',
    insight: 'You may start feeling the first gentle flutters (quickening)! Vernix protects delicate baby skin.',
  },
  24: {
    fruit: 'Ear of Corn',
    emoji: '🌽',
    length: '30 cm',
    weight: '600 g',
    insight: 'Hearing is well-developed. Your baby can now recognize maternal voice cadences and heartbeat.',
  },
  28: {
    fruit: 'Eggplant',
    emoji: '🍆',
    length: '37 cm',
    weight: '1 kg',
    insight: 'Eyes can blink! Baby has regular sleep and wake cycles and is practicing breathing movements.',
  },
  32: {
    fruit: 'Pineapple',
    emoji: '🍍',
    length: '42 cm',
    weight: '1.7 kg',
    insight: 'Bones are hardening while skull remains pliable. Baby is gaining insulating body fat.',
  },
  36: {
    fruit: 'Papaya',
    emoji: '🍈',
    length: '47 cm',
    weight: '2.6 kg',
    insight: 'Lungs are nearly mature. Baby is dropping lower into your pelvis in preparation for birth.',
  },
  40: {
    fruit: 'Watermelon',
    emoji: '🍉',
    length: '51 cm',
    weight: '3.4 kg',
    insight: 'Full term and ready to meet you! Ready to take their very first breath and be held.',
  },
};

function getWeekData(week: number) {
  const keys = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  let selected = keys[0];
  for (const k of keys) {
    if (week >= k) selected = k;
  }
  return WEEK_DEVELOPMENTS[selected] || WEEK_DEVELOPMENTS[20];
}

export function BabyDevelopmentCard({ week, onPressExplore }: BabyDevelopmentCardProps) {
  const data = getWeekData(week);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPressExplore}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>WEEK {week} DEVELOPMENT</Text>
        </View>
        <Text style={styles.disclaimerHint}>Non-diagnostic clinical guide</Text>
      </View>

      <View style={styles.contentRow}>
        {/* Large Emoji Circle */}
        <View style={styles.emojiCircle}>
          <Text style={styles.emojiText}>{data.emoji}</Text>
          <Text style={styles.fruitTag}>{data.fruit}</Text>
        </View>

        {/* Development Insights */}
        <View style={styles.insightsCol}>
          <Text style={styles.comparisonHeadline}>
            Size of a <Text style={styles.fruitNameHighlight}>{data.fruit}</Text>
          </Text>

          {/* Dimension Pills */}
          <View style={styles.dimensionRow}>
            <View style={styles.dimensionPill}>
              <Text style={styles.dimensionLabel}>Length: </Text>
              <Text style={styles.dimensionValue}>{data.length}</Text>
            </View>
            <View style={styles.dimensionPill}>
              <Text style={styles.dimensionLabel}>Weight: </Text>
              <Text style={styles.dimensionValue}>{data.weight}</Text>
            </View>
          </View>

          <Text style={styles.insightText} numberOfLines={3}>
            {data.insight}
          </Text>
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.exploreText}>View anatomical milestones & symptoms</Text>
        <Text style={styles.exploreArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  disclaimerHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  emojiText: {
    fontSize: 38,
  },
  fruitTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 3,
  },
  insightsCol: {
    flex: 1,
  },
  comparisonHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  fruitNameHighlight: {
    color: '#0284C7',
  },
  dimensionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  dimensionPill: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0,
  },
  dimensionLabel: {
    fontSize: 10,
    color: '#0284C7',
    fontWeight: '600',
  },
  dimensionValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  insightText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  exploreText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  exploreArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },
});
