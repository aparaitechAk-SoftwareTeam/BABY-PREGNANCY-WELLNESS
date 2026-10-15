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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Heart,
  Baby,
  User,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2,
  Trash2,
  X,
  Stethoscope,
  BookOpen,
} from 'lucide-react-native';
import {
  useBirthPrepStore,
  ChecklistItem,
  BirthPlanPreferences,
} from '../../store/birth-prep.store';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function BirthPrepScreen() {
  const router = useRouter();
  const currentWeek = usePregnancyStore((state) => state.currentWeek);

  const {
    checklist,
    birthPlan,
    toggleItemPacked,
    addCustomChecklistItem,
    deleteChecklistItem,
    updateBirthPlan,
    getStats,
    loadBirthPrepData,
  } = useBirthPrepStore();

  const [activeTab, setActiveTab] = useState<'checklist' | 'birth_plan' | 'postpartum'>('checklist');
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'mother' | 'baby' | 'partner' | 'documents'>('all');

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ChecklistItem['category']>('mother');

  // Birth Plan Form Local State
  const [laborCompanion, setLaborCompanion] = useState(birthPlan.laborCompanion);
  const [painManagement, setPainManagement] = useState(birthPlan.painManagement);
  const [specialWishes, setSpecialWishes] = useState(birthPlan.specialWishes);

  useEffect(() => {
    loadBirthPrepData();
  }, []);

  const stats = getStats();

  const filteredChecklist = checklist.filter((item) => {
    if (checklistFilter === 'all') return true;
    return item.category === checklistFilter;
  });

  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Missing Name', 'Please enter an item name.');
      return;
    }
    await addCustomChecklistItem(newItemName.trim(), newItemCategory);
    setNewItemName('');
    setShowAddModal(false);
  };

  const handleSaveBirthPlan = async () => {
    await updateBirthPlan({
      laborCompanion,
      painManagement,
      specialWishes,
    });
    Alert.alert('Birth Plan Saved', 'Your birth plan preferences have been securely saved and can be shared with your obstetrician.');
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
          <Text style={styles.headerTitle}>Birth Prep & Postpartum</Text>
          <Text style={styles.headerSubtitle}>
            Week {currentWeek || 20} • Delivery Readiness Hub
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Top 3-Way Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'checklist' && styles.tabItemActive]}
          onPress={() => setActiveTab('checklist')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabLabel, activeTab === 'checklist' && styles.tabLabelActive]}>
            🎒 Hospital Bag
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'birth_plan' && styles.tabItemActive]}
          onPress={() => setActiveTab('birth_plan')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabLabel, activeTab === 'birth_plan' && styles.tabLabelActive]}>
            📜 Birth Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'postpartum' && styles.tabItemActive]}
          onPress={() => setActiveTab('postpartum')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabLabel, activeTab === 'postpartum' && styles.tabLabelActive]}>
            🌸 Postpartum
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: HOSPITAL BAG CHECKLIST */}
        {activeTab === 'checklist' && (
          <View>
            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeaderRow}>
                <View>
                  <Text style={styles.progressTitle}>Hospital Bag Readiness</Text>
                  <Text style={styles.progressSubtitle}>
                    {stats.packed} of {stats.total} essentials packed ({stats.percent}%)
                  </Text>
                </View>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentBadgeText}>{stats.percent}%</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${stats.percent}%` }]} />
              </View>

              <Text style={styles.progressHint}>
                💡 Obstetric Tip: Have your bag fully packed by Week 36 so you are prepared if baby arrives early.
              </Text>
            </View>

            {/* Sub-Category Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subFilterRow}
            >
              {[
                { key: 'all', label: 'All Items' },
                { key: 'mother', label: 'Mother (7)' },
                { key: 'baby', label: 'Baby (6)' },
                { key: 'partner', label: 'Partner (5)' },
                { key: 'documents', label: 'Documents (5)' },
              ].map((tab) => {
                const isActive = checklistFilter === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.subFilterChip, isActive && styles.subFilterChipActive]}
                    onPress={() => setChecklistFilter(tab.key as any)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.subFilterText,
                        isActive && styles.subFilterTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Checklist Items */}
            <View style={styles.itemsListSection}>
              {filteredChecklist.map((item) => (
                <View
                  key={item.id}
                  style={[styles.checkCard, item.isPacked && styles.checkCardPacked]}
                >
                  <TouchableOpacity
                    style={styles.checkToggleBtn}
                    onPress={() => toggleItemPacked(item.id)}
                    activeOpacity={0.7}
                  >
                    {item.isPacked ? (
                      <CheckCircle2 size={22} color="#10B981" strokeWidth={2.5} />
                    ) : (
                      <Circle size={22} color="#CBD5E1" strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.itemTextCol}>
                    <Text
                      style={[styles.itemName, item.isPacked && styles.itemNamePacked]}
                    >
                      {item.name}
                    </Text>
                    <View style={styles.itemMetaRow}>
                      <Text style={styles.categoryBadgeText}>
                        {item.category.toUpperCase()}
                      </Text>
                      {item.isEssential ? (
                        <View style={styles.essentialPill}>
                          <Text style={styles.essentialPillText}>ESSENTIAL</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteChecklistItem(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TAB 2: BIRTH PLAN ORGANIZER */}
        {activeTab === 'birth_plan' && (
          <View style={styles.birthPlanSection}>
            <View style={styles.planInfoCard}>
              <Sparkles size={20} color="#E11D48" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.planInfoTitle}>Personalized Birth Preferences</Text>
                <Text style={styles.planInfoSub}>
                  Share your wishes with your OB-GYN and labor care team. Keep in mind birth can be unpredictable, but sharing your preferences ensures your voice is heard.
                </Text>
              </View>
            </View>

            {/* Preference 1: Labor Companion */}
            <View style={styles.preferenceCard}>
              <Text style={styles.prefHeading}>1. Labor Room Companion</Text>
              <View style={styles.chipOptionGroup}>
                {[
                  'Partner / Husband present throughout',
                  'Mother / Female relative present',
                  'Doula & Partner present',
                  'Prefer medical staff only',
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionChip, laborCompanion === opt && styles.optionChipActive]}
                    onPress={() => setLaborCompanion(opt)}
                  >
                    <Text style={[styles.optionChipText, laborCompanion === opt && styles.optionChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preference 2: Pain Management */}
            <View style={styles.preferenceCard}>
              <Text style={styles.prefHeading}>2. Pain Management Preference</Text>
              <View style={styles.chipOptionGroup}>
                {[
                  'Epidural available on request after active labor begins',
                  'Attempt unmedicated with breathing & warm shower first',
                  'Nitrous oxide gas / Entonox',
                  'Leave open to doctor recommendation during labor',
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionChip, painManagement === opt && styles.optionChipActive]}
                    onPress={() => setPainManagement(opt)}
                  >
                    <Text style={[styles.optionChipText, painManagement === opt && styles.optionChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Preference 3: Delivery & Newborn Golden Hour */}
            <View style={styles.preferenceCard}>
              <Text style={styles.prefHeading}>3. Newborn First Golden Hour (Standard Practices)</Text>
              <View style={styles.standardList}>
                <View style={styles.standardRow}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.standardText}>Delayed umbilical cord clamping (1-2 minutes)</Text>
                </View>
                <View style={styles.standardRow}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.standardText}>Immediate skin-to-skin contact with mother</Text>
                </View>
                <View style={styles.standardRow}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.standardText}>Initiation of breastfeeding within first hour</Text>
                </View>
              </View>
            </View>

            {/* Special Wishes */}
            <View style={styles.preferenceCard}>
              <Text style={styles.prefHeading}>4. Special Requests / Notes for Obstetrician</Text>
              <TextInput
                style={styles.wishesInput}
                placeholder="e.g. Partner would like to cut the umbilical cord; prefer dim lighting in labor room..."
                placeholderTextColor="#94A3B8"
                value={specialWishes}
                onChangeText={setSpecialWishes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Action */}
            <TouchableOpacity
              style={styles.savePlanBtn}
              onPress={handleSaveBirthPlan}
              activeOpacity={0.85}
            >
              <Text style={styles.savePlanBtnText}>Save Birth Plan Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 3: POSTPARTUM RECOVERY GUIDE */}
        {activeTab === 'postpartum' && (
          <View style={styles.postpartumSection}>
            {/* Guide Card 1: Lochia / Bleeding Stages */}
            <View style={styles.guideCard}>
              <View style={styles.guideCardHeader}>
                <View style={[styles.guideIconBg, { backgroundColor: '#FEE2E6' }]}>
                  <Heart size={18} color="#E11D48" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideTitle}>Postpartum Lochia (Bleeding Stages)</Text>
                  <Text style={styles.guideSub}>What is normal after vaginal or C-section delivery</Text>
                </View>
              </View>

              <View style={styles.stageTimeline}>
                <View style={styles.stageItem}>
                  <Text style={styles.stageDays}>Days 1 - 3</Text>
                  <Text style={styles.stageName}>Lochia Rubra (Bright Red)</Text>
                  <Text style={styles.stageDesc}>Heavier flow similar to a menstrual period. Small grape-sized clots are common.</Text>
                </View>

                <View style={styles.stageItem}>
                  <Text style={styles.stageDays}>Days 4 - 10</Text>
                  <Text style={styles.stageName}>Lochia Serosa (Pink / Brown)</Text>
                  <Text style={styles.stageDesc}>Lighter flow, watery consistency as the placental site heals.</Text>
                </View>

                <View style={styles.stageItem}>
                  <Text style={styles.stageDays}>Weeks 2 - 6</Text>
                  <Text style={styles.stageName}>Lochia Alba (Creamy White / Yellow)</Text>
                  <Text style={styles.stageDesc}>Minimal discharge tapering off completely by 6 weeks.</Text>
                </View>
              </View>

              <View style={styles.redFlagAlert}>
                <AlertTriangle size={15} color="#DC2626" />
                <Text style={styles.redFlagText}>
                  RED FLAG: Soaking more than 1 large pad per hour or passing plum-sized clots requires emergency medical evaluation.
                </Text>
              </View>
            </View>

            {/* Guide Card 2: Colostrum & Early Breastfeeding */}
            <View style={styles.guideCard}>
              <View style={styles.guideCardHeader}>
                <View style={[styles.guideIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <Baby size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideTitle}>Early Milk (Colostrum) & Latch</Text>
                  <Text style={styles.guideSub}>Golden first drops & feeding frequency</Text>
                </View>
              </View>

              <Text style={styles.guideContentText}>
                Your breasts produce thick, golden colostrum during the first 3 days. Although it looks like only teaspoons, it is packed with maternal antibodies and protein perfectly matched to a newborn’s marble-sized stomach. Feed 8-12 times in 24 hours on demand.
              </Text>
            </View>

            {/* Guide Card 3: Emotional Healing - Baby Blues vs PPD */}
            <View style={styles.guideCard}>
              <View style={styles.guideCardHeader}>
                <View style={[styles.guideIconBg, { backgroundColor: '#E0F2FE' }]}>
                  <Sparkles size={18} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.guideTitle}>Postpartum Blues vs Depression</Text>
                  <Text style={styles.guideSub}>Understanding hormonal shifts after birth</Text>
                </View>
              </View>

              <Text style={styles.guideContentText}>
                Up to 80% of mothers experience the "Baby Blues" (tearfulness, mood swings) during the first 1-2 weeks due to steep drops in progesterone. If sadness, anxiety, or feeling overwhelmed lasts beyond 2 weeks, speak with your doctor or reach out to our Support Team for postpartum resources.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL: ADD CUSTOM CHECKLIST ITEM */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Add Item to Hospital Bag</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseBtn}
            >
              <X size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Item Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Lip balm, extra warm shawl, baby nail trimmer"
              placeholderTextColor="#94A3B8"
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {[
                { key: 'mother', label: 'Mother’s Bag' },
                { key: 'baby', label: 'Baby’s Bag' },
                { key: 'partner', label: 'Partner’s Bag' },
                { key: 'documents', label: 'Documents File' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.catChip,
                    newItemCategory === c.key && styles.catChipActive,
                  ]}
                  onPress={() => setNewItemCategory(c.key as any)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      newItemCategory === c.key && styles.catChipTextActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleAddCustomItem}
              activeOpacity={0.85}
            >
              <Text style={styles.modalSaveBtnText}>Add to Checklist</Text>
            </TouchableOpacity>
          </View>
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
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#E11D48',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabLabelActive: {
    color: '#E11D48',
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressHint: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  subFilterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  subFilterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subFilterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  subFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemsListSection: {
    paddingHorizontal: 16,
  },
  checkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkCardPacked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  checkToggleBtn: {
    paddingRight: 10,
  },
  itemTextCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  itemNamePacked: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  essentialPill: {
    backgroundColor: '#FEE2E6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  essentialPillText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#E11D48',
  },
  deleteBtn: {
    padding: 4,
  },
  birthPlanSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  planInfoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF1F2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  planInfoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#9F1239',
    marginBottom: 2,
  },
  planInfoSub: {
    fontSize: 11.5,
    color: '#BE123C',
    lineHeight: 16,
  },
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  prefHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  chipOptionGroup: {
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionChipActive: {
    backgroundColor: '#FEE2E6',
    borderColor: '#E11D48',
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  optionChipTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  standardList: {
    gap: 8,
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  standardText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  wishesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    height: 70,
    textAlignVertical: 'top',
  },
  savePlanBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  savePlanBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  postpartumSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guideCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  guideIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  guideSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  stageTimeline: {
    borderLeftWidth: 2,
    borderLeftColor: '#FEE2E6',
    paddingLeft: 12,
    gap: 12,
    marginBottom: 12,
  },
  stageItem: {},
  stageDays: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E11D48',
  },
  stageName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  stageDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  redFlagAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 6,
  },
  redFlagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#991B1B',
    flex: 1,
    lineHeight: 15,
  },
  guideContentText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#334155',
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
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#FEE2E6',
    borderColor: '#E11D48',
  },
  catChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#E11D48',
    fontWeight: '700',
  },
  modalSaveBtn: {
    backgroundColor: '#E11D48',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
