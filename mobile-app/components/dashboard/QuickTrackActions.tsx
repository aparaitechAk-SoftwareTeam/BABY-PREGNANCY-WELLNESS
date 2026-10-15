import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';

interface QuickTrackActionsProps {
  onKickCounterPress?: () => void;
  onHydrationPress?: () => void;
  onStepsPress?: () => void;
  onWeightPress?: () => void;
  onSymptomsPress?: () => void;
  onNotesPress?: () => void;
}

const ACTIONS = [
  {
    id: 'kicks',
    title: 'Baby Kicks',
    subtitle: 'Fetal tracker',
    emoji: '👣',
    bgColor: '#FEE2E6',
    borderColor: '#FECDD3',
    emojiBg: '#FEE2E6',
  },
  {
    id: 'steps',
    title: 'Daily Steps',
    subtitle: 'Walking fit',
    emoji: '🚶‍♀️',
    bgColor: '#CCFBF1',
    borderColor: '#99F6E4',
    emojiBg: '#CCFBF1',
  },
  {
    id: 'water',
    title: 'Hydration',
    subtitle: '+250ml quick',
    emoji: '💧',
    bgColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    emojiBg: '#E0F2FE',
  },
  {
    id: 'weight',
    title: 'Weight',
    subtitle: 'Log curve',
    emoji: '⚖️',
    bgColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    emojiBg: '#F0FDF4',
  },
  {
    id: 'symptoms',
    title: 'Symptoms',
    subtitle: 'Check-in',
    emoji: '🩺',
    bgColor: '#FFFBEB',
    borderColor: '#FEF3C7',
    emojiBg: '#FFFBEB',
  },
];

export function QuickTrackActions({
  onKickCounterPress,
  onHydrationPress,
  onStepsPress,
  onWeightPress,
  onSymptomsPress,
  onNotesPress,
}: QuickTrackActionsProps) {
  const handleAction = (id: string) => {
    switch (id) {
      case 'kicks':
        onKickCounterPress?.();
        break;
      case 'steps':
        onStepsPress?.();
        break;
      case 'water':
        onHydrationPress?.();
        break;
      case 'weight':
        onWeightPress?.();
        break;
      case 'symptoms':
        onSymptomsPress?.();
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Quick Track Actions</Text>
        <TouchableOpacity onPress={onNotesPress} activeOpacity={0.7}>
          <Text style={styles.journalLink}>+ New Journal Note</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollGrid}
      >
        {ACTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handleAction(item.id)}
            style={[styles.actionTile, { backgroundColor: item.bgColor, borderColor: item.borderColor }]}
            activeOpacity={0.85}
          >
            <View style={[styles.emojiContainer, { backgroundColor: item.emojiBg }]}>
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </View>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  journalLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  scrollGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
  },
  actionTile: {
    width: 96,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 20,
  },
  actionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
});
