import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ProfileProvider } from '@/contexts/ProfileContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ProfileProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </ProfileProvider>
    </ThemeProvider>
  );
}
