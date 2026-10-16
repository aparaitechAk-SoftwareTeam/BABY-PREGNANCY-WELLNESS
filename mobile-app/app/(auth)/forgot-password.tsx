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
import { KeyRound, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { authApi } from '../../services/api/auth.api';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Step 1 = Enter Email, Step 2 = Enter OTP & New Password, Step 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setErrorMessage('');
    const emailLower = email.trim().toLowerCase();
    if (!emailLower || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailLower)) {
      setErrorMessage('Please enter a valid registered @gmail.com address');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.forgotPassword({ email: emailLower });
      setSuccessBanner('A 6-digit verification code has been sent to your email.');
      setStep(2);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send reset code. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Error sending reset code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and Set New Password
  const handleResetPassword = async () => {
    setErrorMessage('');
    setSuccessBanner('');

    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit code sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 8 || newPassword.length > 16) {
      setErrorMessage('Password must be between 8 and 16 characters long');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one uppercase letter (A-Z)');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one lowercase letter (a-z)');
      return;
    }

    if (!/\d/.test(newPassword)) {
      setErrorMessage('Password must contain at least one number (0-9)');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setErrorMessage('Password must contain at least one special symbol (e.g. !@#$%^&*)');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      setStep(3);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.message || 'Invalid or expired code. Please check and try again.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Password reset failed.');
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
              onPress={() => (step === 2 ? setStep(1) : router.back())}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color="#0F172A" />
              <Text style={styles.backButtonText}>{step === 2 ? 'Change Email' : 'Back'}</Text>
            </TouchableOpacity>

            <View style={styles.appBadge}>
              <Text style={styles.appBadgeText}>AparaiTech Care</Text>
            </View>
          </View>

          {/* Step 3: Success Screen */}
          {step === 3 ? (
            <View style={styles.cardContainer}>
              <View style={styles.successState}>
                <View style={styles.successCircle}>
                  <CheckCircle2 size={42} color="#10B981" />
                </View>
                <Text style={styles.successTitle}>Password Reset Complete</Text>
                <Text style={styles.successDescription}>
                  Your password has been successfully updated. You can now securely sign in to your AparaiTech account with your new credentials.
                </Text>

                <TouchableOpacity
                  onPress={() => router.replace('/(auth)/login')}
                  style={styles.primaryButton}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryButtonText}>Proceed to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.cardContainer}>
              {/* Header */}
              <View style={styles.headerSection}>
                <View style={styles.iconCircle}>
                  <KeyRound size={28} color="#E11D48" />
                </View>
                <Text style={styles.screenHeading}>
                  {step === 1 ? 'Forgot Password?' : 'Create New Password'}
                </Text>
                <Text style={styles.screenSubtitle}>
                  {step === 1
                    ? 'Enter your registered email and we will send you a 6-digit verification code.'
                    : `Enter the 6-digit code sent to ${email} and choose your new password.`}
                </Text>
              </View>

              {/* Error Banner */}
              {!!errorMessage && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={16} color="#DC2626" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Success Banner */}
              {!!successBanner && (
                <View style={styles.successBanner}>
                  <CheckCircle2 size={16} color="#059669" />
                  <Text style={styles.successBannerText}>{successBanner}</Text>
                </View>
              )}

              {/* Step 1 Form */}
              {step === 1 && (
                <View style={styles.formSection}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Registered Email Address</Text>
                    <View style={styles.inputContainer}>
                      <Mail size={18} color="#94A3B8" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. priya.sharma@gmail.com"
                        placeholderTextColor="#94A3B8"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleRequestOtp}
                    disabled={isSubmitting}
                    style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                    activeOpacity={0.88}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Send 6-Digit Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2 Form */}
              {step === 2 && (
                <View style={styles.formSection}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
                    <View style={styles.inputContainer}>
                      <ShieldCheck size={18} color="#94A3B8" />
                      <TextInput
                        style={[styles.textInput, { letterSpacing: 4, fontWeight: '700' }]}
                        placeholder="123456"
                        placeholderTextColor="#94A3B8"
                        value={otp}
                        onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>New Password (min 6 characters)</Text>
                    <View style={styles.inputContainer}>
                      <Lock size={18} color="#94A3B8" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter new password"
                        placeholderTextColor="#94A3B8"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <View style={styles.inputContainer}>
                      <Lock size={18} color="#94A3B8" />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Re-enter new password"
                        placeholderTextColor="#94A3B8"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={isSubmitting}
                    style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]}
                    activeOpacity={0.88}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Update Password & Sign In</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleRequestOtp}
                    disabled={isSubmitting}
                    style={styles.resendBtn}
                  >
                    <Text style={styles.resendText}>Didn't receive code? Resend Email</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  appBadge: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  appBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E11D48',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  screenHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12.5,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 12.5,
    color: '#059669',
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    gap: 16,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#E11D48',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#FDA4AF',
  },
  primaryButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  resendBtn: {
    alignSelf: 'center',
    marginTop: 8,
    padding: 6,
  },
  resendText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#E11D48',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});
