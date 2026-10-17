import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppointmentStore } from '../../store/appointment.store';
import { useRoutineStore } from '../../store/routine.store';

interface TodayRemindersCardProps {
  waterLoggedMl?: number;
  waterGoalMl?: number;
  onAddWater?: (amount: number) => void;
  onViewAppointments?: () => void;
}

export function TodayRemindersCard({
  waterLoggedMl = 0,
  waterGoalMl = 2500,
  onAddWater,
  onViewAppointments,
}: TodayRemindersCardProps) {
  const router = useRouter();
  const tasks = useRoutineStore((state) => state.tasks);
  const toggleTask = useRoutineStore((state) => state.toggleTask);
  const appointments = useAppointmentStore((state) => state.appointments);
  const nextAppointment = appointments.find((a) => !a.isCompleted) || appointments[0];

  const waterPercent = Math.min(100, Math.round((waterLoggedMl / waterGoalMl) * 100));

  // Preview first 3 routine tasks
  const previewTasks = tasks.slice(0, 3);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.titleIcon}>📋</Text>
          <Text style={styles.titleText}>Today's Routine & Tasks</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/routine')}
          style={styles.fullRoutineBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.fullRoutineText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      {/* Hydration Interactive Bar */}
      <View style={styles.hydrationBox}>
        <View style={styles.hydrationHeader}>
          <View style={styles.hydrationLabelCol}>
            <Text style={styles.hydrationTitle}>💧 Daily Water Intake</Text>
            <Text style={styles.hydrationSubtitle}>
              {waterLoggedMl} ml of {waterGoalMl} ml ({waterPercent}%)
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => onAddWater?.(250)}
            style={styles.addWaterBtn}
            activeOpacity={0.75}
          >
            <Text style={styles.addWaterText}>+250 ml</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.waterProgressTrack}>
          <View style={[styles.waterProgressFill, { width: `${waterPercent}%` }]} />
        </View>
      </View>

      {/* Routine Task Items */}
      <View style={styles.tasksList}>
        {previewTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => toggleTask(task.id)}
            style={[styles.taskItem, task.isCompleted && styles.taskItemDone]}
            activeOpacity={0.8}
          >
            <View style={[styles.checkboxSquare, task.isCompleted && styles.checkboxDone]}>
              {task.isCompleted && <Text style={styles.checkIcon}>✓</Text>}
            </View>
            <View style={styles.taskTextCol}>
              <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleDone]}>
                {task.title}
              </Text>
              <Text style={styles.taskTime}>{task.timeStr} • {task.timeOfDay}</Text>
            </View>
            <Text style={styles.taskEmoji}>{task.emoji}</Text>
          </TouchableOpacity>
        ))}

        {/* View Full Daily Routine Link */}
        <TouchableOpacity
          onPress={() => router.push('/routine')}
          style={styles.viewFullRoutineActionBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.viewFullRoutineActionText}>
            📋 Open Full Routine & Habits ({tasks.filter(t => t.isCompleted).length}/{tasks.length} Done) ›
          </Text>
        </TouchableOpacity>

        {/* Upcoming Clinic Visit */}
        <TouchableOpacity
          onPress={onViewAppointments}
          style={styles.appointmentBanner}
          activeOpacity={0.8}
        >
          <View style={styles.appointmentLeft}>
            <Text style={styles.appointmentBadge}>UPCOMING APPOINTMENT</Text>
            <Text style={styles.appointmentTitle}>
              {nextAppointment ? nextAppointment.title : 'No upcoming visits scheduled'}
            </Text>
            <Text style={styles.appointmentDoctor}>
              {nextAppointment
                ? `${nextAppointment.doctorName} • ${nextAppointment.hospitalName} (${nextAppointment.dateStr} at ${nextAppointment.timeStr})`
                : 'Tap to schedule your prenatal visit & reminders'}
            </Text>
          </View>
          <Text style={styles.appointmentArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  todayDateText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  hydrationBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  hydrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hydrationLabelCol: {
    flex: 1,
  },
  hydrationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hydrationSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  addWaterBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addWaterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  waterProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 3,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  checkboxDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  taskTextCol: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  taskEmoji: {
    fontSize: 16,
    marginLeft: 6,
  },
  appointmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  appointmentLeft: {
    flex: 1,
  },
  appointmentBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#E11D48',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  appointmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  appointmentDoctor: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  appointmentArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 8,
  },
  fullRoutineBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF1F2',
  },
  fullRoutineText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  viewFullRoutineActionBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 4,
  },
  viewFullRoutineActionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
});
