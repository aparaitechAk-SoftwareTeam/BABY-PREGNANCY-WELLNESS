import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Building2,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Plus,
  Stethoscope,
  TestTube,
  ShieldCheck,
  Flag,
  Share2,
} from 'lucide-react-native';
import { useTimelineStore, TimelineItem, TimelineItemType } from '../../store/timeline.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function SmartTimelineScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);

  const {
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    toggleItemCompleted,
    fetchTimeline,
    isLoading,
  } = useTimelineStore();

  const items = useTimelineStore((state) => state.items);
  const filteredItems = useTimelineStore((state) => state.getFilteredItems(currentWeek));

  React.useEffect(() => {
    fetchTimeline(currentWeek);
  }, [currentWeek, fetchTimeline]);

  const filterTabs: { key: typeof filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: items.length },
    { key: 'appointments', label: 'Visits', count: items.filter((i) => i.type === 'appointment').length },
    { key: 'tests', label: 'Tests & Scans', count: items.filter((i) => i.type === 'clinical_test' || i.type === 'vaccination').length },
    { key: 'milestones', label: 'Milestones', count: items.filter((i) => i.type === 'milestone').length },
    { key: 'routine', label: 'Habits', count: items.filter((i) => i.type === 'routine_habit').length },
  ];

  const getItemIcon = (type: TimelineItemType) => {
    switch (type) {
      case 'appointment':
        return <Stethoscope size={16} color="#0EA5E9" />;
      case 'clinical_test':
        return <TestTube size={16} color="#D97706" />;
      case 'vaccination':
        return <ShieldCheck size={16} color="#8B5CF6" />;
      case 'milestone':
        return <Sparkles size={16} color="#10B981" />;
      case 'routine_habit':
      default:
        return <Calendar size={16} color="#E11D48" />;
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
        >
          <ArrowLeft size={22} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Smart Pregnancy Timeline</Text>
          <Text style={styles.headerSubtitle}>
            Week {currentWeek || 20} • {daysRemaining || 140} Days Remaining
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/appointments/form')}
          style={styles.addApptBtn}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gestational Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View>
              <Text style={styles.heroLabel}>PREGNANCY PROGRESSION</Text>
              <Text style={styles.heroTitle}>Week {currentWeek || 20} Care Map</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>T2 Golden Period</Text>
            </View>
          </View>

          <Text style={styles.heroDescription}>
            Every clinic visit, diagnostic blood test, ultrasound, and baby milestone organized in a single chronological stream.
          </Text>

          {/* Progress Bar (Week 1 to 40) */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(100, Math.round(((currentWeek || 20) / 40) * 100))}%` },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressWeekStart}>Week 1</Text>
            <Text style={styles.progressWeekCurrent}>Current: Week {currentWeek || 20}</Text>
            <Text style={styles.progressWeekEnd}>Week 40 Due Date</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests, ultrasound, doctor, milestones..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(tab.key)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Timeline Stream */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionHeading}>
            Chronological Care Schedule ({filteredItems.length} events)
          </Text>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyTimelineCard}>
              <Calendar size={36} color="#94A3B8" />
              <Text style={styles.emptyTimelineTitle}>No Timeline Events Found</Text>
              <Text style={styles.emptyTimelineSubtitle}>
                Your clinic appointments, developmental milestones, diagnostic tests, and daily routine tasks will appear here in real time.
              </Text>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {/* Continuous Vertical Connecting Line */}
              <View style={styles.verticalLine} />

              {filteredItems.map((item, index) => {
              const isPastOrToday = item.targetWeek <= (currentWeek || 20);

              return (
                <View key={item.id} style={styles.timelineRow}>
                  {/* Timeline Left Node / Bullet */}
                  <View style={styles.nodeColumn}>
                    <TouchableOpacity
                      style={[
                        styles.nodeCircle,
                        item.isCompleted && styles.nodeCircleCompleted,
                        item.status === 'today' && styles.nodeCircleToday,
                      ]}
                      onPress={() => toggleItemCompleted(item.id)}
                      activeOpacity={0.8}
                    >
                      {item.isCompleted ? (
                        <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} />
                      ) : (
                        getItemIcon(item.type)
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Timeline Right Card */}
                  <View
                    style={[
                      styles.itemCard,
                      item.status === 'today' && styles.itemCardToday,
                    ]}
                  >
                    {/* Top Row: Badge & Week */}
                    <View style={styles.itemCardHeader}>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: `${item.badgeColor}15` },
                        ]}
                      >
                        <Text
                          style={[styles.typeBadgeText, { color: item.badgeColor }]}
                        >
                          {item.badgeLabel}
                        </Text>
                      </View>
                      <Text style={styles.itemDateStr}>{item.dateStr}</Text>
                    </View>

                    {/* Title */}
                    <Text
                      style={[
                        styles.itemTitle,
                        item.isCompleted && styles.itemTitleCompleted,
                      ]}
                    >
                      {item.title}
                    </Text>

                    {/* Doctor / Location */}
                    {item.doctorOrLocation ? (
                      <View style={styles.metaRow}>
                        <Building2 size={13} color="#64748B" />
                        <Text style={styles.metaText}>{item.doctorOrLocation}</Text>
                      </View>
                    ) : null}

                    {/* Description */}
                    <Text style={styles.itemDescription}>{item.description}</Text>

                    {/* Preparation / Action Warning */}
                    {item.clinicalAction ? (
                      <View style={styles.actionWarningBox}>
                        <AlertCircle size={13} color="#D97706" />
                        <Text style={styles.actionWarningText}>
                          Action: {item.clinicalAction}
                        </Text>
                      </View>
                    ) : null}

                    {/* Bottom Status / Toggle */}
                    <View style={styles.cardFooterRow}>
                      <TouchableOpacity
                        style={styles.toggleCompleteBtn}
                        onPress={() => toggleItemCompleted(item.id)}
                        activeOpacity={0.7}
                      >
                        {item.isCompleted ? (
                          <Text style={styles.toggleCompleteTextDone}>
                            ✓ Completed
                          </Text>
                        ) : (
                          <Text style={styles.toggleCompleteTextPending}>
                            ○ Mark as done
                          </Text>
                        )}
                      </TouchableOpacity>

                      {item.type === 'clinical_test' || item.type === 'appointment' ? (
                        <TouchableOpacity
                          style={styles.viewVaultBtn}
                          onPress={() => router.push('/vault')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.viewVaultBtnText}>
                            View in Vault ›
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

        {/* Quick Launchers Strip */}
        <View style={styles.quickLaunchers}>
          <TouchableOpacity
            style={styles.launcherCard}
            onPress={() => router.push('/vault')}
            activeOpacity={0.8}
          >
            <FileText size={20} color="#E11D48" />
            <View style={{ flex: 1 }}>
              <Text style={styles.launcherTitle}>Medical Document Vault</Text>
              <Text style={styles.launcherSub}>
                Upload scan reports, prescriptions & test results
              </Text>
            </View>
            <Text style={styles.launcherArrow}>›</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  addApptBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroBadge: {
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  heroDescription: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 14,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E11D48',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressWeekStart: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  progressWeekCurrent: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  progressWeekEnd: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  filterChipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timelineSection: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 4,
  },
  verticalLine: {
    position: 'absolute',
    left: 20,
    top: 14,
    bottom: 20,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  nodeColumn: {
    width: 36,
    alignItems: 'center',
    zIndex: 2,
  },
  nodeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  nodeCircleToday: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
  },
  nodeCircleCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  itemCard: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardToday: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFFBFB',
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  itemDateStr: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    marginTop: 2,
  },
  actionWarningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  actionWarningText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleCompleteBtn: {
    paddingVertical: 2,
  },
  toggleCompleteTextPending: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  toggleCompleteTextDone: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '700',
  },
  viewVaultBtn: {
    paddingVertical: 2,
  },
  viewVaultBtnText: {
    fontSize: 11.5,
    color: '#E11D48',
    fontWeight: '700',
  },
  quickLaunchers: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  launcherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  launcherTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  launcherSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  launcherArrow: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '600',
  },
  emptyTimelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 20,
  },
  emptyTimelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
  },
  emptyTimelineSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 290,
  },
});
