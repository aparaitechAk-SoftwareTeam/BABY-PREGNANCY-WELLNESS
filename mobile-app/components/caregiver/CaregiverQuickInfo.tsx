import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, AlertCircle, TrendingUp } from 'lucide-react-native';

interface QuickInfoItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

export default function CaregiverQuickInfo() {
  const infoItems: QuickInfoItem[] = [
    {
      icon: <Heart size={16} color="#E11D48" strokeWidth={2} />,
      label: 'Last Update',
      value: '2 hours ago',
      color: '#FEE2E6',
    },
    {
      icon: <TrendingUp size={16} color="#10B981" strokeWidth={2} />,
      label: 'Health Status',
      value: 'Healthy',
      color: '#F0FDF4',
    },
    {
      icon: <AlertCircle size={16} color="#0EA5E9" strokeWidth={2} />,
      label: 'Alerts',
      value: 'None',
      color: '#E0F2FE',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Info</Text>
      <View style={styles.grid}>
        {infoItems.map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <View style={[styles.iconBg, { backgroundColor: item.color }]}>
              {item.icon}
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  value: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
});
