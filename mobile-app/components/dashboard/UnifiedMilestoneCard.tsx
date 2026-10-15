import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ChevronRight, Sparkles, Calendar } from 'lucide-react-native';

interface UnifiedMilestoneCardProps {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  dueDate: string;
  onPressDetails?: () => void;
}

const WEEK_DEVELOPMENTS: Record<
  number,
  { fruit: string; emoji: string; length: string; weight: string; insight: string }
> = {
  4: { fruit: 'Poppy Seed', emoji: '🌱', length: '1 mm', weight: '< 1 g', insight: 'Neural tube is forming and blastocyst is safely implanting.' },
  8: { fruit: 'Raspberry', emoji: '🍓', length: '1.6 cm', weight: '1 g', insight: 'Tiny fingers & toes developing. Heart beats at 150 bpm!' },
  12: { fruit: 'Lime', emoji: '🍋', length: '5.4 cm', weight: '14 g', insight: 'All vital organs, reflexes, and vocal cords are formed.' },
  16: { fruit: 'Avocado', emoji: '🥑', length: '11.6 cm', weight: '100 g', insight: 'Baby can make facial expressions and sense light.' },
  20: { fruit: 'Banana', emoji: '🍌', length: '25.6 cm', weight: '300 g', insight: 'You may feel gentle flutters (quickening)! Vernix protects skin.' },
  24: { fruit: 'Ear of Corn', emoji: '🌽', length: '30 cm', weight: '600 g', insight: 'Hearing is active; baby recognizes your voice and heartbeat.' },
  28: { fruit: 'Eggplant', emoji: '🍆', length: '37 cm', weight: '1 kg', insight: 'Eyes can blink and baby has regular sleep-wake cycles.' },
  32: { fruit: 'Pineapple', emoji: '🍍', length: '42 cm', weight: '1.7 kg', insight: 'Bones are hardening and baby is gaining healthy baby fat.' },
  36: { fruit: 'Papaya', emoji: '🍈', length: '47 cm', weight: '2.6 kg', insight: 'Lungs are nearly mature; baby is settling into the pelvis.' },
  40: { fruit: 'Watermelon', emoji: '🍉', length: '51 cm', weight: '3.4 kg', insight: 'Full term and ready to take their very first breath!' },
};

function getWeekData(week: number) {
  const keys = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  let selected = keys[0];
  for (const k of keys) {
    if (week >= k) selected = k;
  }
  return WEEK_DEVELOPMENTS[selected] || WEEK_DEVELOPMENTS[24];
}

export function UnifiedMilestoneCard({
  currentWeek,
  currentDay,
  trimester,
  daysRemaining,
  dueDate,
  onPressDetails,
}: UnifiedMilestoneCardProps) {
  const totalDays = 280;
  const elapsedDays = Math.min(280, currentWeek * 7 + currentDay);
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

  const weekData = getWeekData(currentWeek);

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

      {/* Hero Week & Progress Display */}
      <View style={styles.centerRow}>
        <View style={styles.weekInfoCol}>
          <Text style={styles.weekHeroNumber}>
            Week {currentWeek}
            <Text style={styles.dayHeroNumber}>, Day {currentDay}</Text>
          </Text>
          <Text style={styles.dueDateText}>
            Due: <Text style={styles.dueDateHighlight}>{formattedDueDate}</Text>
          </Text>
        </View>

        <View style={styles.percentageCircle}>
          <Text style={styles.percentageNumber}>{progressPercent}%</Text>
          <Text style={styles.percentageLabel}>Complete</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.milestoneRow}>
          <Text style={styles.milestoneText}>Conception</Text>
          <Text style={styles.milestoneCenterText}>{elapsedDays} of 280 Days</Text>
          <Text style={styles.milestoneText}>Birth (40 Wks)</Text>
        </View>
      </View>

      {/* Integrated Baby Size Comparison Banner */}
      <View style={styles.fruitStrip}>
        <Text style={styles.fruitEmoji}>{weekData.emoji}</Text>
        <View style={styles.fruitTextCol}>
          <Text style={styles.fruitTitle}>
            Baby is the size of an {weekData.fruit}
          </Text>
          <Text style={styles.fruitMetrics}>
            Approx. {weekData.length} • {weekData.weight}
          </Text>
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
          Explore Week {currentWeek} Milestone Guide & Baby Development
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weekInfoCol: {
    flex: 1,
  },
  weekHeroNumber: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  dayHeroNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#64748B',
  },
  dueDateText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  dueDateHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  percentageCircle: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E11D48',
  },
  percentageLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
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
