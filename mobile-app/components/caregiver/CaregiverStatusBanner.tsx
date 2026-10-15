import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Users, CheckCircle } from 'lucide-react-native';

interface CaregiverStatusBannerProps {
  motherName?: string;
  connectionStatus?: 'connected' | 'pending' | 'disconnected';
}

export default function CaregiverStatusBanner({
  motherName = 'Mother',
  connectionStatus = 'connected',
}: CaregiverStatusBannerProps) {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return { bg: '#F0FDF4', text: '#15803D', icon: '#10B981' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E', icon: '#F59E0B' };
      case 'disconnected':
        return { bg: '#FEF2F2', text: '#7F1D1D', icon: '#EF4444' };
      default:
        return { bg: '#F0F9FF', text: '#0C4A6E', icon: '#0EA5E9' };
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return `Connected to ${motherName}'s pregnancy journey`;
      case 'pending':
        return `Awaiting confirmation from ${motherName}`;
      case 'disconnected':
        return `Disconnected from ${motherName}'s journey`;
      default:
        return 'Connection status unknown';
    }
  };

  const colors = getStatusColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={[styles.icon, { backgroundColor: colors.icon + '20' }]}>
          {connectionStatus === 'connected' ? (
            <CheckCircle size={20} color={colors.icon} strokeWidth={2} />
          ) : (
            <Users size={20} color={colors.icon} strokeWidth={2} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {connectionStatus === 'connected' ? 'Connected' : 'Status'}
          </Text>
          <Text style={[styles.message, { color: colors.text }]}>
            {getStatusMessage()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
});
