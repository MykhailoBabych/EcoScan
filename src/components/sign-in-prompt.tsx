import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  children: React.ReactNode;
};

export function SignInPrompt({ children }: Props) {
  const { step } = useProfile();
  const router = useRouter();

  if (step === "done") {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {"Please "}
        <Text style={styles.link} onPress={() => router.navigate("/(tabs)/profile")}>
          sign in
        </Text>
        {" to continue"}
      </Text>
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
  link: {
    color: "#0a84ff",
    fontSize: 20,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
