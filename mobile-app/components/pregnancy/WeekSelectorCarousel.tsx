import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface WeekSelectorCarouselProps {
  selectedWeek: number;
  currentActualWeek: number;
  onSelectWeek: (week: number) => void;
}

const WEEKS = Array.from({ length: 40 }, (_, i) => i + 1);

export function WeekSelectorCarousel({
  selectedWeek,
  currentActualWeek,
  onSelectWeek,
}: WeekSelectorCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const itemWidth = 60;
    const offset = Math.max(0, (selectedWeek - 3) * itemWidth);
    scrollRef.current?.scrollTo({ x: offset, animated: true });
  }, [selectedWeek]);

  const getTrimester = (w: number) => (w <= 12 ? 'T1' : w <= 27 ? 'T2' : 'T3');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>TIMELINE</Text>
        <Text style={styles.trimesterLabel}>
          Trimester {getTrimester(selectedWeek)} • Week {selectedWeek} of 40
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {WEEKS.map((w) => {
          const isSelected = w === selectedWeek;
          const isCurrent = w === currentActualWeek;

          return (
            <TouchableOpacity
              key={w}
              onPress={() => onSelectWeek(w)}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.trimesterMicro,
                  isSelected && styles.trimesterMicroSelected,
                ]}
              >
                {getTrimester(w)}
              </Text>
              <Text
                style={[
                  styles.weekNumber,
                  isSelected && styles.weekNumberSelected,
                ]}
              >
                {w}
              </Text>
              {isCurrent && (
                <View
                  style={[
                    styles.currentIndicator,
                    isSelected && styles.currentIndicatorSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#94A3B8',
  },
  trimesterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    width: 52,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  pillSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  trimesterMicro: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
  },
  trimesterMicroSelected: {
    color: '#94A3B8',
  },
  weekNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  weekNumberSelected: {
    color: '#FFFFFF',
  },
  currentIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E11D48',
    position: 'absolute',
    bottom: 6,
  },
  currentIndicatorSelected: {
    backgroundColor: '#F43F5E',
  },
});
