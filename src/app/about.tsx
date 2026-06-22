import { ScreenHeader } from "@/components/screen-header";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="About Us" backLabel="Settings" onBack={() => router.back()} />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/creators")}>
            <Text style={[styles.rowText, { color: theme.text }]}>Creators</Text>
            <AppIcon name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={() => router.push("/purpose")}>
            <Text style={[styles.rowText, { color: theme.text }]}>App Purpose</Text>
            <AppIcon name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: 16, paddingTop: 20 },
  section: { borderRadius: 10, marginBottom: 24, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowText: { fontSize: 17 },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#38383a",
    marginLeft: 16,
  },
});
