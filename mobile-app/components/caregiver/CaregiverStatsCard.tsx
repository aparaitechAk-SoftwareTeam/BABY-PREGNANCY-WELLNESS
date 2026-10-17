import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Calendar, Bell } from 'lucide-react-native';

interface CaregiverStatsCardProps {
  currentWeek?: number;
  daysRemaining?: number;
  unreadUpdates?: number;
}

export default function CaregiverStatsCard({
  currentWeek = 1,
  daysRemaining = 280,
  unreadUpdates = 0,
}: CaregiverStatsCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <View style={styles.statIcon}>
          <Calendar size={18} color="#0EA5E9" strokeWidth={2} />
        </View>
        <Text style={styles.statValue}>{currentWeek}</Text>
        <Text style={styles.statLabel}>Week</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBox}>
        <View style={styles.statIcon}>
          <Heart size={18} color="#E11D48" strokeWidth={2} />
        </View>
        <Text style={styles.statValue}>{daysRemaining}</Text>
        <Text style={styles.statLabel}>Days Left</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBox}>
        <View style={styles.statIcon}>
          <Bell size={18} color="#10B981" strokeWidth={2} />
        </View>
        <Text style={styles.statValue}>{unreadUpdates}</Text>
        <Text style={styles.statLabel}>Updates</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
});
