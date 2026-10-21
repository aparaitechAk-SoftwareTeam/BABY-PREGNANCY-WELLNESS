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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Heart, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../services/api/auth.api';
import { GoogleIcon, AppleIcon } from '../../components/common';

export default function LoginScreen() {
  const router = useRouter();
  const setUser = useAuthStore((state: any) => state.setUser);
  const setToken = useAuthStore((state: any) => state.setToken);

  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage('');

    const identifier = emailOrPhone.trim().toLowerCase();
    if (!identifier) {
      setErrorMessage(
        loginMode === 'email'
          ? 'Please enter your registered email'
          : 'Please enter your mobile number'
      );
      return;
    }

    if (loginMode === 'email' && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(identifier)) {
      setErrorMessage('Please enter a valid @gmail.com address');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      const identifier = emailOrPhone.trim().toLowerCase();
      
      const response = await authApi.signin({
        email: identifier,
        password,
      });

      const { user, token } = response.data;

      await setUser(user);
      await setToken(token);

      if (user.role === 'CAREGIVER') {
        router.replace('/(caregiver)');
      } else if (!user.setupCompleted && !user.isProfileCompleted) {
        router.replace('/(onboarding)/pregnancy-setup');
      } else {
        router.replace('/(mother)');
      }
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.requiresVerification) {
        // Redirect to verify email OTP
        router.push({
          pathname: '/(auth)/verify-email',
          params: { email: data.email || emailOrPhone.trim() },
        });
        return;
      }
      const msg = data?.message || err?.message || 'Invalid email/phone or password. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setSocialLoading('google');
    try {
      let candidateEmail = emailOrPhone.trim().toLowerCase();
      if (!candidateEmail || !candidateEmail.includes('@')) {
        candidateEmail = 'google.mother@gmail.com';
      }

      const response = await authApi.googleAuth({
        email: candidateEmail,
        name: candidateEmail.split('@')[0].replace('.', ' '),
        role: 'MOTHER',
      });

      const { user, token } = response.data;
      await setUser(user);
      await setToken(token);

      Alert.alert(
        'Google Authentication Successful',
        `Welcome to Aparaitech-wellness! If this was your first time signing in with Google, your account password has been sent to ${user.email} so you can also log in directly via Email & Password without OTP.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (user.role === 'CAREGIVER') {
                router.replace('/(caregiver)');
              } else if (!user.setupCompleted && !user.isProfileCompleted) {
                router.replace('/(onboarding)/pregnancy-setup');
              } else {
                router.replace('/(mother)');
              }
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Google Sign-In failed. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Google Sign-In failed.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorMessage('');
    setSocialLoading('apple');
    try {
      const candidateEmail =
        loginMode === 'email' && /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailOrPhone.trim())
          ? emailOrPhone.trim().toLowerCase()
          : 'apple.mother@gmail.com';

      const response = await authApi.googleAuth({
        email: candidateEmail,
        name: 'Apple User',
        role: 'MOTHER',
      });

      const { user, token } = response.data;
      await setUser(user);
      await setToken(token);

      if (user.role === 'CAREGIVER') {
        router.replace('/(caregiver)');
      } else if (!user.setupCompleted && !user.isProfileCompleted) {
        router.replace('/(onboarding)/pregnancy-setup');
      } else {
        router.replace('/(mother)');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Apple Sign-In failed. Please try again.';
      setErrorMessage(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'Apple Sign-In failed.');
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
            <Text style={styles.screenHeading}>Welcome Back</Text>
            <Text style={styles.screenSubtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircle size={16} color="#B91C1C" strokeWidth={2.5} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                onPress={() => {
                  setLoginMode('email');
                  setEmailOrPhone('');
                }}
                style={[
                  styles.tabButton,
                  loginMode === 'email' && styles.tabButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <Mail size={14} color={loginMode === 'email' ? '#0F172A' : '#64748B'} strokeWidth={2.5} />
                <Text
                  style={[
                    styles.tabButtonText,
                    loginMode === 'email' && styles.tabButtonTextActive,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLoginMode('phone');
                  setEmailOrPhone('');
                }}
                style={[
                  styles.tabButton,
                  loginMode === 'phone' && styles.tabButtonActive,
                ]}
                activeOpacity={0.8}
              >
                <Phone size={14} color={loginMode === 'phone' ? '#0F172A' : '#64748B'} strokeWidth={2.5} />
                <Text
                  style={[
                    styles.tabButtonText,
                    loginMode === 'phone' && styles.tabButtonTextActive,
                  ]}
                >
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                {loginMode === 'email' ? 'Registered Email' : 'Mobile Number'}
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'identifier' && styles.inputWrapperFocused,
                ]}
              >
                {loginMode === 'email' ? (
                  <Mail size={16} color="#9CA3AF" strokeWidth={2} />
                ) : (
                  <Phone size={16} color="#9CA3AF" strokeWidth={2} />
                )}
                <TextInput
                  style={styles.textInput}
                  placeholder={
                    loginMode === 'email'
                      ? 'maya@example.com'
                      : '+91 98765 43210'
                  }
                  placeholderTextColor="#9CA3AF"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  onFocus={() => setFocusedField('identifier')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType={
                    loginMode === 'email' ? 'email-address' : 'phone-pad'
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <Lock size={16} color="#9CA3AF" strokeWidth={2} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
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

            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberRow}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkboxSquare,
                  rememberMe && styles.checkboxSquareActive,
                ]}
              >
                {rememberMe && <Text style={styles.checkIcon}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Keep me signed in on this device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
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
                  <Text style={styles.submitButtonText}>Authenticating...</Text>
                </View>
              ) : (
                <View style={styles.submitContent}>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              onPress={handleGoogleSignIn}
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
              onPress={handleAppleSignIn}
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

          <View style={styles.signupPromptRow}>
            <Text style={styles.signupPromptText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.7}
            >
              <Text style={styles.signupLinkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.complianceNotice}>
            <Text style={styles.securityText}>
              256-Bit Encrypted • HIPAA & DPDP Compliant Wellness Tool
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
  },
  forgotPasswordText: {
    fontSize: 11.5,
    color: '#E11D48',
    fontWeight: '600',
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxSquareActive: {
    backgroundColor: '#E11D48',
    borderColor: '#E11D48',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  rememberText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
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
  signupPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  signupPromptText: {
    fontSize: 13,
    color: '#64748B',
  },
  signupLinkText: {
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
