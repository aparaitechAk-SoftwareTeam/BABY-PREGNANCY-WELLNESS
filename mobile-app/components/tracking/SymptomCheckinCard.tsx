import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';

const COMMON_SYMPTOMS = [
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'backache', label: 'Back Pain', emoji: '⚡' },
  { id: 'heartburn', label: 'Heartburn', emoji: '🔥' },
  { id: 'swelling', label: 'Swelling', emoji: '🦶' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
];

interface SymptomCheckinCardProps {
  onSaveSymptoms?: (selectedIds: string[]) => void;
}

export function SymptomCheckinCard({ onSaveSymptoms }: SymptomCheckinCardProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});

  const toggleSymptom = (id: string) => {
    const nextVal = !selectedMap[id];
    setSelectedMap((prev) => ({
      ...prev,
      [id]: nextVal,
    }));

    if (id === 'headache' && nextVal) {
      Alert.alert(
        '🩺 Clinical Notice: Severe Headache',
        'Persistent or sudden severe headaches in pregnancy can sometimes indicate elevated blood pressure (Preeclampsia). If accompanied by vision changes or swelling, alert your doctor promptly.'
      );
    }
  };

  const selectedCount = Object.values(selectedMap).filter(Boolean).length;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>🩺</Text>
          <Text style={styles.headerTitle}>Daily Symptom Check-in</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{selectedCount} Logged</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Select any feelings or discomfort experienced today to log in your clinical timeline:
      </Text>

      {/* Symptom Grid */}
      <View style={styles.grid}>
        {COMMON_SYMPTOMS.map((item) => {
          const isSelected = !!selectedMap[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleSymptom(item.id)}
              style={[
                styles.symptomChip,
                isSelected && styles.symptomChipActive,
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.symptomEmoji}>{item.emoji}</Text>
              <Text
                style={[
                  styles.symptomLabel,
                  isSelected && styles.symptomLabelActive,
                ]}
              >
                {item.label}
              </Text>
              {isSelected && <Text style={styles.chipCheck}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  countBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '47%',
    flexGrow: 1,
  },
  symptomChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F172A',
  },
  symptomEmoji: {
    fontSize: 15,
    marginRight: 8,
  },
  symptomLabel: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  symptomLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  chipCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E11D48',
  },
});
