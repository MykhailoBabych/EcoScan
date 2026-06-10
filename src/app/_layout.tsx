import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { ActivityIndicator, useColorScheme, View } from "react-native";

import OnboardingScreen from "@/app/onboarding";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";
import { ProfileProvider, useProfile } from "@/contexts/ProfileContext";

// Inner component so it can consume ProfileContext
function AppShell() {
  const { isLoading, isProfileComplete } = useProfile();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
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
      <AppTabs />
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ProfileProvider>
        <AppShell />
      </ProfileProvider>
    </ThemeProvider>
  );
}
