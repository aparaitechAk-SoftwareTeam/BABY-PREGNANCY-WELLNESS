import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  Pill,
  Sparkles,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { useNotificationStore, NotificationItem } from '../../store/notification.store';

type FilterType = 'all' | 'clinical' | 'routine' | 'milestone' | 'family';

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.category === activeFilter;
  });

  const handleNotificationPress = async (item: NotificationItem) => {
    await markAsRead(item.id);
    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityLabel="Back"
        >
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllAsRead}
            style={styles.markAllBtn}
            activeOpacity={0.8}
          >
            <CheckCheck size={16} color="#E11D48" strokeWidth={2.5} />
            <Text style={styles.markAllText}>Read All</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Unread Alert Banner (if any) */}
        {unreadCount > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertBannerLeft}>
              <View style={styles.alertBellWrapper}>
                <Bell size={18} color="#FFFFFF" strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.alertBannerTitle}>Maternal Health Alerts</Text>
                <Text style={styles.alertBannerSub}>
                  You have {unreadCount} updates requiring your attention.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            { key: 'all', label: `All (${notifications.length})` },
            {
              key: 'clinical',
              label: `Visits (${notifications.filter((n) => n.category === 'clinical').length})`,
            },
            {
              key: 'routine',
              label: `Routine (${notifications.filter((n) => n.category === 'routine').length})`,
            },
            {
              key: 'milestone',
              label: `Baby (${notifications.filter((n) => n.category === 'milestone').length})`,
            },
            {
              key: 'family',
              label: `Family (${notifications.filter((n) => n.category === 'family').length})`,
            },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key as FilterType)}
              style={[
                styles.filterPill,
                activeFilter === tab.key && styles.filterPillActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === tab.key && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Notifications List */}
        <View style={styles.listContainer}>
          {filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleNotificationPress(item)}
              style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.categoryRow}>
                  <Text style={styles.cardEmoji}>{item.emoji}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: `${item.badgeColor}15` }]}>
                    <Text style={[styles.categoryBadgeText, { color: item.badgeColor }]}>
                      {item.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>
              </View>

              <Text style={[styles.cardTitle, !item.isRead && styles.cardTitleUnread]}>
                {item.title}
              </Text>
              <Text style={styles.cardMessage}>{item.message}</Text>

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                <View style={styles.actionPrompt}>
                  <Text style={styles.actionPromptText}>View details</Text>
                  <ChevronRight size={13} color="#E11D48" />
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={14} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications here</Text>
              <Text style={styles.emptySubtitle}>
                You have no notifications in this category. We'll alert you as soon as new reminders or milestone updates occur.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  alertBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertBellWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  alertBannerSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingRight: 10,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  notificationCardUnread: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FECDD3',
    borderLeftWidth: 4,
    borderLeftColor: '#E11D48',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardEmoji: {
    fontSize: 15,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeAgoText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E11D48',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  cardTitleUnread: {
    color: '#0F172A',
    fontWeight: '800',
  },
  cardMessage: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});
