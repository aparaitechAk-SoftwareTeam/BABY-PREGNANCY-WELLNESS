import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Stores
import { usePregnancyStore } from '../../../store/pregnancy.store';

// Modular UI Components from components/pregnancy
import {
  WeekSelectorCarousel,
  BabyGrowthHero,
  FetalMilestonesCard,
  MomBodyChangesCard,
  WeeklyChecklistCard,
  ContentGovernanceNotice,
  MilestoneItem,
  BodyChangeItem,
  ChecklistItem,
} from '../../../components/pregnancy';

// 40-Week Comprehensive Knowledge Base
interface WeekData {
  fruit: string;
  emoji: string;
  length: string;
  weight: string;
  headline: string;
  milestones: MilestoneItem[];
  changes: BodyChangeItem[];
  checklist: ChecklistItem[];
}

const WEEK_DATABASE: Record<number, WeekData> = {
  8: {
    fruit: 'Raspberry',
    emoji: '🍓',
    length: '1.6 cm',
    weight: '1 g',
    headline: 'Tiny fingers and toes are forming, and the embryonic heart is beating vigorously.',
    milestones: [
      { id: 'm1', icon: '💓', title: 'Heartbeat at 150 bpm', description: 'Your baby’s heart is beating nearly twice as fast as yours, pumping blood through tiny vessels.' },
      { id: 'm2', icon: '🖐️', title: 'Webbed Digits', description: 'Arms and legs are lengthening, and webbed fingers and toes are clearly visible.' },
      { id: 'm3', icon: '🧠', title: 'Brain Waves Active', description: 'Brain pathways and neural connections are rapidly establishing.' },
    ],
    changes: [
      { id: 'c1', symptom: 'Morning Sickness & Nausea', tip: 'Keep small dry crackers by your bedside and sip ginger tea or lemon water.' },
      { id: 'c2', symptom: 'Heightened Sense of Smell', tip: 'Avoid strong perfumes and cooking odors; keep living spaces well-ventilated.' },
    ],
    checklist: [
      { id: 'k1', text: 'Schedule your First Trimester dating ultrasound', category: 'Clinical' },
      { id: 'k2', text: 'Confirm daily prenatal vitamin with 400mcg+ folic acid', category: 'Nutrition' },
      { id: 'k3', text: 'Compile list of questions for your first OB-GYN visit', category: 'Questions' },
    ],
  },
  12: {
    fruit: 'Lime',
    emoji: '🍋',
    length: '5.4 cm',
    weight: '14 g',
    headline: 'All critical body structures and reflex muscles are now completely formed.',
    milestones: [
      { id: 'm1', icon: '👣', title: 'Reflex Practice', description: 'Baby can curl toes, clench fists, and make sucking mouth movements.' },
      { id: 'm2', icon: '🦴', title: 'Bone Hardening', description: 'Cartilage is beginning to turn into hard bone in the limbs and skull.' },
      { id: 'm3', icon: '💅', title: 'Fingernail Beds', description: 'Tiny fingernails and toenails are sprouting at the tips of digits.' },
    ],
    changes: [
      { id: 'c1', symptom: 'Easing Nausea & Better Energy', tip: 'As the placenta takes over hormone production, morning sickness often begins to subside.' },
      { id: 'c2', symptom: 'Slight Belly Rounding', tip: 'Your uterus is expanding above the pubic bone; loose, comfortable clothing helps.' },
    ],
    checklist: [
      { id: 'k1', text: 'Complete Nuchal Translucency (NT) scan if recommended', category: 'Clinical' },
      { id: 'k2', text: 'Begin gentle daily pelvis and lower-back stretches', category: 'Wellness' },
      { id: 'k3', text: 'Consider sharing news with close family circle', category: 'Sharing' },
    ],
  },
  20: {
    fruit: 'Banana',
    emoji: '🍌',
    length: '25.6 cm',
    weight: '300 g',
    headline: 'Halfway milestone! You may now feel the first sweet flutters of fetal movement.',
    milestones: [
      { id: 'm1', icon: '🦋', title: 'Quickening Movements', description: 'Baby is doing somersaults, stretches, and kicks that mom can distinctly feel.' },
      { id: 'm2', icon: '👂', title: 'Hearing Developing', description: 'Baby can hear mom’s voice, heartbeat, and muted ambient household sounds.' },
      { id: 'm3', icon: '🛡️', title: 'Vernix Coating', description: 'A protective creamy layer shields baby’s delicate skin from amniotic fluid.' },
    ],
    changes: [
      { id: 'c1', symptom: 'Round Ligament Stretching', tip: 'Sharp twinges on side of belly are common; avoid sudden twisting movements.' },
      { id: 'c2', symptom: 'Increased Appetite & Cravings', tip: 'Focus on nutrient-dense meals rich in iron, healthy fats, and calcium.' },
    ],
    checklist: [
      { id: 'k1', text: 'Schedule Level-II Detailed Anatomy Ultrasound Scan', category: 'Clinical' },
      { id: 'k2', text: 'Start sleeping predominantly on your left side with pillow support', category: 'Sleep' },
      { id: 'k3', text: 'Sync partner into the app to see weekly milestone updates', category: 'Partner' },
    ],
  },
  28: {
    fruit: 'Eggplant',
    emoji: '🍆',
    length: '37 cm',
    weight: '1 kg',
    headline: 'Welcome to Trimester 3! Baby’s eyes can blink and sleep cycles are rhythmic.',
    milestones: [
      { id: 'm1', icon: '👁️', title: 'Eyes Can Open & Blink', description: 'Baby can open eyes and distinguish between light and darkness outside the womb.' },
      { id: 'm2', icon: '🌬️', title: 'Breathing Practice', description: 'Lungs are developing surfactant and baby is practicing regular breathing rhythms.' },
      { id: 'm3', icon: '🧠', title: 'Rapid Brain Development', description: 'Brain surface is developing characteristic folds and expanding exponentially.' },
    ],
    changes: [
      { id: 'c1', symptom: 'Mild Shortness of Breath', tip: 'Uterus presses against diaphragm; maintain good posture and take restful breaks.' },
      { id: 'c2', symptom: 'Braxton Hicks Contractions', tip: 'Painless warm-up tightenings; hydrate well and change physical positions.' },
    ],
    checklist: [
      { id: 'k1', text: 'Begin daily Kick Counting sessions (10 kicks in 2 hours)', category: 'Tracking' },
      { id: 'k2', text: 'Complete Glucose Screening & Rh-antibody blood check', category: 'Clinical' },
      { id: 'k3', text: 'Register for hospital tour and childbirth education classes', category: 'Planning' },
    ],
  },
  36: {
    fruit: 'Papaya',
    emoji: '🍈',
    length: '47 cm',
    weight: '2.6 kg',
    headline: 'Baby is plumping up with soft baby fat and dropping lower into your pelvis.',
    milestones: [
      { id: 'm1', icon: '🫁', title: 'Lungs Nearly Mature', description: 'Respiratory system is prepared to breathe room air immediately after birth.' },
      { id: 'm2', icon: '⬇️', title: 'Lightening / Engagement', description: 'Baby is settling head-down into pelvis, relieving diaphragm pressure.' },
      { id: 'm3', icon: '💪', title: 'Strong Coordinated Grasp', description: 'Baby can grasp firmly with fingers and responds enthusiastically to touch.' },
    ],
    changes: [
      { id: 'c1', symptom: 'Increased Pelvic Pressure', tip: 'Warm baths and gentle pelvic rocking on a yoga ball provide immense relief.' },
      { id: 'c2', symptom: 'Frequent Urination', tip: 'Baby’s head rests on bladder; maintain hydration during day, taper before bed.' },
    ],
    checklist: [
      { id: 'k1', text: 'Pack hospital go-bag for mom, partner, and baby', category: 'Hospital' },
      { id: 'k2', text: 'Group B Strep (GBS) screening swab at prenatal checkup', category: 'Clinical' },
      { id: 'k3', text: 'Install and inspect infant car seat in vehicle', category: 'Safety' },
    ],
  },
};

function getWeekInfo(week: number): WeekData {
  const milestoneWeeks = [8, 12, 20, 28, 36];
  let chosen = milestoneWeeks[0];
  for (const w of milestoneWeeks) {
    if (week >= w) chosen = w;
  }

  const base = WEEK_DATABASE[chosen] || WEEK_DATABASE[20];
  return {
    ...base,
    headline: `In Week ${week}, ${base.headline.toLowerCase()}`,
  };
}

export default function WeekDetailScreen() {
  const router = useRouter();
  const { week: paramWeek } = useLocalSearchParams<{ week: string }>();

  // Global store actual current week
  const currentActualWeek = usePregnancyStore((state) => state.currentWeek);

  // Selected week being browsed
  const initialWeekNum = parseInt(paramWeek || '20', 10) || currentActualWeek || 20;
  const [selectedWeek, setSelectedWeek] = useState(initialWeekNum);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const weekData = useMemo(() => getWeekInfo(selectedWeek), [selectedWeek]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar with Back Button */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          <View style={styles.navBadge}>
            <Text style={styles.navBadgeText}>Week-by-Week Guide</Text>
          </View>

          <View style={{ width: 38 }} />
        </View>

        {/* 1. Horizontal Week Navigator Carousel */}
        <WeekSelectorCarousel
          selectedWeek={selectedWeek}
          currentActualWeek={currentActualWeek}
          onSelectWeek={setSelectedWeek}
        />

        {/* 2. Baby Growth Hero Card (Fruit size, metrics, bookmark) */}
        <BabyGrowthHero
          week={selectedWeek}
          fruit={weekData.fruit}
          emoji={weekData.emoji}
          length={weekData.length}
          weight={weekData.weight}
          headline={weekData.headline}
          isBookmarked={isBookmarked}
          onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
        />

        {/* 3. Fetal Milestones Card (Organ & Senses) */}
        <FetalMilestonesCard milestones={weekData.milestones} />

        {/* 4. Mom's Body Changes & Comfort Tips */}
        <MomBodyChangesCard changes={weekData.changes} />

        {/* 5. Weekly Action Checklist */}
        <WeeklyChecklistCard initialItems={weekData.checklist} />

        {/* 6. Content Governance & Clinical Review Notice (PRD Section 7) */}
        <ContentGovernanceNotice />
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
    paddingTop: 8,
    paddingBottom: 32,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  navBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
});
