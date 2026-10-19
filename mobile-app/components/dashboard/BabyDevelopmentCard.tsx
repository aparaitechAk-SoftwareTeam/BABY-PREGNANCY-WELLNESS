import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { contentApi } from '../../services/api/content.api';

interface BabyDevelopmentCardProps {
  week: number;
  onPressExplore?: () => void;
}

const FRUIT_EMOJIS: Record<string, string> = {
  'poppy': '🌱',
  'raspberry': '🍓',
  'lime': '🍋',
  'avocado': '🥑',
  'banana': '🍌',
  'corn': '🌽',
  'eggplant': '🍆',
  'pineapple': '🍍',
  'papaya': '🍈',
  'watermelon': '🍉',
};

function getEmojiForFruit(fruitName?: string): string {
  if (!fruitName) return '🌱';
  const lower = fruitName.toLowerCase();
  for (const [key, emoji] of Object.entries(FRUIT_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '🌱';
}

export function BabyDevelopmentCard({ week, onPressExplore }: BabyDevelopmentCardProps) {
  const [liveContent, setLiveContent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getContentByWeek(week)
      .then((res) => {
        if (isMounted && res?.data?.data) {
          setLiveContent(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [week]);

  const fruit = liveContent?.babySize || 'Baby';
  const emoji = getEmojiForFruit(fruit);
  const length = liveContent?.babyLength || 'Clinical Growth';
  const weight = liveContent?.babyWeight || 'Active Growth';
  const insight =
    liveContent?.fetalHighlight ||
    liveContent?.summary ||
    `During Week ${week}, fetal organs and neural pathways continue rapid clinical development.`;

  const data = { fruit, emoji, length, weight, insight };

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
