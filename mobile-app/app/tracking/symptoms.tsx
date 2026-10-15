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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  Info,
  Trash2,
  Plus,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface SymptomCategory {
  name: string;
  items: { id: string; label: string; icon: string; isRedFlag?: boolean }[];
}

const SYMPTOM_DATA: SymptomCategory[] = [
  {
    name: 'Common Maternal Symptoms',
    items: [
      { id: 'nausea', label: 'Morning Nausea', icon: '🤢' },
      { id: 'fatigue', label: 'Tiredness & Fatigue', icon: '🥱' },
      { id: 'heartburn', label: 'Heartburn / Acid Reflux', icon: '🔥' },
      { id: 'backache', label: 'Lower Backache', icon: '🩹' },
      { id: 'ligament', label: 'Round Ligament Pain', icon: '⚡' },
      { id: 'leg_cramps', label: 'Calf & Leg Cramps', icon: '🦵' },
      { id: 'swelling_mild', label: 'Mild Ankle Swelling', icon: '🦶' },
      { id: 'insomnia', label: 'Sleep Difficulty', icon: '🌙' },
      { id: 'mood_swings', label: 'Emotional Sensitivity', icon: '🥺' },
    ],
  },
  {
    name: '🚨 Urgent Symptoms (Requires Clinic Evaluation)',
    items: [
      { id: 'vaginal_bleeding', label: 'Vaginal Bleeding / Spotting', icon: '🩸', isRedFlag: true },
      { id: 'fluid_leakage', label: 'Amniotic Fluid Leakage', icon: '💧', isRedFlag: true },
      { id: 'severe_headache', label: 'Severe Headache / Blurred Vision', icon: '👁️', isRedFlag: true },
      { id: 'sharp_pain', label: 'Persistent Severe Abdominal Pain', icon: '⚠️', isRedFlag: true },
      { id: 'reduced_movement', label: 'Marked Decrease in Baby Kicks', icon: '👣', isRedFlag: true },
      { id: 'sudden_swelling', label: 'Sudden Swelling of Face / Hands', icon: '🚨', isRedFlag: true },
    ],
  },
];

interface SymptomLogEntry {
  id: string;
  dateStr: string;
  week: number;
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  notes?: string;
  hasRedFlag: boolean;
}

const DEFAULT_LOGS: SymptomLogEntry[] = [
  {
    id: 'slog-1',
    dateStr: 'Today, 09:30 AM',
    week: 24,
    symptoms: ['Morning Nausea', 'Tiredness & Fatigue'],
    severity: 'Mild',
    notes: 'Took ginger tea; felt better by midday.',
    hasRedFlag: false,
  },
  {
    id: 'slog-2',
    dateStr: 'Yesterday, 08:00 PM',
    week: 24,
    symptoms: ['Lower Backache'],
    severity: 'Moderate',
    notes: 'Used maternity pillow for support.',
    hasRedFlag: false,
  },
];

const STORAGE_KEY = 'aparai_symptoms_history_v1';

export default function SymptomsTrackerScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const profile = usePregnancyStore((state) => state.profile);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Mild');
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState<SymptomLogEntry[]>(DEFAULT_LOGS);

  // Load saved history
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setLogs(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load symptoms history:', e);
      }
    })();
  }, []);

  const handleToggleSymptom = (label: string, isRedFlag?: boolean) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label));
    } else {
      setSelectedSymptoms([...selectedSymptoms, label]);

      if (isRedFlag) {
        Alert.alert(
          '🚨 Urgent Clinical Symptom Selected',
          'Symptoms such as bleeding, fluid leakage, severe headache, or sudden swelling require timely evaluation by your OB-GYN or maternity hospital triage.',
          [
            { text: 'Understood', style: 'default' },
            {
              text: 'Call Doctor / Clinic',
              style: 'destructive',
              onPress: handleCallDoctor,
            },
          ]
        );
      }
    }
  };

  const handleCallDoctor = () => {
    const phone = profile?.doctorPhone || '112';
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Helpline', 'Please call your doctor or nearest maternity emergency department.');
    });
  };

  const handleSaveLog = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms Selected', 'Please select at least one symptom to log.');
      return;
    }

    const hasRedFlag = selectedSymptoms.some((s) =>
      SYMPTOM_DATA[1].items.some((item) => item.label === s)
    );

    const now = new Date();
    const dateStr = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newEntry: SymptomLogEntry = {
      id: 'slog_' + Date.now(),
      dateStr,
      week: currentWeek,
      symptoms: selectedSymptoms,
      severity,
      notes: notes.trim() || undefined,
      hasRedFlag,
    };

    const updated = [newEntry, ...logs];
    setLogs(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save symptom log:', e);
    }

    setSelectedSymptoms([]);
    setNotes('');
    setSeverity('Mild');

    Alert.alert('Check-in Saved! ✅', 'Your symptom record has been logged in your personal history.');
  };

  const handleDeleteLog = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this symptom log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = logs.filter((l) => l.id !== id);
          setLogs(updated);
          try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.error('Failed to delete symptom log:', e);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Symptom Check-in</Text>
          <Text style={styles.headerSubtitle}>Maternal Wellness & Red-Flag Guidance</Text>
        </View>
        <TouchableOpacity
          onPress={handleCallDoctor}
          style={styles.callClinicBtn}
          activeOpacity={0.8}
        >
          <Phone size={14} color="#166534" />
          <Text style={styles.callClinicBtnText}>Call Clinic</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Medical Advisory Box */}
        <View style={styles.advisoryBox}>
          <View style={styles.advisoryHeader}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={styles.advisoryTitle}>Clinical Safety Guidance</Text>
          </View>
          <Text style={styles.advisoryText}>
            This tool records symptoms for your personal notes. It does not replace medical advice. If you experience severe pain, bleeding, or reduced movement, consult your healthcare provider immediately.
          </Text>
        </View>

        {/* Symptom Selection Cards */}
        {SYMPTOM_DATA.map((cat, catIdx) => (
          <View key={catIdx} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, catIdx === 1 && { color: '#B91C1C' }]}>
              {cat.name}
            </Text>

            <View style={styles.chipGrid}>
              {cat.items.map((item) => {
                const isSelected = selectedSymptoms.includes(item.label);
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleToggleSymptom(item.label, item.isRedFlag)}
                    style={[
                      styles.symptomChip,
                      isSelected && (item.isRedFlag ? styles.chipSelectedRed : styles.chipSelected),
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipEmoji}>{item.icon}</Text>
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && (item.isRedFlag ? styles.chipTextSelectedRed : styles.chipTextSelected),
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Severity Selector */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Overall Severity</Text>
          <View style={styles.severityRow}>
            {(['Mild', 'Moderate', 'Severe'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setSeverity(lvl)}
                style={[
                  styles.severityBtn,
                  severity === lvl && (lvl === 'Severe' ? styles.severityBtnSevere : styles.severityBtnActive),
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.severityBtnText,
                    severity === lvl && styles.severityBtnTextActive,
                  ]}
                >
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes Input */}
          <Text style={[styles.configTitle, { marginTop: 14 }]}>Notes for Doctor (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Started after breakfast, subsided when resting..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveLog}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              Save Symptom Check-in ({selectedSymptoms.length} selected)
            </Text>
          </TouchableOpacity>
        </View>

        {/* History Log */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Symptom History</Text>
          <Text style={styles.historyCount}>{logs.length} entries</Text>
        </View>

        {logs.map((item) => (
          <View key={item.id} style={styles.logCard}>
            <View style={styles.logTopRow}>
              <View style={styles.logMetaLeft}>
                <View style={[styles.severityBadge, item.hasRedFlag ? styles.badgeRed : styles.badgeNormal]}>
                  <Text style={item.hasRedFlag ? styles.badgeTextRed : styles.badgeTextNormal}>
                    {item.severity}
                  </Text>
                </View>
                <Text style={styles.logDate}>{item.dateStr}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteLog(item.id)}
                style={styles.deleteBtn}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.logSymptomsRow}>
              {item.symptoms.map((s, idx) => (
                <View key={idx} style={styles.loggedSymptomTag}>
                  <Text style={styles.loggedSymptomTagText}>{s}</Text>
                </View>
              ))}
            </View>

            {item.notes && <Text style={styles.loggedNotes}>"{item.notes}"</Text>}
          </View>
        ))}
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
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  callClinicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  callClinicBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  advisoryBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  advisoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
  },
  advisoryText: {
    fontSize: 10.5,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: '#FEE2E6',
    borderColor: '#FDA4AF',
  },
  chipSelectedRed: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  chipTextSelected: {
    color: '#BE123C',
    fontWeight: '700',
  },
  chipTextSelectedRed: {
    color: '#B91C1C',
    fontWeight: '700',
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  configTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  severityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  severityBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  severityBtnActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  severityBtnSevere: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  severityBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  severityBtnTextActive: {
    color: '#FFFFFF',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 12,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  historyCount: {
    fontSize: 11.5,
    color: '#64748B',
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  logTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeNormal: {
    backgroundColor: '#FEE2E6',
  },
  badgeRed: {
    backgroundColor: '#FEE2E2',
  },
  badgeTextNormal: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#BE123C',
  },
  badgeTextRed: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B91C1C',
  },
  logDate: {
    fontSize: 11.5,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 4,
  },
  logSymptomsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  loggedSymptomTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  loggedSymptomTagText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  loggedNotes: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
