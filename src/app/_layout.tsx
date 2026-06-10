import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { ActivityIndicator, Image as RNImage, View, useColorScheme } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import OnboardingScreen from '@/app/onboarding';

// Resolve the local asset to a URI that expo-image can prefetch
const GUYS_URI = RNImage.resolveAssetSource(
  require('../../assets/images/guys.png')
).uri;

function AppShell() {
  const { isLoading, isProfileComplete } = useProfile();

  useEffect(() => {
    // Preload sprite sheet into expo-image's memory cache on app start
    ExpoImage.prefetch(GUYS_URI);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#30d158" />
      </View>
    );
  }

  if (!isProfileComplete) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ProfileProvider>
        <AppShell />
      </ProfileProvider>
    </ThemeProvider>
  );
}
