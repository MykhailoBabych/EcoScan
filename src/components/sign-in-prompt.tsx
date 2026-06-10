import { useProfile } from "@/contexts/ProfileContext";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

// AppShell in _layout.tsx already gates the app behind onboarding,
// so this component will always render children when tabs are visible.
// Kept as a safety net in case of direct deep-link navigation.
export function SignInPrompt({ children }: Props) {
  const { isProfileComplete } = useProfile();

  if (isProfileComplete) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Please complete onboarding first.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  message: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
  },
});
