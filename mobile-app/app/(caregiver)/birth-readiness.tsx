import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  ChevronLeft,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ShieldCheck,
  FileText,
  Heart,
  Sparkles,
  Clock,
  Briefcase,
  Navigation,
  Baby,
  Smile,
} from 'lucide-react-native';
import { usePregnancyStore } from '../../store/pregnancy.store';
import { useBirthPrepStore, ChecklistItem } from '../../store/birth-prep.store';

type TabType = 'emergency' | 'bag' | 'plan';

export default function CaregiverBirthReadinessScreen() {
  const router = useRouter();
  const profile = usePregnancyStore((state) => state.profile);
  const currentWeek = usePregnancyStore((state) => state.currentWeek);
  const daysRemaining = usePregnancyStore((state) => state.daysRemaining);

  const checklist = useBirthPrepStore((state) => state.checklist);
  const birthPlan = useBirthPrepStore((state) => state.birthPlan);
  const toggleItemPacked = useBirthPrepStore((state) => state.toggleItemPacked);
  const loadBirthPrepData = useBirthPrepStore((state) => state.loadBirthPrepData);
  const getStats = useBirthPrepStore((state) => state.getStats);

  const [activeTab, setActiveTab] = useState<TabType>('emergency');
  const [bagFilter, setBagFilter] = useState<'all' | 'partner' | 'documents' | 'mother' | 'baby'>('partner');

  useEffect(() => {
    loadBirthPrepData();
  }, []);

  const stats = getStats();
  const partnerItems = checklist.filter((i) => i.category === 'partner');
  const partnerPacked = partnerItems.filter((i) => i.isPacked).length;

  const docItems = checklist.filter((i) => i.category === 'documents');
  const docsPacked = docItems.filter((i) => i.isPacked).length;

  const hospitalName = profile?.hospitalName || 'Not specified by mother yet';
  const doctorName = profile?.doctorName || 'Not specified by mother yet';
  const doctorPhone = profile?.doctorPhone || '';
  const emergencyHotline = '+91 98765 43219';

  const handleCall = (num: string, label: string) => {
    Alert.alert(`Call ${label}?`, `Connecting to ${num}...`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', style: 'destructive', onPress: () => Linking.openURL(`tel:${num}`) },
    ]);
  };

  const handleOpenMaps = () => {
    const query = encodeURIComponent(hospitalName);
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://maps.google.com/?q=${query}`,
    });
    Linking.openURL(mapUrl);
  };

  const filteredChecklist = checklist.filter((item) => {
    if (bagFilter === 'all') return true;
    return item.category === bagFilter;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Labor & Birth Readiness</Text>
          <Text style={styles.headerSubtitle}>
            Partner emergency navigator, hospital bag & birth plan
          </Text>
        </View>
      </View>

      {/* Main Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'emergency' && styles.tabBtnActive]}
          onPress={() => setActiveTab('emergency')}
          activeOpacity={0.8}
        >
          <AlertTriangle
            size={14}
            color={activeTab === 'emergency' ? '#DC2626' : '#64748B'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'emergency' && styles.tabBtnTextActive,
            ]}
          >
            Emergency & Route
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'bag' && styles.tabBtnActive]}
          onPress={() => setActiveTab('bag')}
          activeOpacity={0.8}
        >
          <Briefcase
            size={14}
            color={activeTab === 'bag' ? '#DC2626' : '#64748B'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'bag' && styles.tabBtnTextActive,
            ]}
          >
            Hospital Bag ({stats.percent}%)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'plan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('plan')}
          activeOpacity={0.8}
        >
          <Heart
            size={14}
            color={activeTab === 'plan' ? '#DC2626' : '#64748B'}
          />
          <Text
            style={[
              styles.tabBtnText,
              activeTab === 'plan' && styles.tabBtnTextActive,
            ]}
          >
            Birth Plan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================================= */}
        {/* TAB 1: EMERGENCY & ROUTE */}
        {/* ========================================================= */}
        {activeTab === 'emergency' && (
          <View>
            {/* Hospital Navigation Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <MapPin size={20} color="#DC2626" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle}>Designated Maternity Hospital</Text>
                  <Text style={styles.hospitalNameHighlight}>{hospitalName}</Text>
                </View>
              </View>

              <View style={styles.callButtonsRow}>
                <TouchableOpacity
                  style={styles.hospitalActionBtn}
                  onPress={() => handleCall(doctorPhone, `OB-GYN (${doctorName})`)}
                  activeOpacity={0.8}
                >
                  <Phone size={15} color="#FFFFFF" />
                  <Text style={styles.hospitalActionBtnText}>Call Doctor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.hospitalActionBtn, { backgroundColor: '#DC2626' }]}
                  onPress={() => handleCall(emergencyHotline, 'Hospital Casualty Triage')}
                  activeOpacity={0.8}
                >
                  <Phone size={15} color="#FFFFFF" />
                  <Text style={styles.hospitalActionBtnText}>24/7 Triage</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.hospitalActionBtn, { backgroundColor: '#0284C7' }]}
                  onPress={handleOpenMaps}
                  activeOpacity={0.8}
                >
                  <Navigation size={15} color="#FFFFFF" />
                  <Text style={styles.hospitalActionBtnText}>Map Route</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5-1-1 Rule Clinical Guide for Caregiver */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Clock size={20} color="#D97706" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle}>When to Leave for Hospital: 5-1-1 Rule</Text>
                  <Text style={styles.cardSubtitle}>
                    ACOG clinical guideline for labor timing
                  </Text>
                </View>
              </View>

              <View style={styles.ruleStepsList}>
                <View style={styles.ruleStep}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>5</Text>
                  </View>
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepHeading}>5 Minutes Apart</Text>
                    <Text style={styles.stepBody}>
                      Contractions occur consistently every 5 minutes from start of one to start of next.
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleStep}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>1</Text>
                  </View>
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepHeading}>1 Minute Long</Text>
                    <Text style={styles.stepBody}>
                      Each contraction lasts a full 60 seconds of intense abdominal tightening.
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleStep}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>1</Text>
                  </View>
                  <View style={styles.stepTextCol}>
                    <Text style={styles.stepHeading}>For 1 Full Hour</Text>
                    <Text style={styles.stepBody}>
                      This contraction pattern continues uninterrupted for at least 60 minutes.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Critical Red-Flag Departure Triggers */}
            <View style={[styles.card, { borderColor: '#FECACA', backgroundColor: '#FFF5F5' }]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <AlertTriangle size={20} color="#DC2626" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={[styles.cardTitle, { color: '#DC2626' }]}>
                    Immediate Departure Red Flags
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Do not wait for 5-1-1; head to triage immediately if:
                  </Text>
                </View>
              </View>

              <View style={styles.redFlagsList}>
                <Text style={styles.redFlagItem}>• Clear or greenish amniotic fluid leakage (Water breaks)</Text>
                <Text style={styles.redFlagItem}>• Bright red vaginal bleeding (more than light spotting)</Text>
                <Text style={styles.redFlagItem}>• Sudden sharp, unrelenting abdominal or chest pain</Text>
                <Text style={styles.redFlagItem}>• Noticeable absence or dramatic reduction in baby movements</Text>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 2: HOSPITAL BAG CO-CHECKLIST */}
        {/* ========================================================= */}
        {activeTab === 'bag' && (
          <View>
            {/* Bag Progress Strip */}
            <View style={styles.bagStatsCard}>
              <View style={styles.bagStatsTop}>
                <View>
                  <Text style={styles.bagStatsTitle}>Hospital Bag Readiness</Text>
                  <Text style={styles.bagStatsSub}>
                    {stats.packed} of {stats.total} total items packed across all bags
                  </Text>
                </View>
                <View style={styles.percentPill}>
                  <Text style={styles.percentPillText}>{stats.percent}% Ready</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${stats.percent}%` }]} />
              </View>
            </View>

            {/* Bag Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterPillsRow}
            >
              {[
                { id: 'partner', label: `Partner Items (${partnerPacked}/${partnerItems.length})` },
                { id: 'documents', label: `Delivery Documents (${docsPacked}/${docItems.length})` },
                { id: 'mother', label: "Mother's Bag" },
                { id: 'baby', label: "Baby's Bag" },
                { id: 'all', label: 'All Items' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterPill, bagFilter === f.id && styles.filterPillActive]}
                  onPress={() => setBagFilter(f.id as any)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.filterPillText, bagFilter === f.id && styles.filterPillTextActive]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Checklist Items */}
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>
                {bagFilter === 'partner'
                  ? 'Items You (Partner) Need to Pack'
                  : bagFilter === 'documents'
                  ? 'Legal & Hospital Admission Documents'
                  : 'Checklist Items (Tap to Check Off)'}
              </Text>

              <View style={styles.checklistRows}>
                {filteredChecklist.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.checkItem}
                    onPress={() => toggleItemPacked(item.id)}
                    activeOpacity={0.7}
                  >
                    {item.isPacked ? (
                      <CheckCircle2 size={20} color="#059669" strokeWidth={2.5} />
                    ) : (
                      <Circle size={20} color="#CBD5E1" strokeWidth={2} />
                    )}

                    <View style={styles.checkItemTextCol}>
                      <Text
                        style={[
                          styles.checkItemName,
                          item.isPacked && styles.checkItemNameDone,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {item.isEssential && (
                        <View style={styles.essentialBadge}>
                          <Text style={styles.essentialText}>CRITICAL ESSENTIAL</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 3: BIRTH PLAN ADVOCACY */}
        {/* ========================================================= */}
        {activeTab === 'plan' && (
          <View>
            <View style={styles.infoBanner}>
              <Heart size={18} color="#E11D48" />
              <Text style={styles.infoBannerText}>
                As her labor companion, your role is to advocate for her wishes and keep her calm. Here is the birth plan she configured:
              </Text>
            </View>

            {/* Labor Companion */}
            <View style={styles.card}>
              <View style={styles.planHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E6' }]}>
                  <Smile size={18} color="#E11D48" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle}>Labor Room Companion</Text>
                  <Text style={styles.planValueHighlight}>{birthPlan.laborCompanion}</Text>
                </View>
              </View>
            </View>

            {/* Pain Management */}
            <View style={styles.card}>
              <View style={styles.planHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Sparkles size={18} color="#0284C7" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle}>Pain Management Strategy</Text>
                  <Text style={styles.planValueHighlight}>{birthPlan.painManagement}</Text>
                </View>
              </View>
            </View>

            {/* Delivery & Newborn Wishes */}
            <View style={styles.card}>
              <View style={styles.planHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Baby size={18} color="#15803D" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle}>Delivery & Cord Clamping</Text>
                  <Text style={styles.cardSubtitle}>Key wishes immediately post-delivery</Text>
                </View>
              </View>

              <View style={styles.bulletList}>
                {birthPlan.deliveryPreferences.map((pref, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>✓</Text>
                    <Text style={styles.bulletText}>{pref}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Golden Hour Feeding */}
            <View style={styles.card}>
              <View style={styles.planHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <ShieldCheck size={18} color="#7C3AED" />
                </View>
                <View style={styles.cardTitleCol}>
                  <Text style={styles.cardTitle}>First Golden Hour Feeding</Text>
                  <Text style={styles.planValueHighlight}>{birthPlan.feedingChoice}</Text>
                </View>
              </View>
            </View>

            {/* Special Wishes */}
            {birthPlan.specialWishes ? (
              <View style={[styles.card, { backgroundColor: '#F8FAFC' }]}>
                <Text style={styles.cardTitle}>Special Requests for Medical Staff</Text>
                <Text style={styles.specialWishesText}>"{birthPlan.specialWishes}"</Text>
              </View>
            ) : null}
          </View>
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  tabBtnActive: {
    backgroundColor: '#FEE2E2',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#DC2626',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  hospitalNameHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 2,
  },
  callButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  hospitalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 10,
  },
  hospitalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  ruleStepsList: {
    gap: 10,
  },
  ruleStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepTextCol: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
  },
  stepBody: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  redFlagsList: {
    gap: 6,
    paddingTop: 4,
  },
  redFlagItem: {
    fontSize: 11.5,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 16,
  },
  bagStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  bagStatsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bagStatsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  bagStatsSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  percentPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  percentPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#059669',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
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
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  checklistRows: {
    gap: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkItemTextCol: {
    flex: 1,
  },
  checkItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 16,
  },
  checkItemNameDone: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  essentialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
  },
  essentialText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.4,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    marginBottom: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 11.5,
    color: '#9D174D',
    lineHeight: 16,
    fontWeight: '500',
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planValueHighlight: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  bulletList: {
    gap: 6,
    paddingTop: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '800',
  },
  bulletText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  specialWishesText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
});
