import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Circle, ArrowRight, ListTodo, Plus } from 'lucide-react-native';
import { useRoutineStore } from '../../store/routine.store';

export function RoutineTrackerCard() {
  const router = useRouter();
  const tasks = useRoutineStore((state) => state.tasks);
  const toggleTask = useRoutineStore((state) => state.toggleTask);
  const loadTasks = useRoutineStore((state) => state.loadTasks);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Show top 3 pending or active tasks
  const previewTasks = tasks.slice(0, 4);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconContainer}>
            <ListTodo size={20} color="#E11D48" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.titleText}>Today's Routine & Tasks</Text>
            <Text style={styles.subtitleText}>
              {completed} of {total} completed ({percentage}%)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/routine')}
          style={styles.openFullBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.openFullText}>View All</Text>
          <ArrowRight size={14} color="#E11D48" />
        </TouchableOpacity>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>

      {/* Task Checklist Items */}
      <View style={styles.taskList}>
        {previewTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            onPress={() => toggleTask(task.id)}
            style={[styles.taskItem, task.isCompleted && styles.taskItemDone]}
            activeOpacity={0.8}
          >
            <View style={styles.checkboxWrapper}>
              {task.isCompleted ? (
                <CheckCircle2 size={20} color="#10B981" strokeWidth={2.5} />
              ) : (
                <Circle size={20} color="#94A3B8" strokeWidth={2} />
              )}
            </View>

            <View style={styles.taskTextCol}>
              <View style={styles.taskTitleRow}>
                <Text style={styles.taskEmoji}>{task.emoji}</Text>
                <Text
                  style={[styles.taskTitle, task.isCompleted && styles.taskTitleDone]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </View>
              <Text style={styles.taskTime}>{task.timeStr}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer Navigation */}
      <TouchableOpacity
        onPress={() => router.push('/routine')}
        style={styles.manageFooterBtn}
        activeOpacity={0.8}
      >
        <Text style={styles.manageFooterText}>
          Open Full Daily Routine ({tasks.length} Habits & Tasks) ›
        </Text>
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
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
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
    gap: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  openFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  openFullText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  taskList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  taskItemDone: {
    backgroundColor: '#F1F5F9',
    opacity: 0.75,
  },
  checkboxWrapper: {
    marginRight: 10,
  },
  taskTextCol: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  taskEmoji: {
    fontSize: 14,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  manageFooterBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  manageFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
