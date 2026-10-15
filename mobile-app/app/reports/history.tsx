import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Share,
  Linking,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  FileText,
  Download,
  Share2,
  Calendar,
  Eye,
  Plus,
  Trash2,
  Search,
  MessageCircle,
  Filter,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';

interface SavedReport {
  id: string;
  title: string;
  dateStr: string;
  week: number;
  fileSize: string;
  type: string;
}

const DEFAULT_REPORTS: SavedReport[] = [
  {
    id: 'rep-1',
    title: 'Week 24 OB-GYN Clinical Summary',
    dateStr: 'Today, Oct 15, 2026',
    week: 24,
    fileSize: '320 KB',
    type: 'Routine Follow-up',
  },
  {
    id: 'rep-2',
    title: 'Week 20 Anomaly Scan & Vitals Log',
    dateStr: 'Sep 16, 2026',
    week: 20,
    fileSize: '310 KB',
    type: 'Radiology / Ultrasound',
  },
  {
    id: 'rep-3',
    title: 'First Trimester Milestone Summary',
    dateStr: 'Aug 12, 2026',
    week: 13,
    fileSize: '180 KB',
    type: 'Trimester Transition',
  },
];

const STORAGE_SAVED_REPORTS = 'aparai_saved_reports_v1';
const CATEGORIES = ['All', 'Routine Follow-up', 'Monthly Review', 'Radiology / Ultrasound', 'Trimester Transition'];

export default function ReportsHistoryScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const [reports, setReports] = useState<SavedReport[]>(DEFAULT_REPORTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Load persisted reports
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_SAVED_REPORTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge unique with default
            const ids = new Set(parsed.map((p: any) => p.id));
            const remainingDefaults = DEFAULT_REPORTS.filter((d) => !ids.has(d.id));
            setReports([...parsed, ...remainingDefaults]);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to load reports archive:', e);
      }
    })();
  }, []);

  const persistReports = async (newReports: SavedReport[]) => {
    setReports(newReports);
    try {
      await AsyncStorage.setItem(STORAGE_SAVED_REPORTS, JSON.stringify(newReports));
    } catch (e) {
      console.error('Failed to persist reports archive:', e);
    }
  };

  const handleShare = async (report: SavedReport) => {
    await Share.share({
      title: report.title,
      message: `AparaiTech Clinical Summary: ${report.title} (Week ${report.week}) generated on ${report.dateStr}.\n\nContains maternal vitals, Cardiff kick trends, weight gain curve, and consultation questions.`,
    });
  };

  const handleWhatsApp = async (report: SavedReport) => {
    try {
      const msg = `*AparaiTech Clinical Summary:*\n📄 ${report.title} (Week ${report.week})\n📅 ${report.dateStr}\nCategory: ${report.type}\n\nDoctor-ready report including tracked vitals and consultation questions.`;
      const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await handleShare(report);
      }
    } catch {
      await handleShare(report);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Report?', 'Remove this generated document from your clinical history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updated = reports.filter((r) => r.id !== id);
          persistReports(updated);
        },
      },
    ]);
  };

  const filteredReports = reports.filter((r) => {
    const matchesCategory = selectedCategory === 'All' || r.type.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.dateStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Clinical Reports History</Text>
          <Text style={styles.headerSubtitle}>Past generated summaries & consultations</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/reports/preview')}
          style={styles.newReportBtn}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.newReportBtnText}>Generate</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search past reports by week or title..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === cat && styles.categoryPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeading}>
          Archived Reports ({filteredReports.length})
        </Text>

        {filteredReports.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={40} color="#CBD5E1" />
            <Text style={styles.emptyStateTitle}>No reports match your filter</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try selecting "All" or generate a new clinical summary.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/reports/preview')}
              style={styles.emptyActionBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyActionBtnText}>Generate New Report</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportTopRow}>
                <View style={styles.iconBox}>
                  <FileText size={22} color="#E11D48" />
                </View>

                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportType}>
                    {report.type} • {report.fileSize}
                  </Text>
                  <View style={styles.metaRow}>
                    <Calendar size={11} color="#64748B" />
                    <Text style={styles.reportDate}>{report.dateStr}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.reportActionsRow}>
                <TouchableOpacity
                  style={styles.previewBtn}
                  onPress={() => router.push('/reports/preview')}
                  activeOpacity={0.8}
                >
                  <Eye size={13} color="#0F172A" />
                  <Text style={styles.previewBtnText}>Preview & Print</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={() => handleWhatsApp(report)}
                  activeOpacity={0.8}
                >
                  <MessageCircle size={13} color="#25D366" />
                  <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => handleShare(report)}
                  activeOpacity={0.8}
                >
                  <Share2 size={13} color="#0284C7" />
                  <Text style={styles.shareBtnText}>Share</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(report.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  newReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E11D48',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  newReportBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#0F172A',
    padding: 0,
  },
  clearSearchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E11D48',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    paddingVertical: 2,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
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
  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  reportType: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  reportDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  reportActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  previewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  whatsappBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  deleteBtn: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 6,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  emptyStateSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyActionBtn: {
    marginTop: 10,
    backgroundColor: '#E11D48',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
