import { apiClient } from './client';

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  role?: 'MOTHER' | 'CAREGIVER' | 'PARTNER';
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  signup: (payload: SignupPayload) => apiClient.post('/auth/signup', payload),
  verifyOtp: (payload: VerifyOtpPayload) => apiClient.post('/auth/verify-otp', payload),
  resendOtp: (payload: { email: string }) => apiClient.post('/auth/resend-otp', payload),
  signin: (payload: SigninPayload) => apiClient.post('/auth/signin', payload),
  login: (payload: SigninPayload) => apiClient.post('/auth/login', payload),
  forgotPassword: (payload: ForgotPasswordPayload) => apiClient.post('/auth/forgot-password', payload),
  resetPassword: (payload: ResetPasswordPayload) => apiClient.post('/auth/reset-password', payload),
};
