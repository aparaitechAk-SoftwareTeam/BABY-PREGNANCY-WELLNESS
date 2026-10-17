import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, BarChart3, Headphones } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* 1. Header Title & Subtitle */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Your Pregnancy{'\n'}Journey with You</Text>
          <Text style={styles.subtitle}>
            Track • Learn • Stay Healthy{'\n'}With Expert Support
          </Text>
        </View>

        {/* 2. Center Hero Illustration */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/pregnant_mother_hero.jpg')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* 3. Three Key Feature Pillars */}
        <View style={styles.featuresRow}>
          {/* Feature 1 */}
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={20} color="#E11D48" strokeWidth={2.4} />
            </View>
            <Text style={styles.featureLabel}>Trusted{'\n'}Information</Text>
          </View>

          {/* Feature 2 */}
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <BarChart3 size={20} color="#E11D48" strokeWidth={2.4} />
            </View>
            <Text style={styles.featureLabel}>Personalized{'\n'}Tracking</Text>
          </View>

          {/* Feature 3 */}
          <View style={styles.featureItem}>
            <View style={styles.iconCircle}>
              <Headphones size={20} color="#E11D48" strokeWidth={2.4} />
            </View>
            <Text style={styles.featureLabel}>Support{'\n'}Always</Text>
          </View>
        </View>

        {/* 4. Pagination Dots Indicator */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotInactive]} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={[styles.dot, styles.dotInactive]} />
        </View>

        {/* 5. Bottom Action: Get Started Button & Sign In Link */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            activeOpacity={0.88}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInLink}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInLinkText}>
              Already have an account? <Text style={styles.signInLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === 'ios' ? 12 : 24,
    paddingBottom: Platform.OS === 'ios' ? 24 : 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  title: {
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.82,
    height: SCREEN_HEIGHT * 0.38,
    maxHeight: 330,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  featureLabel: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginVertical: 8,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: '#E11D48',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E2E8F0',
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  getStartedBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#E11D48',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  signInLink: {
    paddingVertical: 6,
  },
  signInLinkText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  signInLinkBold: {
    color: '#E11D48',
    fontWeight: '700',
  },
});
