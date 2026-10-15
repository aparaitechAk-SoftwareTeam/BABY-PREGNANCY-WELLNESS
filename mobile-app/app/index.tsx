import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import LoadingScreen from '../components/common/LoadingScreen';

export default function Index() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Minimal delay - just enough to prevent flash
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only navigate once we're ready
    if (!isReady) return;

    if (token && user) {
      // Route based on user role
      if (user.role === 'CAREGIVER') {
        router.replace('/(caregiver)');
      } else if (user.role === 'MOTHER') {
        router.replace('/(mother)');
      } else {
        // Fallback to auth if role is not recognized
        router.replace('/(auth)/welcome');
      }
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [token, user, isReady]);

  return <LoadingScreen />;
}
