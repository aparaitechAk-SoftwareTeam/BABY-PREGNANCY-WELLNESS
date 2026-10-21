import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Determine the most accurate backend URL for the current testing environment
const resolveBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }

  // Extract host IP dynamically from Expo's Metro server connection
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && !hostIp.includes('exp.direct') && !hostIp.includes('localhost') && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:3000/api`;
    }
  }

  // Active Wi-Fi interface IP for testing
  return 'http://192.168.1.5:3000/api';
};

export const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach stored JWT token and user info to all requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('aparai_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const userStr = await AsyncStorage.getItem('aparai_user');
    if (userStr && config.headers) {
      const user = JSON.parse(userStr);
      const uid = user?.id || user?.sub;
      if (uid) config.headers['x-user-id'] = uid;
      if (user?.email) config.headers['x-user-email'] = user.email;
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
