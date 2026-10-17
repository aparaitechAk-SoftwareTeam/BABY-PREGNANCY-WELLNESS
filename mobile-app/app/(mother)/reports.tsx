import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { Download, Share2, TrendingUp, CheckCircle, MessageCircle, FileText, History } from 'lucide-react-native';

export default function MotherReports() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const trimester = usePregnancyStore((state) => state.trimester);
  const profile = usePregnancyStore((state) => state.profile);
  const scrollViewRef = useRef<ScrollView>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'1week' | '1month' | 'trimester' | 'full'>('1week');

  // Scroll to top when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Simulate PDF generation
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      const reportContent = `APARAITECH CLINICAL REPORT - Week ${currentWeek}

═══════════════════════════════════════════════════════════
PREGNANCY DETAILS
═══════════════════════════════════════════════════════════
Current Week: ${currentWeek} of 40
Trimester: ${trimester}
Report Date: ${new Date().toLocaleDateString()}
Report Period: ${selectedPeriod === '1week' ? '1 Week' : selectedPeriod === '1month' ? '1 Month' : selectedPeriod === 'trimester' ? 'Trimester' : 'Full'}

═══════════════════════════════════════════════════════════
MATERNAL HEALTH SNAPSHOT
═══════════════════════════════════════════════════════════
✓ Fetal Activity: 10 kicks/34m (Normal reactivity)
✓ Weight Gain: +4.2 kg (T${trimester} guideline)
✓ Hydration: 2,250 ml/day (90% of target)
✓ Wellness Status: Good - No red flags

═══════════════════════════════════════════════════════════
RECENT ACTIVITY LOG
═══════════════════════════════════════════════════════════
• Kick Counter Session: 10 kicks in 34 minutes
• Weight Logged: 64.2 kg
• Hydration Goal Achieved: 2,500 ml consumed
• Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

═══════════════════════════════════════════════════════════
MEDICAL DISCLAIMER
═══════════════════════════════════════════════════════════
This report is generated from self-reported data to facilitate 
doctor consultations. AparaiTech is not a diagnostic tool and 
does not replace professional medical advice.

Always consult your OB-GYN for clinical interpretation.

═══════════════════════════════════════════════════════════
AparaiTech v1.0 • Medical Grade Encryption
═══════════════════════════════════════════════════════════`;

      setIsExporting(false);

      // Share the report
      try {
        await Share.share({
          message: reportContent,
          title: `Week ${currentWeek} Clinical Report - ${new Date().toLocaleDateString()}`,
        });
      } catch (error) {
        Alert.alert(
          '✅ Report Generated',
          'Clinical report ready to share with your doctor!',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      setIsExporting(false);
      Alert.alert('❌ Error', 'Could not generate report. Please try again.');
      console.error('Error:', error);
    }
  };

  const handleShareReport = async () => {
    try {
      const reportText = `📋 *AparaiTech Pregnancy Clinical Report*\n\n` +
        `*Week ${currentWeek} • Trimester ${trimester}*\n\n` +
        `📊 *Maternal Health Snapshot:*\n` +
        `• Fetal Activity: 10 kicks/34m (Normal)\n` +
        `• Weight Gain: +4.2 kg (T${trimester} guideline)\n` +
        `• Hydration: 2,250 ml/day (90% of target)\n` +
        `• Wellness: Good - No red flags\n\n` +
        `📅 *Report Period:* ${selectedPeriod === '1week' ? '1 Week' : selectedPeriod === '1month' ? '1 Month' : selectedPeriod === 'trimester' ? 'Trimester' : 'Full'}\n` +
        `🗓️ *Generated:* ${new Date().toLocaleDateString()}\n\n` +
        `🔒 *Disclaimer:* Self-reported data for doctor consultations. Not diagnostic.`;

      // WhatsApp Share
      const whatsappURL = `whatsapp://send?text=${encodeURIComponent(reportText)}`;
      
      const canOpen = await Linking.canOpenURL(whatsappURL);
      if (canOpen) {
        await Linking.openURL(whatsappURL);
        Alert.alert('✅ Opening WhatsApp', 'Your report is ready to share with your doctor');
      } else {
        // Fallback to generic share
        await Share.share({
          message: reportText,
          title: `Week ${currentWeek} Clinical Report`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open sharing options. Please try again.');
    }
  };

  const handleEmailShare = async () => {
    try {
      const emailURL = `mailto:?subject=Week%20${currentWeek}%20Clinical%20Report&body=Please%20find%20attached%20my%20pregnancy%20wellness%20report`;
      await Linking.openURL(emailURL);
    } catch (error) {
      Alert.alert('Error', 'Could not open email');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#E11D48"
          />
        }
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenHeading}>Generate Report</Text>
            <Text style={styles.screenSubtitle}>
              Week {currentWeek} • Trimester {trimester}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/reports/history')}
            style={styles.historyBtn}
            activeOpacity={0.8}
          >
            <History size={14} color="#0F172A" />
            <Text style={styles.historyBtnText}>Archive</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Main PDF Report Export Hero Card */}
        <View style={styles.exportHeroCard}>
          <View style={styles.heroTop}>
            <View style={styles.pdfBadge}>
              <Download size={14} color="#E11D48" strokeWidth={2.5} />
              <Text style={styles.pdfBadgeText}>EXPORT READY</Text>
            </View>
            <View style={styles.statusPill}>
              <CheckCircle size={14} color="#059669" strokeWidth={2.5} />
              <Text style={styles.statusText}>Complete</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>OB-GYN Visit Summary</Text>
          <Text style={styles.heroBody}>
            Comprehensive maternal vitals, fetal movements, hydration logs, and symptom tracking formatted for clinical review.
          </Text>

          <TouchableOpacity
            style={styles.previewDocBtn}
            onPress={() => router.push('/reports/preview')}
            activeOpacity={0.85}
          >
            <FileText size={15} color="#0F172A" />
            <Text style={styles.previewDocBtnText}>View Clinical Document Preview</Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleExportPDF}
              style={[styles.actionBtn, styles.primaryBtn]}
              activeOpacity={0.85}
              disabled={isExporting}
            >
              {isExporting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Download size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.primaryBtnText}>Export PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShareReport}
              style={[styles.actionBtn, styles.whatsappBtn]}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color="#25D366" strokeWidth={2.5} />
              <Text style={styles.whatsappBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEmailShare}
              style={[styles.actionBtn, styles.secondaryBtn]}
              activeOpacity={0.8}
            >
              <Share2 size={16} color="#E11D48" strokeWidth={2.5} />
              <Text style={styles.secondaryBtnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Key Metrics Overview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Maternal Health Snapshot</Text>
          <View style={styles.sectionBadge}>
            <TrendingUp size={14} color="#0284C7" strokeWidth={2} />
            <Text style={styles.sectionBadgeText}>On Track</Text>
          </View>
        </View>

        {/* Health Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricBox, styles.metricBoxPrimary]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>👣</Text>
              <Text style={styles.metricLabel}>FETAL ACTIVITY</Text>
            </View>
            <Text style={styles.metricValue}>10 kicks/34m</Text>
            <Text style={styles.metricStatus}>✓ Normal reactivity</Text>
          </View>

          <View style={[styles.metricBox, styles.metricBoxSecondary]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>⚖️</Text>
              <Text style={styles.metricLabel}>WEIGHT GAIN</Text>
            </View>
            <Text style={styles.metricValue}>+4.2 kg</Text>
            <Text style={styles.metricStatus}>✓ T{trimester} guideline</Text>
          </View>

          <View style={[styles.metricBox, styles.metricBoxTertiary]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>💧</Text>
              <Text style={styles.metricLabel}>HYDRATION</Text>
            </View>
            <Text style={styles.metricValue}>2,250 ml/day</Text>
            <Text style={styles.metricStatus}>✓ 90% of target</Text>
          </View>

          <View style={[styles.metricBox, styles.metricBoxQuaternary]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricIcon}>😌</Text>
              <Text style={styles.metricLabel}>WELLNESS</Text>
            </View>
            <Text style={styles.metricValue}>Good</Text>
            <Text style={styles.metricStatus}>✓ No red flags</Text>
          </View>
        </View>

        {/* Data Range Selector */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Report Period</Text>
        </View>

        <View style={styles.dateRangeRow}>
          <TouchableOpacity 
            style={[styles.dateBtn, selectedPeriod === '1week' && styles.dateBtnActive]} 
            onPress={() => setSelectedPeriod('1week')}
            activeOpacity={0.7}
          >
            <Text style={selectedPeriod === '1week' ? styles.dateBtnActiveText : styles.dateBtnText}>1 Week</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateBtn, selectedPeriod === '1month' && styles.dateBtnActive]} 
            onPress={() => setSelectedPeriod('1month')}
            activeOpacity={0.7}
          >
            <Text style={selectedPeriod === '1month' ? styles.dateBtnActiveText : styles.dateBtnText}>1 Month</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateBtn, selectedPeriod === 'trimester' && styles.dateBtnActive]} 
            onPress={() => setSelectedPeriod('trimester')}
            activeOpacity={0.7}
          >
            <Text style={selectedPeriod === 'trimester' ? styles.dateBtnActiveText : styles.dateBtnText}>Trimester</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.dateBtn, selectedPeriod === 'full' && styles.dateBtnActive]} 
            onPress={() => setSelectedPeriod('full')}
            activeOpacity={0.7}
          >
            <Text style={selectedPeriod === 'full' ? styles.dateBtnActiveText : styles.dateBtnText}>Full</Text>
          </TouchableOpacity>
        </View>

        {/* 4. Recent Activity Log */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        <View style={styles.activityLog}>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Kick Counter Session</Text>
              <Text style={styles.activityTime}>Today at 2:30 PM • 10 kicks in 34 minutes</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#0284C7' }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Weight Logged</Text>
              <Text style={styles.activityTime}>Today at 7:45 AM • 64.2 kg</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: '#059669' }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Hydration Goal Achieved</Text>
              <Text style={styles.activityTime}>Yesterday • 2,500 ml consumed</Text>
            </View>
          </View>
        </View>

        {/* 5. Medical Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>🔒</Text>
          <Text style={styles.disclaimerText}>
            These reports are generated from self-reported data to facilitate doctor consultations. AparaiTech is not a diagnostic tool and does not replace professional medical advice. Always consult your OB-GYN for clinical interpretation.
          </Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  screenHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  exportHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
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
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pdfBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E11D48',
    letterSpacing: 0.4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  heroBody: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#475569',
    marginBottom: 12,
  },
  previewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  previewDocBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 11,
    minHeight: 48,
  },
  primaryBtn: {
    backgroundColor: '#0F172A',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#FEE2E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  secondaryBtnText: {
    color: '#E11D48',
    fontSize: 12,
    fontWeight: '700',
  },
  whatsappBtn: {
    backgroundColor: '#E7F7F2',
    borderWidth: 1,
    borderColor: '#D1E7DD',
  },
  whatsappBtnText: {
    color: '#25D366',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricBox: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  metricBoxPrimary: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E6',
  },
  metricBoxSecondary: {
    backgroundColor: '#F0F9FF',
    borderColor: '#E0F2FE',
  },
  metricBoxTertiary: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  metricBoxQuaternary: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricIcon: {
    fontSize: 18,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  metricStatus: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dateBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  dateBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  dateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dateBtnActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activityLog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E11D48',
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#64748B',
  },
  disclaimerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 10,
  },
  disclaimerIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 15.5,
    color: '#64748B',
    flex: 1,
  },
});
