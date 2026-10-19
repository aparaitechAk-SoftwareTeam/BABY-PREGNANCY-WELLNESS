import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { ChevronRight, Sparkles, Calendar } from 'lucide-react-native';
import { contentApi } from '../../services/api/content.api';

interface UnifiedMilestoneCardProps {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  dueDate: string;
  onPressDetails?: () => void;
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

export function UnifiedMilestoneCard({
  currentWeek,
  currentDay,
  trimester,
  daysRemaining,
  dueDate,
  onPressDetails,
}: UnifiedMilestoneCardProps) {
  const [liveContent, setLiveContent] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    contentApi
      .getContentByWeek(currentWeek)
      .then((res) => {
        if (isMounted && res?.data?.data) {
          setLiveContent(res.data.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [currentWeek]);

  const totalDays = 280;
  const elapsedDays = Math.min(280, currentWeek * 7 + currentDay);
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  const fruitName = liveContent?.babySize || 'Baby';
  const fruitEmoji = getEmojiForFruit(fruitName);
  const lengthStr = liveContent?.babyLength || 'Clinical Growth';
  const weightStr = liveContent?.babyWeight || 'Developing';

  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const trimesterLabel =
    trimester === 1
      ? 'Trimester 1 • Foundation'
      : trimester === 2
      ? 'Trimester 2 • Golden Period'
      : 'Trimester 3 • Home Stretch';

  return (
    <View style={styles.card}>
      {/* Top Meta Badges */}
      <View style={styles.topRow}>
        <View style={styles.trimesterBadge}>
          <View style={styles.trimesterDot} />
          <Text style={styles.trimesterText}>{trimesterLabel}</Text>
        </View>

        <View style={styles.countdownPill}>
          <Text style={styles.countdownText}>⏱️ {daysRemaining} Days Left</Text>
        </View>
      </View>

      {/* Main Dual Hero: Left Fetus Circle + Right Baby Metrics */}
      <View style={styles.centerRow}>
        {/* Left Side: Circular Baby Womb Image */}
        <View style={styles.fetusRingContainer}>
          <Image
            source={require('../../assets/baby_fetus_week.jpg')}
            style={styles.fetusImage}
            resizeMode="cover"
          />
          <View style={styles.weekFloatingBadge}>
            <Text style={styles.weekFloatingBadgeText}>W{currentWeek}</Text>
          </View>
        </View>

        {/* Right Side: Week Info & Fruit Size Card */}
        <View style={styles.rightInfoCol}>
          <Text style={styles.weekHeroNumber}>
            Week {currentWeek}
            <Text style={styles.dayHeroNumber}>, Day {currentDay}</Text>
          </Text>
          <Text style={styles.dueDateText}>
            Due: <Text style={styles.dueDateHighlight}>{formattedDueDate}</Text>
          </Text>

          {/* Baby Size Pill */}
          <View style={styles.fruitStrip}>
            <Text style={styles.fruitEmoji}>{fruitEmoji}</Text>
            <View style={styles.fruitTextCol}>
              <Text style={styles.fruitTitle}>
                Size of a {fruitName}
              </Text>
              <Text style={styles.fruitMetrics}>
                {lengthStr} • {weightStr}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.milestoneRow}>
          <Text style={styles.milestoneText}>Conception</Text>
          <Text style={styles.milestoneCenterText}>{elapsedDays} of 280 Days ({progressPercent}%)</Text>
          <Text style={styles.milestoneText}>Birth (40 Wks)</Text>
        </View>
      </View>

      {/* Single Clear Action to explore Week Guide */}
      <TouchableOpacity
        style={styles.exploreActionBtn}
        onPress={onPressDetails}
        activeOpacity={0.85}
      >
        <Sparkles size={14} color="#E11D48" />
        <Text style={styles.exploreActionText}>
          Explore Week {currentWeek} Development & Ultrasound Guide
        </Text>
        <ChevronRight size={16} color="#E11D48" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trimesterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  trimesterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E11D48',
  },
  trimesterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  countdownPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  fetusRingContainer: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#FECDD3',
    padding: 3,
    backgroundColor: '#FFF1F2',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  fetusImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  weekFloatingBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#E11D48',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  weekFloatingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  rightInfoCol: {
    flex: 1,
  },
  weekHeroNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  dayHeroNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  dueDateText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  dueDateHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  milestoneText: {
    fontSize: 9.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  milestoneCenterText: {
    fontSize: 9.5,
    color: '#475569',
    fontWeight: '700',
  },
  fruitStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 10,
  },
  fruitEmoji: {
    fontSize: 28,
  },
  fruitTextCol: {
    flex: 1,
  },
  fruitTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  fruitMetrics: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  exploreActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF1F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  exploreActionText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E11D48',
    marginHorizontal: 6,
  },
});
