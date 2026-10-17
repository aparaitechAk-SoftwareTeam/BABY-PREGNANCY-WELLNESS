import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Bell, Users } from 'lucide-react-native';
import { useNotificationStore } from '../../store/notification.store';

interface HeaderProfileBarProps {
  userName?: string;
  babyNickname?: string;
  isPartnerSynced?: boolean;
  onNotificationsPress?: () => void;
  onPartnerPress?: () => void;
  onSOSPress?: () => void;
}

export function HeaderProfileBar({
  userName = 'Mama',
  babyNickname = 'Little Miracle',
  isPartnerSynced = false,
  onNotificationsPress,
  onPartnerPress,
  onSOSPress,
}: HeaderProfileBarProps) {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  // Get time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Image
          source={require('../../assets/mother_avatar.jpg')}
          style={styles.avatarImage}
        />
        <View style={styles.userInfoCol}>
          <Text style={styles.greetingText}>{greeting}, {userName}</Text>
          <Text style={styles.babySubtitle}>Nurturing {babyNickname}</Text>
        </View>
      </View>

      <View style={styles.rightActions}>
        {/* Urgent Emergency SOS Button */}
        <TouchableOpacity
          onPress={onSOSPress}
          style={styles.sosButton}
          activeOpacity={0.8}
          accessibilityLabel="Emergency SOS"
        >
          <View style={styles.sosDot} />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>

        {/* Partner Synced Indicator */}
        <TouchableOpacity
          onPress={onPartnerPress}
          style={[
            styles.partnerPill,
            isPartnerSynced ? styles.partnerPillSynced : styles.partnerPillInvite,
          ]}
          activeOpacity={0.75}
        >
          <Users size={15} color={isPartnerSynced ? '#059669' : '#E11D48'} strokeWidth={2.5} />
          <Text style={[styles.partnerText, { color: isPartnerSynced ? '#059669' : '#E11D48' }]}>
            {isPartnerSynced ? 'Synced' : 'Pair'}
          </Text>
        </TouchableOpacity>

        {/* Notifications Icon Button */}
        <TouchableOpacity
          onPress={onNotificationsPress}
          style={styles.bellButton}
          activeOpacity={0.75}
          accessibilityLabel="Notifications"
        >
          <Bell size={17} color="#0F172A" strokeWidth={2.5} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 4,
  },
  leftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FEE2E6',
  },
  userInfoCol: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  babySubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#DC2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sosDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  sosText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  partnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  partnerPillSynced: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  partnerPillInvite: {
    backgroundColor: '#FEE2E6',
    borderColor: '#FECDD3',
  },
  partnerText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
    position: 'relative',
  },
  unreadBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E11D48',
    position: 'absolute',
    top: 2,
    right: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 11,
  },
});
