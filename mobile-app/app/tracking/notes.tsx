import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Tag,
  Clock,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface WellnessNote {
  id: string;
  title: string;
  content: string;
  category: string;
  dateStr: string;
  week: number;
}

const CATEGORIES = ['All', 'Doctor Questions', 'Baby Registry', 'Nursery & Prep', 'Memories'];

const DEFAULT_NOTES: WellnessNote[] = [
  {
    id: 'note-1',
    title: 'Questions for Dr. Sharma at Week 24 Checkup',
    content: '1. Ask about safe antacid brands for heartburn.\n2. When should we schedule the 28-week Glucose Tolerance Test (GTT)?\n3. Can I continue prenatal yoga classes?',
    category: 'Doctor Questions',
    dateStr: 'Today, 11:00 AM',
    week: 24,
  },
  {
    id: 'note-2',
    title: 'Hospital Bag Essentials List',
    content: 'Maternity robes, baby onesies, feeding pillows, hospital registration documents, and camera charger.',
    category: 'Nursery & Prep',
    dateStr: 'Oct 12, 2026',
    week: 23,
  },
  {
    id: 'note-3',
    title: 'First Baby Kicks',
    content: 'Felt tiny fluttering kicks for the very first time after eating dinner. Beautiful feeling!',
    category: 'Memories',
    dateStr: 'Sep 28, 2026',
    week: 21,
  },
];

const STORAGE_KEY = 'aparai_maternal_notes_v1';

export default function NotesScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const [notes, setNotes] = useState<WellnessNote[]>(DEFAULT_NOTES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [inputCategory, setInputCategory] = useState('Doctor Questions');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    })();
  }, []);

  const handleSaveNote = async () => {
    if (!inputTitle.trim() || !inputContent.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and content for your note.');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const newNote: WellnessNote = {
      id: 'note_' + Date.now(),
      title: inputTitle.trim(),
      content: inputContent.trim(),
      category: inputCategory,
      dateStr,
      week: currentWeek,
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save note:', e);
    }

    setInputTitle('');
    setInputContent('');
    setShowAddForm(false);
    Alert.alert('Note Saved! 📝', 'Your note has been added to your pregnancy journal.');
  };

  const handleDeleteNote = (id: string) => {
    Alert.alert('Delete Note?', 'Remove this entry from your notes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = notes.filter((n) => n.id !== id);
          setNotes(updated);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to delete note:', e);
          }
        },
      },
    ]);
  };

  const filteredNotes = notes.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Pregnancy Notes & Journal</Text>
          <Text style={styles.headerSubtitle}>Doctor questions, lists, and memories</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          style={styles.newNoteBtn}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.newNoteBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes and questions..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catPillText, selectedCategory === cat && styles.catPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add Note Inline Form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Note</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Questions for ultrasound technician"
                placeholderTextColor="#94A3B8"
                value={inputTitle}
                onChangeText={setInputTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categorySelectorRow}>
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.smallCatPill, inputCategory === c && styles.smallCatPillActive]}
                    onPress={() => setInputCategory(c)}
                  >
                    <Text style={[styles.smallCatText, inputCategory === c && styles.smallCatTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Note Content</Text>
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Write your notes, questions, or ideas here..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={inputContent}
                onChangeText={setInputContent}
              />
            </View>

            <View style={styles.formBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveNote}
              >
                <CheckCircle2 size={14} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Save Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes List */}
        <View style={styles.notesListHeader}>
          <Text style={styles.sectionTitle}>Notes ({filteredNotes.length})</Text>
        </View>

        {filteredNotes.length === 0 ? (
          <View style={styles.emptyCard}>
            <BookOpen size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptySub}>Tap the "+ New" button above to record your thoughts or doctor questions.</Text>
          </View>
        ) : (
          filteredNotes.map((item) => (
            <View key={item.id} style={styles.noteCard}>
              <View style={styles.noteTopRow}>
                <View style={styles.categoryBadge}>
                  <Tag size={11} color="#0284C7" />
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                <View style={styles.noteMetaRow}>
                  <Text style={styles.weekBadge}>W{item.week}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteNote(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={13} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteContent}>{item.content}</Text>

              <View style={styles.noteFooter}>
                <Clock size={11} color="#94A3B8" />
                <Text style={styles.noteDate}>{item.dateStr}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  newNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  catPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  catPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  categorySelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  smallCatPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  smallCatPillActive: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  smallCatText: {
    fontSize: 11,
    color: '#475569',
  },
  smallCatTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  notesListHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    textAlign: 'center',
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  noteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekBadge: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  deleteBtn: {
    padding: 2,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noteDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
});
