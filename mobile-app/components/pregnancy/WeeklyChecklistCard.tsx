import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { contentApi } from '../../services/api/content.api';

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  timeStr?: string;
  isCompleted?: boolean;
}

interface WeeklyChecklistCardProps {
  initialItems?: ChecklistItem[];
  week?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  medication: { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  hydration: { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD' },
  exercise: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  kicks: { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' },
  nutrition: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  planning: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
  custom: { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' },
};

export function WeeklyChecklistCard({ initialItems, week }: WeeklyChecklistCardProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems || []);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Load tasks only when week changes
  useEffect(() => {
    let isMounted = true;
    if (!week) {
      if (initialItems && initialItems.length > 0) {
        setItems(initialItems);
        const map: Record<string, boolean> = {};
        initialItems.forEach((m) => {
          map[m.id] = !!m.isCompleted;
        });
        setCompletedMap(map);
      }
      return;
    }

    setLoading(true);
    contentApi
      .getTasksByWeek(week)
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ChecklistItem[] = data.map((t: any) => ({
            id: t.id,
            text: t.title || t.description || 'Task',
            category: (t.category || 'planning').toLowerCase(),
            timeStr: t.timeStr || '',
            isCompleted: !!t.isCompleted,
          }));
          setItems(mapped);
          const map: Record<string, boolean> = {};
          mapped.forEach((m) => {
            map[m.id] = !!m.isCompleted;
          });
          setCompletedMap(map);
        } else {
          setItems(initialItems || []);
        }
      })
      .catch((err) => {
        console.warn(`[WeeklyChecklist] Failed to fetch week ${week}:`, err?.message);
        if (isMounted && initialItems) setItems(initialItems);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [week]);

  const toggleCheck = useCallback(async (id: string) => {
    const currentState = !!completedMap[id];
    const nextState = !currentState;

    // 1. Optimistic UI update
    setCompletedMap((prev) => ({
      ...prev,
      [id]: nextState,
    }));
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: nextState } : item))
    );

    // 2. Persist to Neon PostgreSQL
    try {
      await contentApi.toggleTask(id, nextState);
    } catch (e) {
      console.warn('[WeeklyChecklist] Task toggle failed, reverting:', e);
      // Rollback on failure
      setCompletedMap((prev) => ({
        ...prev,
        [id]: currentState,
      }));
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isCompleted: currentState } : item))
      );
    }
  }, [completedMap]);

  const totalCount = items.length;
  const completedCount = useMemo(() => {
    return items.filter((item) => !!completedMap[item.id]).length;
  }, [items, completedMap]);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📋</Text>
          <Text style={styles.headerTitle}>Weekly Action Checklist</Text>
        </View>
        {totalCount > 0 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>
              {completedCount}/{totalCount} Done
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.subText}>
        Live clinical & preparation tasks synchronized with your care profile for Week {week || '—'}:
      </Text>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
                progressPercent === 100 && styles.progressBarFillComplete,
              ]}
            />
          </View>
          <Text style={styles.progressPercentText}>{progressPercent}%</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color="#E11D48" />
          <Text style={styles.loadingText}>Syncing tasks from database...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={styles.emptyTitle}>No Tasks for Week {week || '—'}</Text>
          <Text style={styles.emptySub}>All clinical checklist items for this week are up to date.</Text>
        </View>
      ) : (
        <View style={styles.itemsList}>
          {items.map((item) => {
            const isDone = !!completedMap[item.id];
            const catStyle = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.custom;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleCheck(item.id)}
                style={[
                  styles.itemRow,
                  isDone && styles.itemRowDone,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkboxSquare,
                    isDone && styles.checkboxSquareDone,
                  ]}
                >
                  {isDone && <Text style={styles.checkIcon}>✓</Text>}
                </View>

                <View style={styles.itemTextCol}>
                  <Text
                    style={[
                      styles.itemTitle,
                      isDone && styles.itemTitleDone,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.categoryBadgeWrapper,
                        { backgroundColor: catStyle.bg, borderColor: catStyle.border },
                      ]}
                    >
                      <Text style={[styles.categoryBadge, { color: catStyle.text }]}>
                        {item.category}
                      </Text>
                    </View>
                    {item.timeStr ? (
                      <Text style={styles.timeStrText}>🕒 {item.timeStr}</Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1.5,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subText: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 12,
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareDone: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  itemTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  counterBadge: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 3,
  },
  progressBarFillComplete: {
    backgroundColor: '#10B981',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    minWidth: 32,
    textAlign: 'right',
  },
  loaderBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryBadgeWrapper: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadge: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timeStrText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
});
