import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, ArrowRight } from 'lucide-react-native';

interface WeightLogCardProps {
  currentWeightKg?: number;
  baselineWeightKg?: number;
  trimester?: number;
  onSaveWeight?: (newWeightKg: number) => void;
}

export function WeightLogCard({
  currentWeightKg = 64.2,
  baselineWeightKg = 60.0,
  trimester = 2,
  onSaveWeight,
}: WeightLogCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentWeightKg.toString());

  const totalGain = (currentWeightKg - baselineWeightKg).toFixed(1);
  const isPositive = parseFloat(totalGain) >= 0;

  const expectedRange =
    trimester === 1
      ? '0.5 - 2.0 kg'
      : trimester === 2
      ? '5.0 - 8.0 kg'
      : '10.0 - 14.0 kg';

  const handleSave = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed > 30 && parsed < 200) {
      onSaveWeight?.(parsed);
      setIsEditing(false);
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerIcon}>⚖️</Text>
          <View>
            <Text style={styles.headerTitle}>Maternal Weight Curve</Text>
            <Text style={styles.recordDateText}>Recorded on {todayStr}</Text>
          </View>
        </View>
        <View style={styles.rangeBadge}>
          <Text style={styles.rangeBadgeText}>T{trimester} Norm: {expectedRange}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Healthy weight progression according to clinical obstetric trimester curves.
      </Text>

      {/* Main Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>CURRENT WEIGHT</Text>
          {isEditing ? (
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus
              />
              <Text style={styles.inputUnit}>kg</Text>
            </View>
          ) : (
            <Text style={styles.statValue}>
              {currentWeightKg} <Text style={styles.statUnit}>kg</Text>
            </Text>
          )}
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>NET PREGNANCY GAIN</Text>
          <Text style={styles.statGain}>
            {isPositive ? `+${totalGain}` : totalGain} <Text style={styles.statUnit}>kg</Text>
          </Text>
        </View>
      </View>

      {/* Recent Weigh-In Record by Date */}
      <View style={styles.recentDatesContainer}>
        <Text style={styles.recentDatesLabel}>WHICH DAY RECORDED</Text>
        <View style={styles.dateTagsRow}>
          <View style={styles.dateTagItem}>
            <Text style={styles.dateTagDay}>Oct 15 (Today)</Text>
            <Text style={styles.dateTagVal}>{currentWeightKg} kg</Text>
          </View>
          <View style={styles.dateTagItem}>
            <Text style={styles.dateTagDay}>Oct 08 (W19)</Text>
            <Text style={styles.dateTagVal}>63.8 kg</Text>
          </View>
          <View style={styles.dateTagItem}>
            <Text style={styles.dateTagDay}>Oct 01 (W18)</Text>
            <Text style={styles.dateTagVal}>63.3 kg</Text>
          </View>
        </View>
      </View>

      {/* Edit / Save Action */}
      <View style={styles.actionRow}>
        {isEditing ? (
          <View style={styles.editingBtnRow}>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={styles.cancelBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonStack}>
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              style={styles.logWeightBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.logWeightBtnText}>+ Log Today's Weight</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/tracking/weight')}
              style={styles.viewHistoryBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.viewHistoryBtnText}>
                📊 View Full Weigh-In History & Log by Date ›
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  rangeBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#64748B',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  statGain: {
    fontSize: 22,
    fontWeight: '800',
    color: '#047857',
  },
  statUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0F172A',
    paddingHorizontal: 10,
    height: 36,
  },
  textInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 50,
    textAlign: 'center',
    paddingVertical: 0,
  },
  inputUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  actionRow: {
    marginTop: 2,
  },
  logWeightBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logWeightBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  editingBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  recordDateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  recentDatesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recentDatesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateTagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateTagItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTagDay: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  dateTagVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  buttonStack: {
    gap: 8,
  },
  viewHistoryBtn: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  viewHistoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
});
