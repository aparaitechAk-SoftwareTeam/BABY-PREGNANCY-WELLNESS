import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ShieldCheck, Mail, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { authApi } from '../../services/api/auth.api';
import { useAuthStore } from '../../store/auth.store';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; role?: string }>();
  const email = params.email || '';

  const setUser = useAuthStore((state: any) => state.setUser);
  const setToken = useAuthStore((state: any) => state.setToken);

  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(30);

  const inputRef = useRef<TextInput>(null);

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for Resend
  useEffect(() => {
    if (countdown > 0) {
      const interval = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [countdown]);

  const handleVerify = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const { user, token } = response.data;

      await setUser(user);
      await setToken(token);

      setSuccessMessage('Account verified successfully! Redirecting...');

      setTimeout(() => {
        if (user.role === 'CAREGIVER') {
          router.replace('/(caregiver)');
        } else if (!user.setupCompleted && !user.isProfileCompleted) {
          router.replace('/(onboarding)/pregnancy-setup');
        } else {
          router.replace('/(mother)');
        }
      }, 700);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid or expired code. Please check your email and try again.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsResending(true);

    try {
      await authApi.resendOtp({ email: email.trim().toLowerCase() });
      setSuccessMessage('A fresh 6-digit code has been sent to your email.');
      setCountdown(45);
      setOtp('');
      inputRef.current?.focus();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Could not resend code. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Resend failed.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Decorative glows */}
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(auth)/login')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#0F172A" />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          {/* Header Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={38} color="#E11D48" strokeWidth={2.2} />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit security code to:
          </Text>
          <View style={styles.emailPill}>
            <Mail size={14} color="#E11D48" />
            <Text style={styles.emailText}>{email || 'your email'}</Text>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <View style={styles.alertError}>
              <AlertCircle size={18} color="#EF4444" />
              <Text style={styles.alertErrorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Success Message */}
          {successMessage ? (
            <View style={styles.alertSuccess}>
              <CheckCircle2 size={18} color="#10B981" />
              <Text style={styles.alertSuccessText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* OTP Digit Boxes - Wrapped in TouchableOpacity so tapping anywhere immediately focuses and allows editing */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={styles.otpBoxesContainer}
          >
            <View style={styles.otpBoxesRow}>
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otp[index] || '';
                const isCurrent = index === otp.length;
                const isFocused = isCurrent && !errorMessage;
                const hasError = !!errorMessage;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      char ? styles.otpBoxFilled : null,
                      isFocused ? styles.otpBoxActive : null,
                      hasError ? styles.otpBoxError : null,
                    ]}
                  >
                    <Text style={[styles.otpBoxText, hasError && styles.otpBoxTextError]}>{char}</Text>
                  </View>
                );
              })}
            </View>

            {/* Hidden full TextInput directly overlaying the boxes area so taps hit the input natively */}
            <TextInput
              ref={inputRef}
              style={styles.fullOverlayInput}
              value={otp}
              onChangeText={(text) => {
                const sanitized = text.replace(/[^0-9]/g, '').slice(0, 6);
                setOtp(sanitized);
                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
              textContentType="oneTimeCode"
              autoFocus
            />
          </TouchableOpacity>

          {/* Quick Clear / Edit button when digits exist or if error occurred */}
          {otp.length > 0 && (
            <TouchableOpacity
              style={styles.clearButtonRow}
              onPress={() => {
                setOtp('');
                setErrorMessage('');
                inputRef.current?.focus();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Clear & re-enter code</Text>
            </TouchableOpacity>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (otp.length !== 6 || isSubmitting) && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={otp.length !== 6 || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendPrompt}>Didn't receive the email code?</Text>
            <TouchableOpacity
              onPress={handleResend}
              disabled={countdown > 0 || isResending}
              style={styles.resendButton}
            >
              {isResending ? (
                <ActivityIndicator size="small" color="#E11D48" />
              ) : (
                <View style={styles.resendButtonInner}>
                  <RefreshCw size={13} color={countdown > 0 ? '#94A3B8' : '#E11D48'} />
                  <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  topGlow: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(251, 113, 133, 0.08)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  iconContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  alertError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  alertErrorText: {
    flex: 1,
    fontSize: 12.5,
    color: '#B91C1C',
    fontWeight: '600',
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  alertSuccessText: {
    flex: 1,
    fontSize: 12.5,
    color: '#047857',
    fontWeight: '600',
  },
  otpBoxesContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginVertical: 14,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
  },
  otpBoxActive: {
    borderColor: '#E11D48',
    borderWidth: 2,
    backgroundColor: '#FFF5F6',
  },
  otpBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  otpBoxText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpBoxTextError: {
    color: '#DC2626',
  },
  fullOverlayInput: {
    ...StyleSheet.absoluteFill,
    opacity: 0.01,
    color: 'transparent',
    fontSize: 1,
  },
  clearButtonRow: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  clearButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#E11D48',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  verifyButtonDisabled: {
    backgroundColor: '#FDA4AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resendSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  resendPrompt: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resendButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
});
