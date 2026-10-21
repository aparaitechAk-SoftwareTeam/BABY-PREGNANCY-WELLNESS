import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Car,
  Pill,
  ShoppingBag,
  Printer,
  Home,
  Clock,
  UserCheck,
  AlertCircle,
  Trash2,
  X,
  ListTodo,
} from 'lucide-react-native';
import {
  useFamilyTasksStore,
  FamilyTask,
  TaskCategory,
  TaskPriority,
  isMockFamilyTask,
} from '../../store/family-tasks.store';
import { useAuthStore } from '../../store/auth.store';

export default function FamilyTasksScreen() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const isCaregiver = user?.role === 'caregiver';

  const {
    tasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    deleteTask,
    loadTasks,
  } = useFamilyTasksStore();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('Partner / Caregiver');
  const [formCategory, setFormCategory] = useState<TaskCategory>('transport');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formDueDate, setFormDueDate] = useState('Before next appointment');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = useFamilyTasksStore((state) => state.getFilteredTasks)();
  const realTasks = tasks.filter((t) => !isMockFamilyTask(t.id));
  const pendingPartnerTasks = realTasks.filter(
    (t) => !t.isCompleted && (t.assignedTo.toLowerCase().includes('partner') || t.assignedTo.toLowerCase().includes('caregiver'))
  );

  const quickTemplates = [
    { title: 'Arrange car/cab for doctor checkup', category: 'transport' as TaskCategory, priority: 'high' as TaskPriority, emoji: '🚗' },
    { title: 'Pick up iron & calcium supplements from pharmacy', category: 'pharmacy' as TaskCategory, priority: 'medium' as TaskPriority, emoji: '💊' },
    { title: 'Print ultrasound scan & blood report copies', category: 'appointment_prep' as TaskCategory, priority: 'urgent' as TaskPriority, emoji: '🖨️' },
    { title: 'Buy maternity body pillow & hospital essentials', category: 'shopping' as TaskCategory, priority: 'medium' as TaskPriority, emoji: '🎒' },
  ];

  const handleApplyTemplate = (tmpl: typeof quickTemplates[0]) => {
    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormPriority(tmpl.priority);
    setShowAddModal(true);
  };

  const handleSaveTask = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a task description.');
      return;
    }

    await addTask({
      title: formTitle.trim(),
      assignedTo: formAssignedTo,
      assignedBy: user?.name || (isCaregiver ? 'Caregiver' : 'Mother'),
      category: formCategory,
      priority: formPriority,
      dueDate: formDueDate.trim() || 'Today',
      notes: formNotes.trim() || undefined,
    });

    setShowAddModal(false);
    setFormTitle('');
    setFormNotes('');
    Alert.alert('Task Assigned', `Assigned to ${formAssignedTo} successfully.`);
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'transport':
        return <Car size={16} color="#0284C7" />;
      case 'pharmacy':
        return <Pill size={16} color="#E11D48" />;
      case 'shopping':
        return <ShoppingBag size={16} color="#D97706" />;
      case 'appointment_prep':
        return <Printer size={16} color="#7C3AED" />;
      case 'home_setup':
      default:
        return <Home size={16} color="#059669" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      case 'high':
        return { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5' };
      case 'medium':
        return { bg: '#FEFCE8', text: '#CA8A04', border: '#FEF08A' };
      case 'low':
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Family Task Coordination</Text>
          <Text style={styles.headerSubtitle}>
            {isCaregiver ? 'Your Assigned Tasks' : 'Assign & Coordinate Support'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metric Summary Strip */}
        <View style={styles.metricStrip}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{tasks.length}</Text>
            <Text style={styles.metricLabel}>Total Tasks</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: '#E11D48' }]}>
              {pendingPartnerTasks.length}
            </Text>
            <Text style={styles.metricLabel}>Partner Pending</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: '#10B981' }]}>
              {tasks.filter((t) => t.isCompleted).length}
            </Text>
            <Text style={styles.metricLabel}>Completed</Text>
          </View>
        </View>

        {/* Quick Delegation Templates */}
        {!isCaregiver && (
          <View style={styles.templateSection}>
            <Text style={styles.sectionTitle}>Quick Assign to Partner</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateRow}
            >
              {quickTemplates.map((t, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.templateChip}
                  onPress={() => handleApplyTemplate(t)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.templateEmoji}>{t.emoji}</Text>
                  <Text style={styles.templateTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'partner', label: 'For Partner' },
            { key: 'completed', label: 'Done' },
          ].map((tab) => {
            const isActive = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setFilter(tab.key as any)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task List */}
        <View style={styles.taskListSection}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <ListTodo size={40} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySub}>
                Assign tasks like arranging transportation, picking up medications, or preparing the hospital bag.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyAddBtnText}>+ Assign New Task</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredTasks.map((task) => {
              const priorityStyle = getPriorityColor(task.priority);
              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    task.isCompleted && styles.taskCardCompleted,
                  ]}
                >
                  <View style={styles.taskCardHeader}>
                    {/* Checkbox */}
                    <TouchableOpacity
                      onPress={() => toggleTask(task.id, user?.name || 'Caregiver')}
                      style={styles.checkboxBtn}
                      activeOpacity={0.7}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 size={22} color="#10B981" strokeWidth={2.5} />
                      ) : (
                        <Circle size={22} color="#CBD5E1" strokeWidth={2} />
                      )}
                    </TouchableOpacity>

                    {/* Task Title & Details */}
                    <View style={styles.taskTitleCol}>
                      <Text
                        style={[
                          styles.taskTitle,
                          task.isCompleted && styles.taskTitleDone,
                        ]}
                      >
                        {task.title}
                      </Text>

                      <View style={styles.taskMetaRow}>
                        <View style={styles.categoryBadge}>
                          {getCategoryIcon(task.category)}
                          <Text style={styles.categoryBadgeText}>
                            {task.category.toUpperCase().replace('_', ' ')}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.priorityBadge,
                            {
                              backgroundColor: priorityStyle.bg,
                              borderColor: priorityStyle.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.priorityBadgeText,
                              { color: priorityStyle.text },
                            ]}
                          >
                            {task.priority.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Delete Action */}
                    <TouchableOpacity
                      onPress={() => deleteTask(task.id)}
                      style={styles.deleteTaskBtn}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>

                  {/* Notes Snippet */}
                  {task.notes ? (
                    <View style={styles.taskNotesBox}>
                      <Text style={styles.taskNotesText}>“{task.notes}”</Text>
                    </View>
                  ) : null}

                  {/* Footer Row */}
                  <View style={styles.taskFooterRow}>
                    <View style={styles.assignedRow}>
                      <UserCheck size={12} color="#64748B" />
                      <Text style={styles.assignedText}>
                        Assigned to: <Text style={{ fontWeight: '700' }}>{task.assignedTo}</Text>
                      </Text>
                    </View>

                    <View style={styles.dueDateRow}>
                      <Clock size={12} color="#E11D48" />
                      <Text style={styles.dueDateText}>{task.dueDate}</Text>
                    </View>
                  </View>

                  {task.completedAt ? (
                    <Text style={styles.completedAtText}>
                      ✓ Completed by {task.completedBy || 'Caregiver'} at {task.completedAt}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* MODAL: ASSIGN TASK */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Assign Support Task</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.inputLabel}>Task Description *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Arrange cab & pack previous scan reports"
              placeholderTextColor="#94A3B8"
              value={formTitle}
              onChangeText={setFormTitle}
            />

            <Text style={styles.inputLabel}>Assign To</Text>
            <View style={styles.chipRow}>
              {['Partner / Caregiver', 'Mother', 'Family Member'].map((assignee) => (
                <TouchableOpacity
                  key={assignee}
                  style={[
                    styles.formChip,
                    formAssignedTo === assignee && styles.formChipActive,
                  ]}
                  onPress={() => setFormAssignedTo(assignee)}
                >
                  <Text
                    style={[
                      styles.formChipText,
                      formAssignedTo === assignee && styles.formChipTextActive,
                    ]}
                  >
                    {assignee}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'transport', label: '🚗 Transport' },
                { key: 'pharmacy', label: '💊 Pharmacy' },
                { key: 'appointment_prep', label: '🖨️ Clinic Prep' },
                { key: 'shopping', label: '🎒 Shopping' },
                { key: 'home_setup', label: '🏠 Nursery Setup' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.formChip,
                    formCategory === c.key && styles.formChipActive,
                  ]}
                  onPress={() => setFormCategory(c.key as TaskCategory)}
                >
                  <Text
                    style={[
                      styles.formChipText,
                      formCategory === c.key && styles.formChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'urgent', label: 'Urgent 🚨' },
                { key: 'high', label: 'High' },
                { key: 'medium', label: 'Medium' },
                { key: 'low', label: 'Low' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.formChip,
                    formPriority === p.key && styles.formChipActive,
                  ]}
                  onPress={() => setFormPriority(p.key as TaskPriority)}
                >
                  <Text
                    style={[
                      styles.formChipText,
                      formPriority === p.key && styles.formChipTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Due Date / Timeframe</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Today • 10:00 AM or Before Week 24"
              placeholderTextColor="#94A3B8"
              value={formDueDate}
              onChangeText={setFormDueDate}
            />

            <Text style={styles.inputLabel}>Special Instructions / Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Add clinic address, specific medicine names, or store instructions..."
              placeholderTextColor="#94A3B8"
              value={formNotes}
              onChangeText={setFormNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSaveTask}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Assign Task to Partner</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  metricStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  templateSection: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  templateRow: {
    gap: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    maxWidth: 220,
  },
  templateEmoji: {
    fontSize: 13,
  },
  templateTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#334155',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  taskListSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyAddBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginTop: 14,
  },
  emptyAddBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBtn: {
    paddingTop: 1,
    marginRight: 10,
  },
  taskTitleCol: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 19,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#475569',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  deleteTaskBtn: {
    padding: 4,
  },
  taskNotesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  taskNotesText: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: '#475569',
  },
  taskFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  assignedText: {
    fontSize: 11,
    color: '#64748B',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E11D48',
  },
  completedAtText: {
    fontSize: 10.5,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formChipActive: {
    backgroundColor: '#FEE2E6',
    borderColor: '#E11D48',
  },
  formChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  formChipTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
