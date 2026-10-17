import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { contentApi } from '../../services/api/content.api';

export interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  isCompleted?: boolean;
}

interface WeeklyChecklistCardProps {
  initialItems?: ChecklistItem[];
  week?: number;
}

export function WeeklyChecklistCard({ initialItems = [], week }: WeeklyChecklistCardProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (week) {
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
              category: t.category || 'Planning',
              isCompleted: !!t.isCompleted,
            }));
            setItems(mapped);
            const map: Record<string, boolean> = {};
            mapped.forEach((m) => {
              map[m.id] = !!m.isCompleted;
            });
            setCompletedMap(map);
          } else {
            setItems(initialItems);
          }
        })
        .catch(() => {
          if (isMounted) setItems(initialItems);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setItems(initialItems);
    }
    return () => {
      isMounted = false;
    };
  }, [week, initialItems]);

  const toggleCheck = async (id: string) => {
    const nextState = !completedMap[id];
    setCompletedMap((prev) => ({
      ...prev,
      [id]: nextState,
    }));

    // Realtime database toggle
    try {
      await contentApi.toggleTask(id, nextState);
    } catch (e) {
      // Quiet background fallback
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>📋</Text>
        <Text style={styles.headerTitle}>Weekly Action Checklist</Text>
        {loading && <ActivityIndicator size="small" color="#E11D48" style={{ marginLeft: 8 }} />}
      </View>

      <Text style={styles.subText}>
        Live clinical & preparation tasks synchronized with your care profile:
      </Text>

      <View style={styles.itemsList}>
        {items.map((item) => {
          const isDone = !!completedMap[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleCheck(item.id)}
              style={[
                styles.itemRow,
                isDone && styles.itemRowDone,
              ]}
              activeOpacity={0.8}
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
                <Text style={styles.categoryBadge}>{item.category}</Text>
              </View>
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
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
