import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Stethoscope,
  TestTube,
  FileText,
  AlertCircle,
  FolderLock,
} from 'lucide-react-native';
import { useTimelineStore } from '../../store/timeline.store';
import { useRoutineStore } from '../../store/routine.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export function SmartTimelineCard() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const routineTasks = useRoutineStore((state) => state.tasks);
  const pendingHabits = routineTasks.filter((t) => !t.isCompleted);

  const timelineItems = useTimelineStore((state) => state.items);
  const fetchTimeline = useTimelineStore((state) => state.fetchTimeline);

  React.useEffect(() => {
    fetchTimeline(currentWeek);
  }, [currentWeek, fetchTimeline]);

  // Find the next upcoming clinical event or appointment
  const nextEvent =
    timelineItems.find((item) => item.status === 'today' && !item.isCompleted) ||
    timelineItems.find((item) => item.status === 'upcoming');

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Calendar size={16} color="#E11D48" strokeWidth={2.5} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Smart Pregnancy Timeline</Text>
            <Text style={styles.cardSub}>Week {currentWeek || 20} Care Map</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/timeline')}
          style={styles.viewAllBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={14} color="#E11D48" />
        </TouchableOpacity>
      </View>

      {/* Next Upcoming Clinical Event Card */}
      {nextEvent ? (
        <TouchableOpacity
          style={styles.nextEventBox}
          onPress={() => router.push('/timeline')}
          activeOpacity={0.8}
        >
          <View style={styles.nextEventTop}>
            <View style={styles.nextBadge}>
              <Text style={styles.nextBadgeText}>NEXT UP</Text>
            </View>
            <Text style={styles.nextEventDate}>{nextEvent.dateStr}</Text>
          </View>

          <Text style={styles.nextEventTitle}>{nextEvent.title}</Text>

          {nextEvent.doctorOrLocation ? (
            <Text style={styles.nextEventDoctor}>{nextEvent.doctorOrLocation}</Text>
          ) : null}

          {nextEvent.clinicalAction ? (
            <View style={styles.actionPill}>
              <AlertCircle size={11} color="#92400E" />
              <Text style={styles.actionPillText}>{nextEvent.clinicalAction}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.noEventBox}
          onPress={() => router.push('/timeline')}
          activeOpacity={0.8}
        >
          <Sparkles size={16} color="#059669" />
          <Text style={styles.noEventText}>
            No urgent clinical visits scheduled. Tap to view your complete week-by-week Care Timeline.
          </Text>
        </TouchableOpacity>
      )}

      {/* Incomplete Daily Logs / Routine Status */}
      <View style={styles.dailyHabitsStrip}>
        <View style={styles.habitsStatusRow}>
          <Clock size={14} color="#D97706" />
          <Text style={styles.habitsStatusText}>
            {pendingHabits.length > 0
              ? `${pendingHabits.length} daily habits remaining for today`
              : 'All daily habits completed! 🎉'}
          </Text>
        </View>

        {pendingHabits.length > 0 ? (
          <TouchableOpacity
            onPress={() => router.push('/routine')}
            style={styles.completeHabitBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.completeHabitBtnText}>Log Now ›</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Bottom Dual Shortcuts: Timeline & Medical Vault */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => router.push('/timeline')}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color="#0EA5E9" />
          <Text style={styles.shortcutBtnText}>Care Timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shortcutBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
          onPress={() => router.push('/vault')}
          activeOpacity={0.8}
        >
          <FolderLock size={14} color="#059669" />
          <Text style={[styles.shortcutBtnText, { color: '#059669' }]}>
            Document Vault
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  nextEventBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  nextEventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nextBadge: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  nextEventDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  nextEventTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  nextEventDoctor: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  actionPillText: {
    fontSize: 10.5,
    color: '#92400E',
    fontWeight: '600',
  },
  dailyHabitsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  habitsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  habitsStatusText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  completeHabitBtn: {
    paddingLeft: 6,
  },
  completeHabitBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shortcutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 6,
  },
  shortcutBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  noEventBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  noEventText: {
    flex: 1,
    fontSize: 11.5,
    color: '#166534',
    lineHeight: 16,
    fontWeight: '500',
  },
});
