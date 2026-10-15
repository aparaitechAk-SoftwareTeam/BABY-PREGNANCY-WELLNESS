import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  FileText,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Eye,
  Trash2,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  UserCheck,
  X,
  FileCheck2,
  Sparkles,
} from 'lucide-react-native';
import { useVaultStore, MedicalDocument, DocumentCategory } from '../../store/vault.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function DocumentVaultScreen() {
  const router = useRouter();
  const profile = usePregnancyStore((state) => state.profile);

  const {
    documents,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    addDocument,
    deleteDocument,
    toggleCaregiverShare,
    loadDocuments,
  } = useVaultStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<MedicalDocument | null>(null);

  // Form State for New Document
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<DocumentCategory>('ultrasound');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDoctor, setFormDoctor] = useState(profile?.doctorName || 'Dr. Priya Sharma');
  const [formClinic, setFormClinic] = useState(profile?.hospitalName || 'Apollo Cradle Hospital');
  const [formNotes, setFormNotes] = useState('');
  const [formShareWithCaregiver, setFormShareWithCaregiver] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const filteredDocs = useVaultStore((state) => state.getFilteredDocuments)();

  const categories: { key: DocumentCategory | 'all'; label: string; emoji: string }[] = [
    { key: 'all', label: 'All Files', emoji: '📁' },
    { key: 'ultrasound', label: 'Ultrasounds', emoji: '🩺' },
    { key: 'prescription', label: 'Prescriptions', emoji: '💊' },
    { key: 'lab_report', label: 'Lab Reports', emoji: '🧪' },
    { key: 'vaccination', label: 'Vaccines', emoji: '💉' },
    { key: 'discharge_summary', label: 'Discharge', emoji: '📋' },
  ];

  const handleSaveDocument = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the document.');
      return;
    }

    await addDocument({
      title: formTitle.trim(),
      category: formCategory,
      date: formDate,
      doctorName: formDoctor.trim() || 'Dr. Priya Sharma',
      clinicName: formClinic.trim() || 'Apollo Cradle Hospital',
      notes: formNotes.trim() || 'Recorded during prenatal consultation.',
      fileType: 'pdf',
      fileSize: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      isSharedWithCaregiver: formShareWithCaregiver,
    });

    setShowAddModal(false);
    // Reset Form
    setFormTitle('');
    setFormNotes('');
    Alert.alert('Document Saved', 'Your medical document has been securely stored in your vault.');
  };

  const handleDelete = (doc: MedicalDocument) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteDocument(doc.id);
            if (previewDoc?.id === doc.id) setPreviewDoc(null);
          },
        },
      ]
    );
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
          <Text style={styles.headerTitle}>Medical Document Vault</Text>
          <View style={styles.vaultSecurityBadge}>
            <ShieldCheck size={12} color="#059669" strokeWidth={2.5} />
            <Text style={styles.vaultSecurityText}>Encrypted & Doctor-Ready</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addHeaderBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{documents.length}</Text>
            <Text style={styles.statLabel}>Total Files</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {documents.filter((d) => d.category === 'ultrasound').length}
            </Text>
            <Text style={styles.statLabel}>Ultrasounds</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {documents.filter((d) => d.category === 'lab_report').length}
            </Text>
            <Text style={styles.statLabel}>Lab Tests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {documents.filter((d) => d.isSharedWithCaregiver).length}
            </Text>
            <Text style={styles.statLabel}>Shared Partner</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports, doctor notes, scans..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((c) => {
            const isSelected = selectedCategory === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setSelectedCategory(c.key)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected && styles.categoryPillTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Document List */}
        <View style={styles.docListSection}>
          <View style={styles.docListHeader}>
            <Text style={styles.docListTitle}>
              {selectedCategory === 'all'
                ? 'All Prescriptions & Scans'
                : categories.find((c) => c.key === selectedCategory)?.label}
            </Text>
            <Text style={styles.docCountBadge}>{filteredDocs.length} files</Text>
          </View>

          {filteredDocs.length === 0 ? (
            <View style={styles.emptyCard}>
              <FileText size={44} color="#CBD5E1" strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>No documents found</Text>
              <Text style={styles.emptySub}>
                Upload your ultrasound scans, blood tests, and doctor prescriptions to keep them organized.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyAddBtnText}>+ Add First Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredDocs.map((doc) => (
              <View key={doc.id} style={styles.docCard}>
                {/* Header Row of Card */}
                <View style={styles.docCardTop}>
                  <View style={styles.docCategoryBadge}>
                    <Text style={styles.docCategoryText}>
                      {doc.category.toUpperCase().replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={styles.docDateText}>{doc.date}</Text>
                </View>

                {/* Title & Metadata */}
                <Text style={styles.docCardTitle}>{doc.title}</Text>

                <View style={styles.docMetaRow}>
                  <Building2 size={13} color="#64748B" />
                  <Text style={styles.docMetaText}>{doc.clinicName}</Text>
                </View>
                <View style={styles.docMetaRow}>
                  <UserCheck size={13} color="#64748B" />
                  <Text style={styles.docMetaText}>{doc.doctorName}</Text>
                </View>

                {/* Notes Snippet */}
                {doc.notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText} numberOfLines={2}>
                      “{doc.notes}”
                    </Text>
                  </View>
                ) : null}

                {/* Bottom Bar: Caregiver Share Switch & Actions */}
                <View style={styles.docCardBottom}>
                  <TouchableOpacity
                    style={styles.caregiverShareToggle}
                    onPress={() => toggleCaregiverShare(doc.id)}
                    activeOpacity={0.8}
                  >
                    <Users
                      size={14}
                      color={doc.isSharedWithCaregiver ? '#059669' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.shareToggleText,
                        doc.isSharedWithCaregiver && styles.shareToggleTextActive,
                      ]}
                    >
                      {doc.isSharedWithCaregiver ? 'Shared with Partner' : 'Private'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setPreviewDoc(doc)}
                      activeOpacity={0.7}
                    >
                      <Eye size={15} color="#0284C7" />
                      <Text style={styles.actionBtnText}>Preview</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDelete(doc)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* MODAL 1: ADD DOCUMENT */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Add Medical Document</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.closeBtn}
            >
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.inputLabel}>Document Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 24-Week Anomaly Ultrasound Report"
              placeholderTextColor="#94A3B8"
              value={formTitle}
              onChangeText={setFormTitle}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.modalCategoryGrid}>
              {[
                { key: 'ultrasound', label: 'Ultrasound Scan' },
                { key: 'prescription', label: 'Prescription' },
                { key: 'lab_report', label: 'Blood / Lab Test' },
                { key: 'vaccination', label: 'Immunization' },
                { key: 'discharge_summary', label: 'Hospital Summary' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.modalCatChip,
                    formCategory === c.key && styles.modalCatChipActive,
                  ]}
                  onPress={() => setFormCategory(c.key as DocumentCategory)}
                >
                  <Text
                    style={[
                      styles.modalCatChipText,
                      formCategory === c.key && styles.modalCatChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Date of Report (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="2026-10-15"
              placeholderTextColor="#94A3B8"
              value={formDate}
              onChangeText={setFormDate}
            />

            <Text style={styles.inputLabel}>Doctor / Radiologist / Pathologist</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Dr. Priya Sharma"
              placeholderTextColor="#94A3B8"
              value={formDoctor}
              onChangeText={setFormDoctor}
            />

            <Text style={styles.inputLabel}>Hospital / Diagnostic Center</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Apollo Cradle Maternity Hospital"
              placeholderTextColor="#94A3B8"
              value={formClinic}
              onChangeText={setFormClinic}
            />

            <Text style={styles.inputLabel}>Doctor Notes & Clinical Summary</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Key findings: Amniotic fluid normal, gestational growth consistent, normal cardiac activity..."
              placeholderTextColor="#94A3B8"
              value={formNotes}
              onChangeText={setFormNotes}
              multiline
              numberOfLines={4}
            />

            {/* Caregiver Share Switch */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Share with Caregiver Partner</Text>
                <Text style={styles.switchSub}>
                  Permit connected family members to view this document in their app.
                </Text>
              </View>
              <Switch
                value={formShareWithCaregiver}
                onValueChange={setFormShareWithCaregiver}
                trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
                thumbColor={formShareWithCaregiver ? '#0284C7' : '#F1F5F9'}
              />
            </View>

            <TouchableOpacity
              style={styles.saveDocBtn}
              onPress={handleSaveDocument}
              activeOpacity={0.85}
            >
              <FileCheck2 size={18} color="#FFFFFF" />
              <Text style={styles.saveDocBtnText}>Store in Secure Vault</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: DOCUMENT PREVIEW */}
      <Modal visible={!!previewDoc} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Document Summary</Text>
            <TouchableOpacity
              onPress={() => setPreviewDoc(null)}
              style={styles.closeBtn}
            >
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {previewDoc && (
            <ScrollView
              contentContainerStyle={styles.previewScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.previewBadgeRow}>
                <View style={styles.previewCategoryTag}>
                  <Text style={styles.previewCategoryTagText}>
                    {previewDoc.category.toUpperCase().replace('_', ' ')}
                  </Text>
                </View>
                <Text style={styles.previewSizeText}>
                  {previewDoc.fileType.toUpperCase()} • {previewDoc.fileSize}
                </Text>
              </View>

              <Text style={styles.previewDocTitle}>{previewDoc.title}</Text>

              {/* Clinical Verification Card */}
              <View style={styles.previewClinicCard}>
                <View style={styles.previewClinicRow}>
                  <Building2 size={16} color="#0284C7" />
                  <Text style={styles.previewClinicText}>{previewDoc.clinicName}</Text>
                </View>
                <View style={styles.previewClinicRow}>
                  <UserCheck size={16} color="#059669" />
                  <Text style={styles.previewClinicText}>{previewDoc.doctorName}</Text>
                </View>
                <View style={styles.previewClinicRow}>
                  <Calendar size={16} color="#64748B" />
                  <Text style={styles.previewClinicText}>Report Date: {previewDoc.date}</Text>
                </View>
              </View>

              {/* Clinical Notes Section */}
              <Text style={styles.previewSectionTitle}>Clinical Findings & Interpretation</Text>
              <View style={styles.previewNotesBox}>
                <Text style={styles.previewNotesContent}>{previewDoc.notes}</Text>
              </View>

              {/* Sharing Status */}
              <View style={styles.previewSharingCard}>
                <Users
                  size={18}
                  color={previewDoc.isSharedWithCaregiver ? '#059669' : '#94A3B8'}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.previewSharingTitle}>
                    {previewDoc.isSharedWithCaregiver
                      ? 'Shared with Caregiver Circle'
                      : 'Private Document'}
                  </Text>
                  <Text style={styles.previewSharingSub}>
                    {previewDoc.isSharedWithCaregiver
                      ? 'Your connected partner can view this report in their app.'
                      : 'Only visible on your mother account.'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.previewActionsGrid}>
                <TouchableOpacity
                  style={styles.previewShareBtn}
                  onPress={() =>
                    Alert.alert(
                      'Export Document',
                      `Sending "${previewDoc.title}" to WhatsApp / Email...`
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Share2 size={16} color="#FFFFFF" />
                  <Text style={styles.previewShareBtnText}>Share Document</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewDeleteBtn}
                  onPress={() => handleDelete(previewDoc)}
                  activeOpacity={0.8}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <Text style={styles.previewDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
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
  vaultSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  vaultSecurityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  addHeaderBtn: {
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
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
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
  categoriesRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: '#FEE2E6',
    borderColor: '#E11D48',
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  docListSection: {
    paddingHorizontal: 16,
  },
  docListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  docListTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  docCountBadge: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  emptyAddBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginTop: 14,
  },
  emptyAddBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  docCategoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  docDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  docCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  docMetaText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  notesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 11.5,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  docCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  caregiverShareToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shareToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  shareToggleTextActive: {
    color: '#059669',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  modalCategoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  modalCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalCatChipActive: {
    backgroundColor: '#FEE2E6',
    borderColor: '#E11D48',
  },
  modalCatChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  modalCatChipTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  switchSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  saveDocBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingVertical: 13,
    gap: 8,
  },
  saveDocBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  previewScroll: {
    padding: 16,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCategoryTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  previewCategoryTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  previewSizeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  previewDocTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  previewClinicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 6,
  },
  previewClinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewClinicText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  previewNotesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  previewNotesContent: {
    fontSize: 13,
    lineHeight: 19,
    color: '#334155',
  },
  previewSharingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 18,
  },
  previewSharingTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },
  previewSharingSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 1,
  },
  previewActionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  previewShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
  },
  previewShareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  previewDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewDeleteBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
