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

export default function SignupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state: any) => state.setUser);
  const setToken = useAuthStore((state: any) => state.setToken);

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

  const handleSignup = async () => {
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter a password');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // For caregivers, require joining code
    if (!isMother && !joiningCode.trim()) {
      setErrorMessage('Please enter the joining code provided by the mother');
      return;
    }

    // Validate joining code for caregivers
    if (!isMother && joiningCode.trim() !== 'MOTHER123') {
      setErrorMessage('Invalid joining code. Please check and try again.');
      return;
    }

    if (!termsAccepted || !privacyAccepted) {
      setErrorMessage('Please accept Terms of Use and Privacy Policy');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 850));

      const mockUser = {
        id: 'usr_' + Date.now(),
        name: fullName.trim(),
        email: email.trim(),
        role: isMother ? 'MOTHER' : 'CAREGIVER',
        isMother: isMother,
        createdAt: new Date().toISOString(),
      };

      const mockToken = 'signup_jwt_token_' + Date.now();

      // Use auth store (which handles AsyncStorage internally)
      await setUser(mockUser);
      await setToken(mockToken);

      // Navigate to onboarding pregnancy setup for mother, or caregiver dashboard
      if (isMother) {
        router.replace('/(onboarding)/pregnancy-setup');
      } else {
        router.replace('/(caregiver)');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Sign up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setSocialLoading('google');
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      const mockGoogleUser = {
        id: 'goog_' + Date.now(),
        name: 'Google User',
        email: 'user@gmail.com',
        role: isMother ? 'MOTHER' : 'CAREGIVER',
        isMother: isMother,
        createdAt: new Date().toISOString(),
      };

      const mockToken = 'google_signup_token_' + Date.now();

      await setUser(mockGoogleUser);
      await setToken(mockToken);

      if (isMother) {
        router.replace('/(onboarding)/pregnancy-setup');
      } else {
        router.replace('/(caregiver)');
      }
    } catch {
      setErrorMessage('Google Sign-Up failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignUp = async () => {
    setErrorMessage('');
    setSocialLoading('apple');
    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      const mockAppleUser = {
        id: 'apple_' + Date.now(),
        name: 'Apple User',
        email: 'user@privaterelay.appleid.com',
        role: isMother ? 'MOTHER' : 'CAREGIVER',
        isMother: isMother,
        createdAt: new Date().toISOString(),
      };

      const mockToken = 'apple_signup_token_' + Date.now();

      await setUser(mockAppleUser);
      await setToken(mockToken);

      if (isMother) {
        router.replace('/(onboarding)/pregnancy-setup');
      } else {
        router.replace('/(caregiver)');
      }
    } catch {
      setErrorMessage('Apple Sign-Up failed. Please try again.');
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
            <View style={styles.brandBadge}>
              <Heart size={14} color="#E11D48" strokeWidth={2.5} />
              <Text style={styles.brandBadgeText}>AparaiTech Wellness</Text>
            </View>
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.screenHeading}>Join Our Community</Text>
            <Text style={styles.screenSubtitle}>
              Create your account to start tracking your pregnancy journey with us.
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
                  <View style={styles.googleIconCircle}>
                    <Text style={styles.googleIconLetter}>G</Text>
                  </View>
                  <Text style={styles.googleButtonText}>Google</Text>
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
                <View style={styles.loadingAppleRow}>
                  <Text style={styles.appleLogoSmall}>􀄨</Text>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.socialBtnContent}>
                  <Text style={styles.appleLogo}>􀄨</Text>
                  <Text style={styles.appleButtonText}>Apple</Text>
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
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  googleButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  googleIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  googleIconLetter: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#EA4335',
  },
  googleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  appleButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleLogo: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 6,
    fontWeight: 'bold',
  },
  appleLogoSmall: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 6,
    fontWeight: 'bold',
  },
  loadingAppleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  appleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
});
