import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/auth.store';
import { usePregnancyStore } from '../store/pregnancy.store';
import { useAppointmentStore } from '../store/appointment.store';

export default function RootLayout() {
  const hydrateAuth = useAuthStore((state: any) => state.hydrate);
  const hydratePregnancy = usePregnancyStore((state: any) => state.hydrate);
  const hydrateAppointments = useAppointmentStore((state: any) => state.hydrate);

  useEffect(() => {
    // Hydrate state from AsyncStorage on app launch
    hydrateAuth();
    hydratePregnancy();
    hydrateAppointments();
  }, [hydrateAuth, hydratePregnancy, hydrateAppointments]);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
