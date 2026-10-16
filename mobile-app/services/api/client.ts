import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to machine IP so physical Expo devices on the same Wi-Fi can reach the NestJS backend
const DEFAULT_API_URL = Platform.select({
  web: 'http://localhost:3000/api',
  android: 'http://192.168.1.5:3000/api',
  ios: 'http://192.168.1.5:3000/api',
  default: 'http://localhost:3000/api',
});

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach stored JWT token to all requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('aparai_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage errors
  }
  return config;
});

// Intercept 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);
