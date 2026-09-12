import { ScreenHeader } from "@/components/screen-header";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PurposeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="App Purpose" backLabel="About Us" onBack={() => router.back()} />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.textContainer, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            EcoScan&apos;s goal — help people make the right environmental
            decisions in everyday life: scan an object → get advice to recycle
            or reuse it, with nearby collection points shown on the map.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: 16, paddingTop: 20 },
  textContainer: {
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 24,
  },
});
