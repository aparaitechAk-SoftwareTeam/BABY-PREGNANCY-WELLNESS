import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Sparkles,
  Info,
  X,
  Trash2,
  Heart,
} from 'lucide-react-native';
import { useRoutineStore, RoutineTask } from '../../store/routine.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

const TIME_OF_DAY_SECTIONS: { key: RoutineTask['timeOfDay']; title: string; emoji: string }[] = [
  { key: 'morning', title: 'Morning Routine', emoji: '🌅' },
  { key: 'afternoon', title: 'Afternoon Care', emoji: '☀️' },
  { key: 'evening', title: 'Evening Wellness', emoji: '🌆' },
  { key: 'night', title: 'Night & Rest', emoji: '🌙' },
];

export default function RoutineScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const tasks = useRoutineStore((state) => state.tasks);
  const toggleTask = useRoutineStore((state) => state.toggleTask);
  const addTask = useRoutineStore((state) => state.addTask);
  const deleteTask = useRoutineStore((state) => state.deleteTask);
  const resetTodayTasks = useRoutineStore((state) => state.resetTodayTasks);
  const loadTasks = useRoutineStore((state) => state.loadTasks);

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRationaleId, setExpandedRationaleId] = useState<string | null>(null);

  // Form State for Add Task
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTime, setNewTime] = useState('03:00 PM');
  const [newTimeOfDay, setNewTimeOfDay] = useState<RoutineTask['timeOfDay']>('afternoon');
  const [newCategory, setNewCategory] = useState<RoutineTask['category']>('custom');
  const [newEmoji, setNewEmoji] = useState('✨');

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === 'pending') return !task.isCompleted;
    if (activeFilter === 'completed') return task.isCompleted;
    return true;
  });

  const handleCreateTask = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a name for your routine task.');
      return;
    }

    await addTask({
      title: newTitle.trim(),
      category: newCategory,
      timeStr: newTime.trim() || 'All Day',
      timeOfDay: newTimeOfDay,
      emoji: newEmoji || '⭐',
      description: newDescription.trim() || 'Personal pregnancy wellness routine task.',
    });

    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const handleConfirmReset = () => {
    Alert.alert(
      'Reset Today Tasks?',
      'This will uncheck all tasks for today so you can start fresh.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetTodayTasks },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Today's Routine & Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Week {currentWeek} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addTaskHeaderBtn}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Progress Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>DAILY COMPLETION</Text>
              <Text style={styles.heroStatsText}>
                {completed} of {total} Tasks Done
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{percentage}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>

          <View style={styles.heroBottomRow}>
            <Text style={styles.heroEncouragement}>
              {percentage === 100
                ? '🎉 Amazing! You completed all prenatal habits today!'
                : percentage >= 50
                ? '🌸 You are doing wonderfully, Mama! Keep it up.'
                : '✨ Small daily habits nurture a healthy baby.'}
            </Text>

            <TouchableOpacity onPress={handleConfirmReset} activeOpacity={0.7}>
              <Text style={styles.resetLinkText}>Reset Today</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setActiveFilter('all')}
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>
              All ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('pending')}
            style={[styles.filterPill, activeFilter === 'pending' && styles.filterPillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, activeFilter === 'pending' && styles.filterPillTextActive]}>
              Pending ({tasks.filter((t) => !t.isCompleted).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter('completed')}
            style={[styles.filterPill, activeFilter === 'completed' && styles.filterPillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, activeFilter === 'completed' && styles.filterPillTextActive]}>
              Done ({tasks.filter((t) => t.isCompleted).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Tasks Grouped by Time of Day */}
        {TIME_OF_DAY_SECTIONS.map((section) => {
          const sectionTasks = filteredTasks.filter((t) => t.timeOfDay === section.key);
          if (sectionTasks.length === 0) return null;

          return (
            <View key={section.key} style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {section.emoji} {section.title}
                </Text>
                <Text style={styles.sectionBadge}>
                  {sectionTasks.filter((t) => t.isCompleted).length}/{sectionTasks.length} Done
                </Text>
              </View>

              <View style={styles.tasksList}>
                {sectionTasks.map((task) => {
                  const isExpanded = expandedRationaleId === task.id;

                  return (
                    <View
                      key={task.id}
                      style={[styles.taskCard, task.isCompleted && styles.taskCardCompleted]}
                    >
                      <View style={styles.taskCardMainRow}>
                        {/* Checkbox Trigger */}
                        <TouchableOpacity
                          onPress={() => toggleTask(task.id)}
                          style={styles.checkboxTouch}
                          activeOpacity={0.7}
                        >
                          {task.isCompleted ? (
                            <CheckCircle2 size={24} color="#10B981" strokeWidth={2.5} />
                          ) : (
                            <Circle size={24} color="#94A3B8" strokeWidth={2} />
                          )}
                        </TouchableOpacity>

                        {/* Task Info */}
                        <TouchableOpacity
                          onPress={() => toggleTask(task.id)}
                          style={styles.taskTextCol}
                          activeOpacity={0.8}
                        >
                          <View style={styles.taskHeadingRow}>
                            <Text style={styles.taskEmoji}>{task.emoji}</Text>
                            <Text
                              style={[
                                styles.taskTitle,
                                task.isCompleted && styles.taskTitleCompleted,
                              ]}
                            >
                              {task.title}
                            </Text>
                          </View>

                          <Text style={styles.taskDescription}>{task.description}</Text>

                          <View style={styles.metaRow}>
                            <View style={styles.timeTag}>
                              <Clock size={12} color="#64748B" />
                              <Text style={styles.timeTagText}>{task.timeStr}</Text>
                            </View>

                            {task.completedAt && (
                              <Text style={styles.completedAtTag}>Done at {task.completedAt}</Text>
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Expand Clinical Rationale or Delete */}
                        <View style={styles.actionCol}>
                          {task.clinicalRationale && (
                            <TouchableOpacity
                              onPress={() =>
                                setExpandedRationaleId(isExpanded ? null : task.id)
                              }
                              style={styles.infoBtn}
                              activeOpacity={0.7}
                            >
                              <Info
                                size={17}
                                color={isExpanded ? '#E11D48' : '#94A3B8'}
                              />
                            </TouchableOpacity>
                          )}

                          {task.category === 'custom' && (
                            <TouchableOpacity
                              onPress={() => deleteTask(task.id)}
                              style={styles.deleteBtn}
                              activeOpacity={0.7}
                            >
                              <Trash2 size={16} color="#DC2626" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>

                      {/* Expandable Clinical Rationale */}
                      {isExpanded && task.clinicalRationale && (
                        <View style={styles.rationaleBox}>
                          <Text style={styles.rationaleTitle}>💡 Doctor & Clinical Rationale</Text>
                          <Text style={styles.rationaleText}>{task.clinicalRationale}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {filteredTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌸</Text>
            <Text style={styles.emptyTitle}>No tasks in this view</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'pending'
                ? 'All scheduled tasks for today are checked off! Great job!'
                : 'No tasks scheduled. Tap the + button to add one.'}
            </Text>
          </View>
        )}

        {/* Floating Add Task Button */}
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.floatingAddBtn}
          activeOpacity={0.85}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.floatingAddText}>Add Custom Routine Task</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ========================================================
          ADD CUSTOM TASK MODAL
          ======================================================== */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Routine Task</Text>
                <Text style={styles.modalSubtitle}>Create a habit for your pregnancy journey</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Task Title */}
              <Text style={styles.inputLabel}>Task Name *</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Iron tablet with orange juice"
                placeholderTextColor="#94A3B8"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              {/* Scheduled Time */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. 04:00 PM"
                    placeholderTextColor="#94A3B8"
                    value={newTime}
                    onChangeText={setNewTime}
                  />
                </View>
                <View style={{ width: 80 }}>
                  <Text style={styles.inputLabel}>Icon</Text>
                  <TextInput
                    style={[styles.inputField, { textAlign: 'center' }]}
                    placeholder="✨"
                    value={newEmoji}
                    onChangeText={setNewEmoji}
                  />
                </View>
              </View>

              {/* Time of Day */}
              <Text style={styles.inputLabel}>Routine Period</Text>
              <View style={styles.timeOfDayRow}>
                {(['morning', 'afternoon', 'evening', 'night'] as const).map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setNewTimeOfDay(period)}
                    style={[
                      styles.periodPill,
                      newTimeOfDay === period && styles.periodPillActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.periodPillText,
                        newTimeOfDay === period && styles.periodPillTextActive,
                      ]}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={styles.inputLabel}>Notes / Instructions</Text>
              <TextInput
                style={[styles.inputField, { height: 75, textAlignVertical: 'top' }]}
                placeholder="e.g. Avoid taking with dairy or tea."
                placeholderTextColor="#94A3B8"
                multiline
                value={newDescription}
                onChangeText={setNewDescription}
              />

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleCreateTask}
                style={styles.saveTaskBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.saveTaskBtnText}>Add to Today's Routine</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  addTaskHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.8,
  },
  heroStatsText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  percentText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E11D48',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 5,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEncouragement: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  resetLinkText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  taskCardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxTouch: {
    paddingRight: 10,
    paddingTop: 2,
  },
  taskTextCol: {
    flex: 1,
  },
  taskHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskEmoji: {
    fontSize: 15,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 7,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  completedAtTag: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  actionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 6,
  },
  infoBtn: {
    padding: 6,
  },
  deleteBtn: {
    padding: 6,
  },
  rationaleBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
  },
  rationaleTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 3,
  },
  rationaleText: {
    fontSize: 11.5,
    lineHeight: 16,
    color: '#78350F',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  floatingAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  floatingAddText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  timeOfDayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  periodPillActive: {
    backgroundColor: '#E11D48',
  },
  periodPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  periodPillTextActive: {
    color: '#FFFFFF',
  },
  saveTaskBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveTaskBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
