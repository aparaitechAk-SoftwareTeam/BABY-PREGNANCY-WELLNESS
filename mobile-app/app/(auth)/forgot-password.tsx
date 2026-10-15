import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));
      setSubmitted(true);
    } catch {
      setErrorMessage('Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative ambient background glows */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Navigation */}
          <View style={styles.navBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Back"
            >
              <Text style={styles.backButtonArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.appBadge}>
              <Text style={styles.appBadgeEmoji}>🌸</Text>
              <Text style={styles.appBadgeText}>AparaiTech Wellness</Text>
            </View>

            <View style={{ width: 38 }} />
          </View>

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.screenHeading}>Reset Your Password</Text>
            <Text style={styles.screenSubtitle}>
              Enter your registered email address and we will send you secure instructions to regain access.
            </Text>
          </View>

          {/* Card */}
          <View style={styles.cardContainer}>
            {submitted ? (
              <View style={styles.successState}>
                <View style={styles.successCircle}>
                  <Text style={styles.successEmoji}>📬</Text>
                </View>
                <Text style={styles.successTitle}>Check Your Inbox</Text>
                <Text style={styles.successDescription}>
                  We've sent a password reset link to{' '}
                  <Text style={styles.successEmail}>{email}</Text>. Please follow the instructions to reset your password.
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.primaryButton}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryButtonText}>Return to Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSubmitted(false)}
                  style={styles.resendBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendText}>Didn't receive email? Try again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {/* Error Banner */}
                {!!errorMessage && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Registered Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputPrefixIcon}>✉️</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="maya@example.com"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isSubmitting}
                  style={[
                    styles.primaryButton,
                    isSubmitting && styles.buttonDisabled,
                  ]}
                  activeOpacity={0.88}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Send Password Reset Link →
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  style={styles.backToLoginRow}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backToLoginText}>
                    Remembered your password?{' '}
                    <Text style={styles.backToLoginHighlight}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Privacy Footnote */}
          <View style={styles.securityFooter}>
            <Text style={styles.securityText}>
              🔒 Protected under HIPAA & DPDP Data Security Standards
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F9',
  },
  keyboardAvoid: {
    flex: 1,
  },
  topGlow: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(254, 205, 211, 0.45)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -70,
    left: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 228, 230, 0.4)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9F1239',
  },
  appBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  appBadgeEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  appBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9F1239',
  },
  headerSection: {
    marginBottom: 20,
  },
  screenHeading: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginTop: 6,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#B91C1C',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputPrefixIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#E11D48',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },
  backToLoginRow: {
    alignItems: 'center',
    marginTop: 18,
  },
  backToLoginText: {
    fontSize: 13.5,
    color: '#6B7280',
  },
  backToLoginHighlight: {
    color: '#E11D48',
    fontWeight: '800',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  successEmail: {
    color: '#E11D48',
    fontWeight: '700',
  },
  resendBtn: {
    marginTop: 16,
    paddingVertical: 6,
  },
  resendText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  securityFooter: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
});
