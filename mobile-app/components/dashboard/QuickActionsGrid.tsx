import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  Footprints,
  Activity,
  Droplets,
  Scale,
  Stethoscope,
  FolderLock,
  Calendar,
  Headphones,
} from 'lucide-react-native';

interface QuickActionsGridProps {
  onKickCounterPress: () => void;
  onStepsPress: () => void;
  onHydrationPress: () => void;
  onWeightPress: () => void;
  onSymptomsPress: () => void;
  onVaultPress: () => void;
  onTimelinePress: () => void;
  onSupportPress: () => void;
}

export function QuickActionsGrid({
  onKickCounterPress,
  onStepsPress,
  onHydrationPress,
  onWeightPress,
  onSymptomsPress,
  onVaultPress,
  onTimelinePress,
  onSupportPress,
}: QuickActionsGridProps) {
  const actions = [
    {
      id: 'kicks',
      title: 'Baby Kicks',
      sub: 'Cardiff timer',
      icon: Footprints,
      color: '#E11D48',
      bg: '#FEE2E6',
      onPress: onKickCounterPress,
    },
    {
      id: 'steps',
      title: 'Steps Fit',
      sub: 'Walking rings',
      icon: Activity,
      color: '#0D9488',
      bg: '#CCFBF1',
      onPress: onStepsPress,
    },
    {
      id: 'water',
      title: 'Hydration',
      sub: '+250ml goal',
      icon: Droplets,
      color: '#0284C7',
      bg: '#E0F2FE',
      onPress: onHydrationPress,
    },
    {
      id: 'weight',
      title: 'Weight',
      sub: 'Gestational gain',
      icon: Scale,
      color: '#16A34A',
      bg: '#DCFCE7',
      onPress: onWeightPress,
    },
    {
      id: 'symptoms',
      title: 'Symptoms',
      sub: 'Red-flag check',
      icon: Stethoscope,
      color: '#D97706',
      bg: '#FEF3C7',
      onPress: onSymptomsPress,
    },
    {
      id: 'vault',
      title: 'Medical Vault',
      sub: 'Scans & reports',
      icon: FolderLock,
      color: '#7C3AED',
      bg: '#F5F3FF',
      onPress: onVaultPress,
    },
    {
      id: 'timeline',
      title: 'Care Schedule',
      sub: 'Visits & tests',
      icon: Calendar,
      color: '#2563EB',
      bg: '#DBEAFE',
      onPress: onTimelinePress,
    },
    {
      id: 'support',
      title: 'Care Support',
      sub: 'Live chat & help',
      icon: Headphones,
      color: '#E11D48',
      bg: '#FFF1F2',
      onPress: onSupportPress,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Essential Daily Trackers & Tools</Text>
      <View style={styles.grid}>
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.gridCard}
              onPress={item.onPress}
              activeOpacity={0.75}
            >
              <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                <Icon size={18} color={item.color} strokeWidth={2.4} />
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {item.sub}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCard: {
    width: '23%',
    flexGrow: 1,
    minWidth: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
    textAlign: 'center',
  },
});
