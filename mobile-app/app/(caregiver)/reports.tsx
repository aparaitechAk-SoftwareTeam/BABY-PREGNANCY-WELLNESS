import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Modal,
  Platform,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FileText,
  TrendingUp,
  BarChart3,
  X,
  FolderLock,
  Download,
  Share2,
  Calendar,
  Eye,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import PDFViewerComponent from '../../components/PDFViewer';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useVaultStore, MedicalDocument } from '../../store/vault.store';

interface SavedReportRecord {
  id: string;
  title: string;
  dateStr: string;
  week: number;
  fileSize: string;
  type: string;
}

const STORAGE_SAVED_REPORTS = 'aparai_saved_reports_v1';

export default function CaregiverReports() {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollOffsetY = React.useRef(new Animated.Value(0)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ name: string; type: string } | null>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<MedicalDocument | null>(null);

  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);
  const trimester = usePregnancyStore((state) => state.trimester);

  const vaultDocs = useVaultStore((state) => state.documents);
  const loadVaultDocs = useVaultStore((state) => state.loadDocuments);

  const [savedConsultationReports, setSavedConsultationReports] = useState<SavedReportRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vault' | 'consultations'>('all');

  const loadData = async () => {
    await loadVaultDocs();
    try {
      const stored = await AsyncStorage.getItem(STORAGE_SAVED_REPORTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedConsultationReports(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load consultation reports:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // Only documents the mother explicitly marked as shared
  const sharedVaultDocs = vaultDocs.filter((doc) => doc.isSharedWithCaregiver);

  const handleViewPDF = (name: string, type: string) => {
    setSelectedReport({ name, type });
    setShowPDF(true);
  };

  const handleShare = async (title: string, detail: string) => {
    await Share.share({
      title,
      message: `Sharing AparaiTech Shared Health Record:\n${title}\n${detail}`,
    });
  };

  const handleWhatsAppShare = async (title: string, detail: string) => {
    try {
      const text = `*AparaiTech Shared Medical Document*\n📄 *${title}*\n${detail}\n\nShared securely for family care coordination.`;
      const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await handleShare(title, detail);
      }
    } catch {
      await handleShare(title, detail);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#E11D48"
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenHeading}>Shared Health Records</Text>
            <Text style={styles.screenSubtitle}>
              Week {currentWeek || 20} • Trimester {trimester || 2} • Medical vault & summaries
            </Text>
          </View>
        </View>

        {/* Security / Consent Banner */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <FolderLock size={16} color="#0369A1" />
            <Text style={styles.infoTitle}>Mother-Authorized Access</Text>
          </View>
          <Text style={styles.infoText}>
            You can view medical records and consultation summaries that the mother has chosen to share with you. Keep these documents ready for clinic visits and pharmacy pickups.
          </Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'all' && styles.filterPillTextActive,
              ]}
            >
              All Records ({sharedVaultDocs.length + savedConsultationReports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'vault' && styles.filterPillActive]}
            onPress={() => setActiveFilter('vault')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'vault' && styles.filterPillTextActive,
              ]}
            >
              Medical Vault ({sharedVaultDocs.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'consultations' && styles.filterPillActive]}
            onPress={() => setActiveFilter('consultations')}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterPillText,
                activeFilter === 'consultations' && styles.filterPillTextActive,
              ]}
            >
              Consultations ({savedConsultationReports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Shared Medical Vault Files (Ultrasounds, Prescriptions, Labs) */}
        {(activeFilter === 'all' || activeFilter === 'vault') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Shared Medical Vault Documents</Text>
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#059669" />
                <Text style={styles.verifiedBadgeText}>Encrypted</Text>
              </View>
            </View>

            {sharedVaultDocs.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  No documents shared in the Medical Vault yet. The mother can toggle sharing on any scan or prescription in her Vault.
                </Text>
              </View>
            ) : (
              sharedVaultDocs.map((doc) => (
                <View key={doc.id} style={styles.docCard}>
                  <View style={styles.docTopRow}>
                    <View
                      style={[
                        styles.docIconBg,
                        {
                          backgroundColor:
                            doc.category === 'ultrasound'
                              ? '#FEE2E6'
                              : doc.category === 'prescription'
                              ? '#E0F2FE'
                              : '#DCFCE7',
                        },
                      ]}
                    >
                      <FileText
                        size={20}
                        color={
                          doc.category === 'ultrasound'
                            ? '#E11D48'
                            : doc.category === 'prescription'
                            ? '#0284C7'
                            : '#15803D'
                        }
                      />
                    </View>

                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docSubtitle}>
                        {doc.doctorName} • {doc.clinicName}
                      </Text>
                      <View style={styles.docMetaRow}>
                        <Calendar size={11} color="#64748B" />
                        <Text style={styles.docDate}>{doc.date}</Text>
                        <Text style={styles.docSize}>• {doc.fileSize}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Doctor's Note snippet */}
                  {doc.notes ? (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesText} numberOfLines={2}>
                        💬 Doctor's Note: {doc.notes}
                      </Text>
                    </View>
                  ) : null}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => setSelectedDocDetails(doc)}
                      activeOpacity={0.8}
                    >
                      <Eye size={13} color="#0F172A" />
                      <Text style={styles.actionBtnSecondaryText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => handleViewPDF(doc.title, doc.category)}
                      activeOpacity={0.8}
                    >
                      <FileText size={13} color="#0284C7" />
                      <Text style={[styles.actionBtnSecondaryText, { color: '#0284C7' }]}>
                        Preview PDF
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnWhatsApp}
                      onPress={() =>
                        handleWhatsAppShare(
                          doc.title,
                          `Date: ${doc.date}\nDoctor: ${doc.doctorName}\nClinic: ${doc.clinicName}\nNotes: ${doc.notes}`
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <MessageCircle size={13} color="#15803D" />
                      <Text style={styles.actionBtnWhatsAppText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Section 2: Generated Clinical Consultation Reports */}
        {(activeFilter === 'all' || activeFilter === 'consultations') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Doctor-Ready Consultation Reports</Text>
              <Text style={styles.sectionSubtitleSmall}>
                Vitals, kick trends & doctor questions
              </Text>
            </View>

            {savedConsultationReports.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  No saved consultation reports yet. When the mother generates a clinical report, it will appear here for family review.
                </Text>
              </View>
            ) : (
              savedConsultationReports.map((report) => (
                <View key={report.id} style={styles.docCard}>
                  <View style={styles.docTopRow}>
                    <View style={[styles.docIconBg, { backgroundColor: '#F5F3FF' }]}>
                      <TrendingUp size={20} color="#7C3AED" />
                    </View>

                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>{report.title}</Text>
                      <Text style={styles.docSubtitle}>{report.type} • Week {report.week}</Text>
                      <View style={styles.docMetaRow}>
                        <Calendar size={11} color="#64748B" />
                        <Text style={styles.docDate}>{report.dateStr}</Text>
                        <Text style={styles.docSize}>• {report.fileSize}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => handleViewPDF(report.title, 'clinical')}
                      activeOpacity={0.8}
                    >
                      <Eye size={13} color="#0F172A" />
                      <Text style={styles.actionBtnSecondaryText}>Review Report</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnWhatsApp}
                      onPress={() =>
                        handleWhatsAppShare(
                          report.title,
                          `Clinical consultation summary for Week ${report.week} (${report.dateStr}). Includes vitals, kick reactivities, and doctor consultation questions.`
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <MessageCircle size={13} color="#15803D" />
                      <Text style={styles.actionBtnWhatsAppText}>Forward to Doctor</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* PDF Modal */}
      <Modal
        visible={showPDF}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPDF(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>{selectedReport?.name}</Text>
              <Text style={styles.modalSubtitle}>Confidential Patient Clinical Document</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPDF(false)} style={styles.modalCloseButton}>
              <X size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <PDFViewerComponent
            reportName={selectedReport?.name || ''}
            reportType={selectedReport?.type || ''}
          />
        </View>
      </Modal>

      {/* Document Details Modal */}
      <Modal
        visible={selectedDocDetails !== null}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedDocDetails(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModalCard}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>{selectedDocDetails?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedDocDetails(null)}>
                <X size={20} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailMetaGrid}>
              <Text style={styles.detailLabel}>Doctor / OB-GYN</Text>
              <Text style={styles.detailValue}>{selectedDocDetails?.doctorName}</Text>

              <Text style={styles.detailLabel}>Hospital / Lab</Text>
              <Text style={styles.detailValue}>{selectedDocDetails?.clinicName}</Text>

              <Text style={styles.detailLabel}>Date of Document</Text>
              <Text style={styles.detailValue}>{selectedDocDetails?.date}</Text>

              <Text style={styles.detailLabel}>Doctor's Clinical Notes</Text>
              <Text style={styles.detailNotesText}>
                {selectedDocDetails?.notes || 'No notes attached.'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.detailDoneBtn}
              onPress={() => setSelectedDocDetails(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.detailDoneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },
  headerRow: {
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369A1',
  },
  infoText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitleSmall: {
    fontSize: 10.5,
    color: '#64748B',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#059669',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyCardText: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
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
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  docIconBg: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  docSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  docDate: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  docSize: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionBtnWhatsApp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  actionBtnWhatsAppText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  detailModalTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailMetaGrid: {
    gap: 4,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailNotesText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  detailDoneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
