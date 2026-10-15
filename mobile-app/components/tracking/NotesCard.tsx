import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Plus, ArrowRight, HelpCircle, Calendar, Sparkles } from 'lucide-react-native';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  dateStr: string;
  week: number;
}

const DEFAULT_PREVIEW_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Questions for Dr. Sharma at Next Checkup',
    content: '1. Safe antacids for heartburn.\n2. When to schedule Glucose Tolerance Test?\n3. Safe prenatal yoga stretches.',
    category: 'Doctor Questions',
    dateStr: 'Today, 11:00 AM',
    week: 20,
  },
  {
    id: 'note-2',
    title: 'Hospital Bag Essentials List',
    content: 'Maternity gowns, baby onesies, feeding pillow, discharge papers.',
    category: 'Nursery & Prep',
    dateStr: 'Oct 12, 2026',
    week: 20,
  },
];

const STORAGE_KEY = 'aparai_maternal_notes_v1';

export function NotesCard() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_PREVIEW_NOTES);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotes(parsed);
          }
        }
      } catch {
        // Fallback to default preview notes
      }
    })();
  }, []);

  const previewList = notes.slice(0, 2);

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.iconBg}>
            <BookOpen size={20} color="#7C3AED" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.titleText}>Notes & Doctor Questions</Text>
            <Text style={styles.subtitleText}>
              {notes.length} notes saved • Private pregnancy journal
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/tracking/notes')}
          style={styles.openDetailBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.openDetailText}>View All</Text>
          <ArrowRight size={14} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* Preview Note Items */}
      <View style={styles.notesList}>
        {previewList.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.push('/tracking/notes')}
            style={styles.noteItem}
            activeOpacity={0.8}
          >
            <View style={styles.noteTopRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{item.category}</Text>
              </View>
              <Text style={styles.dateText}>{item.dateStr}</Text>
            </View>

            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.noteExcerpt} numberOfLines={2}>
              {item.content}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Footer */}
      <View style={styles.actionFooter}>
        <TouchableOpacity
          onPress={() => router.push('/tracking/notes')}
          style={styles.addNoteBtn}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#7C3AED" strokeWidth={2.5} />
          <Text style={styles.addNoteText}>Add Doctor Question or Note</Text>
        </TouchableOpacity>
      </View>
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
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
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
  openDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  openDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  notesList: {
    gap: 8,
    marginBottom: 12,
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  noteTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  noteExcerpt: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  actionFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  addNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FAF5FF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  addNoteText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
