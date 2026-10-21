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
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Heart,
  User,
  Mail,
  Link2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Users,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { TermsPrivacyModal } from '../../components/modals/TermsPrivacyModal';
import { authApi } from '../../services/api/auth.api';
import { GoogleIcon, AppleIcon } from '../../components/common';
import { usePregnancyStore } from '../../store/pregnancy.store';

export default function SignupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state: any) => state.setUser);
  const setToken = useAuthStore((state: any) => state.setToken);
  const resetPregnancyProfile = usePregnancyStore((state) => state.resetProfile);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMother, setIsMother] = useState(true); // true=Mother, false=Caregiver

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Modal state
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  // Caregiver Joining Code state
  const [joiningCode, setJoiningCode] = useState('');

  // Google Account Picker Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  const handleSignup = async () => {
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    const emailLower = email.trim().toLowerCase();
    if (!emailLower) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailLower)) {
      setErrorMessage('Email address must be a valid @gmail.com address');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password');
      return;
    }

    if (password.length < 8 || password.length > 16) {
      setErrorMessage('Password must be between 8 and 16 characters long');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must contain at least one uppercase letter (A-Z)');
      return;
    }

    if (!/[a-z]/.test(password)) {
      setErrorMessage('Password must contain at least one lowercase letter (a-z)');
      return;
    }

    if (!/\d/.test(password)) {
      setErrorMessage('Password must contain at least one number (0-9)');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setErrorMessage('Password must contain at least one special symbol (e.g. !@#$%^&*)');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Validate caregiver code against live database
    if (!isMother) {
      if (!joiningCode.trim()) {
        setErrorMessage('Please enter the joining code provided by the mother');
        return;
      }
      try {
        const checkRes = await authApi.validateCaregiverCode(joiningCode.trim().toUpperCase());
        if (!checkRes?.data?.valid) {
          setErrorMessage(checkRes?.data?.message || 'Invalid joining code. Please check and try again.');
          return;
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Invalid joining code. Please check with the mother.';
        setErrorMessage(typeof msg === 'string' ? msg : 'Invalid joining code.');
        return;
      }
    }

    if (!termsAccepted || !privacyAccepted) {
      setErrorMessage('Please accept Terms of Use and Privacy Policy');
      return;
    }

    setIsSubmitting(true);
    try {
      const role = isMother ? 'MOTHER' : 'CAREGIVER';
      await authApi.signup({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role,
      });

      // Redirect to OTP verification screen
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim().toLowerCase(), role },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check your details and try again.';
      setErrorMessage(
        typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Sign up failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    setErrorMessage('');
    if (!isMother) {
      if (!joiningCode.trim()) {
        setErrorMessage('Please enter the 6-digit joining code provided by the mother before continuing with Google');
        return;
      }
    }
    setGoogleEmail(email.trim());
    setGoogleName(fullName.trim());
    setShowGoogleModal(true);
  };

  const handleConfirmGoogleAuth = async () => {
    if (!googleEmail.trim() || !googleEmail.includes('@')) {
      Alert.alert('Invalid Google Email', 'Please enter a valid Google email address (e.g. yourname@gmail.com).');
      return;
    }

    setSocialLoading('google');
    setErrorMessage('');
    try {
      const role = isMother ? 'MOTHER' : 'CAREGIVER';

      if (!isMother) {
        if (!joiningCode.trim()) {
          setErrorMessage('Please enter the joining code provided by the mother before signing up');
          setSocialLoading(null);
          return;
        }
        const checkRes = await authApi.validateCaregiverCode(joiningCode.trim().toUpperCase());
        if (!checkRes?.data?.valid) {
          setErrorMessage(checkRes?.data?.message || 'Invalid joining code. Please check with the mother.');
          setSocialLoading(null);
          return;
        }
      }

      const response = await authApi.googleAuth({
        email: googleEmail.trim().toLowerCase(),
        name: googleName.trim() || googleEmail.split('@')[0],
        role,
        joiningCode: !isMother ? joiningCode.trim().toUpperCase() : undefined,
      });

      const { user, token } = response.data;
      setShowGoogleModal(false);

      await resetPregnancyProfile();
      await setUser(user);
      await setToken(token);

      Alert.alert(
        'Google Sign-Up Successful',
        `Welcome to Aparaitech-wellness! Your account is verified without needing OTP. We have emailed your account login password to ${user.email} so you can also log in via Email & Password anytime.`,
        [
          {
            text: 'Get Started',
            onPress: () => {
              if (isMother) {
                router.replace('/(onboarding)/pregnancy-setup');
              } else {
                router.replace('/(caregiver)');
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Google Sign-Up failed. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Google Sign-Up failed.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    setErrorMessage('');
    setSocialLoading('apple');
    try {
      const role = isMother ? 'MOTHER' : 'CAREGIVER';

      if (!isMother) {
        if (!joiningCode.trim()) {
          setErrorMessage('Please enter the joining code provided by the mother before signing up');
          setSocialLoading(null);
          return;
        }
        const checkRes = await authApi.validateCaregiverCode(joiningCode.trim().toUpperCase());
        if (!checkRes?.data?.valid) {
          setErrorMessage(checkRes?.data?.message || 'Invalid joining code. Please check with the mother.');
          setSocialLoading(null);
          return;
        }
      }

      const candidateEmail =
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim())
          ? email.trim().toLowerCase()
          : 'apple.user@privaterelay.appleid.com';

      const response = await authApi.googleAuth({
        email: candidateEmail,
        name: fullName.trim() || 'Apple User',
        role,
        joiningCode: !isMother ? joiningCode.trim().toUpperCase() : undefined,
      });

      const { user, token } = response.data;

      await resetPregnancyProfile();
      await setUser(user);
      await setToken(token);

      if (isMother) {
        router.replace('/(onboarding)/pregnancy-setup');
      } else {
        router.replace('/(caregiver)');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Apple Sign-Up failed. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Apple Sign-Up failed.');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandHeader}>
            <Image
              source={require('../../assets/aparai_heart_logo.jpg')}
              style={styles.brandLogoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandTitleText}>AparaiTech</Text>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.screenHeading}>Create Your Account</Text>
            <Text style={styles.screenSubtitle}>
              Begin your personalized pregnancy companion
            </Text>
          </View>

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color="#B91C1C" strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Role Toggle */}
            <View style={styles.roleToggleContainer}>
              <Text style={styles.roleLabel}>I am a</Text>
              <View style={styles.roleButtonsRow}>
                <TouchableOpacity
                  onPress={() => setIsMother(true)}
                  style={[
                    styles.roleButton,
                    isMother && styles.roleButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Heart
                    size={14}
                    color={isMother ? '#FFFFFF' : '#64748B'}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      isMother && styles.roleButtonTextActive,
                    ]}
                  >
                    Mother
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsMother(false)}
                  style={[
                    styles.roleButton,
                    !isMother && styles.roleButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Users
                    size={14}
                    color={!isMother ? '#FFFFFF' : '#64748B'}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.roleButtonText,
                      !isMother && styles.roleButtonTextActive,
                    ]}
                  >
                    Caregiver
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'fullName' && styles.inputWrapperFocused,
                ]}
              >
                <User size={16} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <Mail size={16} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <Lock size={16} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Create a strong password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <Eye size={16} color="#9CA3AF" strokeWidth={2} />
                  ) : (
                    <EyeOff size={16} color="#9CA3AF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                ]}
              >
                <Lock size={16} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  {showConfirmPassword ? (
                    <Eye size={16} color="#9CA3AF" strokeWidth={2} />
                  ) : (
                    <EyeOff size={16} color="#9CA3AF" strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Joining Code for Caregivers */}
            {!isMother && (
              <View style={styles.joiningCodeSection}>
                <View style={styles.joiningCodeHeader}>
                  <Link2 size={14} color="#E11D48" strokeWidth={2.5} />
                  <Text style={styles.joiningCodeLabel}>Joining Code from Mother</Text>
                </View>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'joiningCode' && styles.inputWrapperFocused,
                  ]}
                >
                  <Lock size={16} color="#9CA3AF" strokeWidth={2} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter the code provided by the mother"
                    placeholderTextColor="#9CA3AF"
                    value={joiningCode}
                    onChangeText={setJoiningCode}
                    onFocus={() => setFocusedField('joiningCode')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.joiningCodeHint}>
                  The mother can share this code in her profile to add caregivers to her pregnancy tracking.
                </Text>
              </View>
            )}

            {/* Terms and Privacy Checkboxes */}
            <View style={styles.complianceSection}>
              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={styles.checkRow}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxActive,
                  ]}
                >
                  {termsAccepted && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkText}>
                  I agree to the{' '}
                  <Text
                    onPress={() => setTermsModalVisible(true)}
                    style={styles.linkText}
                  >
                    Terms of Use
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPrivacyAccepted(!privacyAccepted)}
                style={styles.checkRow}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    privacyAccepted && styles.checkboxActive,
                  ]}
                >
                  {privacyAccepted && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkText}>
                  I agree to the{' '}
                  <Text
                    onPress={() => setPrivacyModalVisible(true)}
                    style={styles.linkText}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={isSubmitting || socialLoading !== null}
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.submitButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitButtonText}>Create Account</Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Sign-Up Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              onPress={handleGoogleSignUp}
              disabled={socialLoading !== null || isSubmitting}
              style={styles.googleButton}
              activeOpacity={0.85}
            >
              {socialLoading === 'google' ? (
                <ActivityIndicator size="small" color="#EA4335" />
              ) : (
                <View style={styles.socialBtnContent}>
                  <GoogleIcon size={18} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAppleSignUp}
              disabled={socialLoading !== null || isSubmitting}
              style={styles.appleButton}
              activeOpacity={0.85}
            >
              {socialLoading === 'apple' ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <View style={styles.socialBtnContent}>
                  <AppleIcon size={18} color="#000000" />
                  <Text style={styles.appleButtonText}>Continue with Apple</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Prompt */}
          <View style={styles.loginPromptRow}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.complianceNotice}>
            <Text style={styles.securityText}>
              256-Bit Encrypted • HIPAA & DPDP Compliant Wellness Tool
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <TermsPrivacyModal
        visible={termsModalVisible}
        type="terms"
        onClose={() => setTermsModalVisible(false)}
      />

      {/* Privacy Modal */}
      <TermsPrivacyModal
        visible={privacyModalVisible}
        type="privacy"
        onClose={() => setPrivacyModalVisible(false)}
      />

      {/* Google Account Picker Modal */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.googleModalOverlay}
        >
          <View style={styles.googleModalContent}>
            <View style={styles.googleModalHeader}>
              <GoogleIcon size={28} />
              <Text style={styles.googleModalTitle}>Sign in with Google</Text>
              <Text style={styles.googleModalSub}>
                Select or enter your Google account to continue as {isMother ? 'Mother' : 'Caregiver'}
              </Text>
            </View>

            <View style={styles.googleInputGroup}>
              <Text style={styles.googleInputLabel}>Google Account Email</Text>
              <TextInput
                style={styles.googleInputField}
                placeholder="your.email@gmail.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="email-address"
                value={googleEmail}
                onChangeText={setGoogleEmail}
              />
            </View>

            <View style={styles.googleInputGroup}>
              <Text style={styles.googleInputLabel}>Account Name (Optional)</Text>
              <TextInput
                style={styles.googleInputField}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                value={googleName}
                onChangeText={setGoogleName}
              />
            </View>

            <View style={styles.googleModalBtnRow}>
              <TouchableOpacity
                style={styles.googleCancelBtn}
                onPress={() => setShowGoogleModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.googleCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleConfirmBtn}
                onPress={handleConfirmGoogleAuth}
                disabled={socialLoading === 'google'}
                activeOpacity={0.85}
              >
                {socialLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.googleConfirmText}>Continue as Google User</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandLogoImage: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginBottom: 6,
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  headerSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  screenHeading: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  screenSubtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
    marginLeft: 4,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  roleToggleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleButtonActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  inputWrapperFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
  },
  joiningCodeSection: {
    marginBottom: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  joiningCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  joiningCodeLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E11D48',
  },
  joiningCodeHint: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 16,
  },
  complianceSection: {
    marginBottom: 14,
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  checkText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
  },
  linkText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#E11D48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  socialButtonsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  appleButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  appleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  socialBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E11D48',
  },
  complianceNotice: {
    alignItems: 'center',
    paddingTop: 4,
  },
  securityText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
  },
  googleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  googleModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  googleModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  googleModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  googleModalSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  googleInputGroup: {
    marginBottom: 14,
  },
  googleInputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  googleInputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  googleModalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  googleCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleCancelText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748B',
  },
  googleConfirmBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleConfirmText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
