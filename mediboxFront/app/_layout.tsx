import { useEffect } from 'react';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { notificationService } from '@/services/notificationService';

function AuthGuard() {
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // carrega auth uma vez
  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    // 🔥 impede navegação antes do router estar pronto
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    } 
    else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, navigationState]);

  return null;
}

export default function RootLayout() {
  const scheme = useColorScheme();

  useEffect(() => {
    notificationService.registerForPushNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <AuthGuard />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="medication/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="medication/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="responsible/new" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}