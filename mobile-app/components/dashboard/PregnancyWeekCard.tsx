import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

interface PregnancyWeekCardProps {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  dueDate: string;
  onPressDetails?: () => void;
}

export function PregnancyWeekCard({
  currentWeek,
  currentDay,
  trimester,
  daysRemaining,
  dueDate,
  onPressDetails,
}: PregnancyWeekCardProps) {
  const totalDays = 280;
  const elapsedDays = Math.min(280, currentWeek * 7 + currentDay);
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

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
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPressDetails}
      style={styles.card}
    >
      {/* Top Meta Row */}
      <View style={styles.topRow}>
        <View style={styles.trimesterBadge}>
          <View style={styles.trimesterDot} />
          <Text style={styles.trimesterText}>{trimesterLabel}</Text>
        </View>

        <View style={styles.countdownPill}>
          <Text style={styles.countdownText}>
            ⏱️ {daysRemaining} Days to Arrival
          </Text>
        </View>
      </View>

      {/* Main Week & Progress Display */}
      <View style={styles.centerRow}>
        <View style={styles.weekInfoCol}>
          <Text style={styles.weekHeroNumber}>
            Week {currentWeek}
            <Text style={styles.dayHeroNumber}>, Day {currentDay}</Text>
          </Text>
          <Text style={styles.dueDateText}>
            Estimated Due Date: <Text style={styles.dueDateHighlight}>{formattedDueDate}</Text>
          </Text>
        </View>

        {/* Circular Percentage Pill */}
        <View style={styles.percentageCircle}>
          <Text style={styles.percentageNumber}>{progressPercent}%</Text>
          <Text style={styles.percentageLabel}>Complete</Text>
        </View>
      </View>

      {/* Gestational Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.milestoneRow}>
          <Text style={styles.milestoneText}>Conception</Text>
          <Text style={styles.milestoneCenterText}>
            {elapsedDays} of 280 Days
          </Text>
          <Text style={styles.milestoneText}>Birth (40 Wks)</Text>
        </View>
      </View>

      {/* Bottom Hint Action */}
      <View style={styles.footerRow}>
        <Text style={styles.footerActionText}>Tap to explore Week {currentWeek} developmental guide</Text>
        <Text style={styles.footerActionArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
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
    marginBottom: 14,
  },
  trimesterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  trimesterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E11D48',
  },
  trimesterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
    letterSpacing: -0.2,
  },
  countdownPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weekInfoCol: {
    flex: 1,
  },
  weekHeroNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  dayHeroNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
  },
  dueDateText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  dueDateHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  percentageCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E11D48',
  },
  percentageNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E11D48',
  },
  percentageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E11D48',
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 4,
  },
  milestoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  milestoneCenterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerActionText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  footerActionArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E11D48',
    marginLeft: 6,
  },
});
