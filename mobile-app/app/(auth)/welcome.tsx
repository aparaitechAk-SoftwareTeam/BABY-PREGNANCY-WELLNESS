import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Activity, Leaf, Users, Sparkles, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 44;
const CARD_GAP = 12;
const AUTO_PLAY_INTERVAL = 3600; // 3.6 seconds per slide

interface SlideItem {
  id: string;
  category: string;
  icon: React.ElementType;
  accentColor: string;
  badgeBg: string;
  tag: string;
  title: string;
  subtitle: string;
  features: string[];
  statBadge: string;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    category: 'Milestones',
    icon: Heart,
    accentColor: '#E11D48',
    badgeBg: '#FEE2E6',
    tag: 'Trimester 1, 2 & 3',
    title: 'Week-by-Week Baby Growth',
    subtitle: 'Watch your little one develop with pediatric clinical guidance and developmental milestones.',
    features: [
      'Visual size comparisons for each week',
      'Organ development milestones & scan tips',
      'Weekly maternal bodily change timeline',
    ],
    statBadge: '40 Weeks Roadmap',
  },
  {
    id: '2',
    category: 'Clinical Vitals',
    icon: Activity,
    accentColor: '#0284C7',
    badgeBg: '#E0F2FE',
    tag: 'Real-Time Logging',
    title: 'Smart Vitals & Kick Counter',
    subtitle: 'Track fetal kicks, contractions, blood pressure, and maternal wellness with ease.',
    features: [
      'One-tap fetal kick counter',
      'Labor contraction timer with alerts',
      'Clinician-ready PDF summary export',
    ],
    statBadge: 'Real-Time Sync',
  },
  {
    id: '3',
    category: 'Nutrition & Yoga',
    icon: Leaf,
    accentColor: '#059669',
    badgeBg: '#D1FAE5',
    tag: 'Dietitian Certified',
    title: 'Safe Nutrition & Prenatal Yoga',
    subtitle: 'Nourish your body with trimester-custom recipes, hydration tracking, and safe stretches.',
    features: [
      'Folate, iron & calcium rich meal guides',
      'Smart hydration logs with reminders',
      'OB-GYN approved prenatal stretches',
    ],
    statBadge: '100% Doctor Vetted',
  },
  {
    id: '4',
    category: 'Family Sync',
    icon: Users,
    accentColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    tag: 'Shared Moments',
    title: 'Partner & Family Circle',
    subtitle: 'Keep your partner and family in the loop with synchronized milestone notifications.',
    features: [
      'Dedicated partner coaching & tips',
      'Ultrasound memory vault & baby name pool',
      'Instant emergency broadcast button',
    ],
    statBadge: 'End-to-End Encrypted',
  },
  {
    id: '5',
    category: 'AI Care',
    icon: Sparkles,
    accentColor: '#D97706',
    badgeBg: '#FEF3C7',
    tag: '24/7 Companion',
    title: 'Instant OB-GYN AI Guidance',
    subtitle: 'Have questions about symptoms or concerns? Get evidence-backed answers instantly.',
    features: [
      'Evidence-based symptom reassurance',
      'Triage checks for red-flag symptoms',
      'Custom question checklist for doctor visits',
    ],
    statBadge: 'Always Available',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false); // Disabled by default to prevent freezing
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const optionsScrollRef = useRef<ScrollView>(null);

  // Auto-play sliding interval
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDES.length;
        // Use setTimeout to prevent blocking animation frame
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: next,
            animated: true,
          });
        }, 0);
        return next;
      });
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  // Keep option pills in view when slide changes
  useEffect(() => {
    // Scroll option pills slightly to ensure active pill is visible
    optionsScrollRef.current?.scrollTo({
      x: Math.max(0, activeSlide * 110 - 40),
      animated: true,
    });
  }, [activeSlide]);

  const handleSelectOption = (index: number) => {
    setActiveSlide(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const handlePrevSlide = () => {
    const prev = activeSlide === 0 ? SLIDES.length - 1 : activeSlide - 1;
    handleSelectOption(prev);
  };

  const handleNextSlide = () => {
    const next = (activeSlide + 1) % SLIDES.length;
    handleSelectOption(next);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const computedIndex = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    if (computedIndex >= 0 && computedIndex < SLIDES.length) {
      setActiveSlide(computedIndex);
    }
  };

  const currentSlide = SLIDES[activeSlide] || SLIDES[0];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header / Brand Identity */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.certBadge}>
              <View style={styles.certDot} />
              <Text style={styles.certText}>Certified Maternal Care</Text>
            </View>

            <View style={styles.securePill}>
              <Text style={styles.securePillText}>HIPAA Safe</Text>
            </View>
          </View>

          <View style={styles.logoRow}>
            <View style={styles.logoIconCircle}>
              <Heart size={26} color="#E11D48" strokeWidth={2} />
            </View>
            <View style={styles.logoTextCol}>
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitle}>AparaiTech</Text>
                <View style={styles.wellnessTag}>
                  <Text style={styles.wellnessTagText}>PLUS</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>Maternal & Pregnancy Wellness</Text>
            </View>
          </View>
        </View>

        {/* Hero Pitch Headline */}
        <View style={styles.heroSection}>
          <Text style={styles.heroHeadline}>
            Every Heartbeat,{'\n'}
            <Text style={styles.heroHighlightText}>Every Precious Step.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Your compassionate clinical companion for week-by-week guidance, vitals monitoring, and shared joy.
          </Text>
        </View>

        {/* Interactive Feature Slider Section */}
        <View style={styles.carouselSection}>
          {/* Section Header with Auto-play status & Controls */}
          <View style={styles.carouselHeaderRow}>
            <View>
              <Text style={styles.sectionSubtitle}>EXPLORE KEY HIGHLIGHTS</Text>
              <Text style={styles.sectionTitle}>Interactive Features</Text>
            </View>

            {/* Auto-Slide Toggle Control & Arrows */}
            <View style={styles.sliderControls}>
              <TouchableOpacity
                onPress={() => setIsAutoPlay((prev) => !prev)}
                activeOpacity={0.7}
                style={[
                  styles.autoPlayButton,
                  isAutoPlay ? styles.autoPlayActive : styles.autoPlayPaused,
                ]}
              >
                {isAutoPlay ? (
                  <Pause size={12} color="#E11D48" strokeWidth={2.5} style={{ marginRight: 4 }} />
                ) : (
                  <Play size={12} color="#E11D48" strokeWidth={2.5} style={{ marginRight: 4 }} />
                )}
                <Text style={styles.autoPlayLabel}>
                  {isAutoPlay ? 'Auto' : 'Play'}
                </Text>
              </TouchableOpacity>

              <View style={styles.arrowGroup}>
                <TouchableOpacity
                  onPress={handlePrevSlide}
                  style={styles.arrowBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Previous slide"
                >
                  <ChevronLeft size={16} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextSlide}
                  style={styles.arrowBtn}
                  activeOpacity={0.7}
                  accessibilityLabel="Next slide"
                >
                  <ChevronRight size={16} color="#374151" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Slide Option Pills (Tabs for immediate selection) */}
          <ScrollView
            ref={optionsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScrollContainer}
          >
            {SLIDES.map((slide, index) => {
              const isSelected = index === activeSlide;
              const IconComponent = slide.icon;
              return (
                <TouchableOpacity
                  key={slide.id}
                  onPress={() => handleSelectOption(index)}
                  activeOpacity={0.85}
                  style={[
                    styles.optionPill,
                    isSelected && {
                      backgroundColor: slide.badgeBg,
                      borderColor: slide.accentColor,
                    },
                  ]}
                >
                  <IconComponent size={16} color={isSelected ? slide.accentColor : '#9CA3AF'} strokeWidth={2.5} />
                  <Text
                    style={[
                      styles.optionPillText,
                      isSelected && {
                        color: slide.accentColor,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {slide.category}
                  </Text>
                  {isSelected && (
                    <View
                      style={[
                        styles.optionActiveIndicator,
                        { backgroundColor: slide.accentColor },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sliding Cards FlatList */}
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
            onMomentumScrollEnd={onMomentumScrollEnd}
            getItemLayout={(_, index) => ({
              length: CARD_WIDTH + CARD_GAP,
              offset: (CARD_WIDTH + CARD_GAP) * index,
              index,
            })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            updateCellsBatchingPeriod={50}
            initialNumToRender={2}
            renderItem={({ item, index }) => {
              const isCurrent = index === activeSlide;
              const IconComponent = item.icon;
              return (
                <View
                  style={[
                    styles.slideCard,
                    {
                      width: CARD_WIDTH,
                      marginRight: index === SLIDES.length - 1 ? 0 : CARD_GAP,
                      borderColor: isCurrent ? item.accentColor : '#F3F4F6',
                    },
                  ]}
                >
                  {/* Card Top Pill & Icon */}
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.cardIconBox,
                        { backgroundColor: item.badgeBg },
                      ]}
                    >
                      <IconComponent size={28} color={item.accentColor} strokeWidth={2} />
                    </View>

                    <View style={styles.cardMetaRight}>
                      <View
                        style={[
                          styles.cardTagPill,
                          { backgroundColor: item.badgeBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.cardTagText,
                            { color: item.accentColor },
                          ]}
                        >
                          {item.tag}
                        </Text>
                      </View>
                      <View style={styles.statPill}>
                        <Text style={styles.statPillText}>{item.statBadge}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Title & Subtitle */}
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

                  {/* Bullet Highlights List */}
                  <View style={styles.featureList}>
                    {item.features.map((feature, fIndex) => (
                      <View key={fIndex} style={styles.featureRow}>
                        <View
                          style={[
                            styles.checkCircle,
                            { backgroundColor: item.badgeBg },
                          ]}
                        >
                          <Text
                            style={[
                              styles.checkMarkText,
                              { color: item.accentColor },
                            ]}
                          >
                            ✓
                          </Text>
                        </View>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Card Bottom Micro-Indicator */}
                  <View style={styles.cardFooter}>
                    <View style={styles.previewFeatureBadge}>
                      <Text
                        style={[
                          styles.previewFeatureText,
                          { color: item.accentColor },
                        ]}
                      >
                        ● Live Feature Active
                      </Text>
                    </View>
                    <Text style={styles.slideIndexText}>
                      {index + 1} of {SLIDES.length}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Dots Indicator & Carousel Footnote */}
          <View style={styles.carouselFooterRow}>
            <View style={styles.dotsContainer}>
              {SLIDES.map((slide, i) => {
                const isActive = i === activeSlide;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSelectOption(i)}
                    activeOpacity={0.8}
                    style={[
                      styles.dot,
                      isActive
                        ? [
                            styles.dotActive,
                            { backgroundColor: slide.accentColor },
                          ]
                        : styles.dotInactive,
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setIsAutoPlay(!isAutoPlay)}
              style={styles.autoStatusHint}
              activeOpacity={0.7}
            >
              <Text style={styles.autoStatusHintText}>
                {isAutoPlay ? 'Auto-advancing every 3s' : 'Tap to auto-play'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trust & Clinical Validation Banner */}
        <View style={styles.trustBanner}>
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>40+</Text>
            <Text style={styles.trustLabel}>Weeks Tracked</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>100%</Text>
            <Text style={styles.trustLabel}>Private & Safe</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>24/7</Text>
            <Text style={styles.trustLabel}>AI Clinical Care</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <Text style={styles.trustNumber}>4.9★</Text>
            <Text style={styles.trustLabel}>Mom Satisfaction</Text>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={() => router.push('/(auth)/signup')}
          >
            <View style={styles.primaryButtonContent}>
              <Text style={styles.primaryButtonText}>Begin Your Journey</Text>
              <View style={styles.primaryButtonArrowWrap}>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.75}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account?{' '}
              <Text style={styles.secondaryButtonHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Regulatory & Security Compliance Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerDisclaimer}>
            End-to-End Encrypted Maternal Health Records
          </Text>
          <Text style={styles.footerSubText}>
            HIPAA & DPDP Compliant • Built in consultation with certified OB-GYNs
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
    paddingTop: 10,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  certDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E11D48',
    marginRight: 6,
  },
  certText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  securePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securePillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoTextCol: {
    flex: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  wellnessTag: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  wellnessTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  heroSection: {
    marginTop: 4,
    marginBottom: 18,
  },
  heroHeadline: {
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.6,
  },
  heroHighlightText: {
    color: '#E11D48',
  },
  heroDescription: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#4B5563',
    marginTop: 8,
  },
  carouselSection: {
    marginBottom: 22,
  },
  carouselHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#9CA3AF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 2,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  autoPlayActive: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  autoPlayPaused: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  autoPlayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE123C',
  },
  arrowGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsScrollContainer: {
    paddingVertical: 4,
    paddingBottom: 10,
    gap: 8,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  optionActiveIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 6,
  },
  flatListContent: {
    paddingVertical: 4,
  },
  slideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMetaRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardTagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  statPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#4B5563',
    marginBottom: 14,
  },
  featureList: {
    gap: 8,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },
  checkMarkText: {
    fontSize: 11,
    fontWeight: '900',
  },
  featureText: {
    fontSize: 12.5,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  previewFeatureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewFeatureText: {
    fontSize: 11,
    fontWeight: '700',
  },
  slideIndexText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  carouselFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 7,
    backgroundColor: '#E5E7EB',
  },
  autoStatusHint: {
    paddingVertical: 2,
  },
  autoStatusHintText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustNumber: {
    fontSize: 17,
    fontWeight: '900',
    color: '#E11D48',
  },
  trustLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 3,
    textAlign: 'center',
  },
  trustDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#F3F4F6',
  },
  actionSection: {
    gap: 12,
    marginBottom: 22,
  },
  primaryButton: {
    backgroundColor: '#E11D48',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginRight: 10,
  },
  primaryButtonArrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonArrow: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 14.5,
    fontWeight: '500',
  },
  secondaryButtonHighlight: {
    color: '#E11D48',
    fontWeight: '800',
  },
  footerSection: {
    alignItems: 'center',
    paddingTop: 6,
  },
  footerDisclaimer: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 3,
  },
  footerSubText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
