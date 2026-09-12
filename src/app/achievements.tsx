import { ScreenHeader } from "@/components/screen-header";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { ACHIEVEMENTS } from "@/services/achievements";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AchievementsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { totalScans } = useProfile();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Achievements" backLabel="Activity" onBack={() => router.back()} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => {
            const completed = totalScans >= achievement.scanGoal;
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: theme.backgroundElement },
                  !completed && { opacity: 0.4 },
                ]}
              >
                <View style={[styles.achievementIcon, { backgroundColor: completed ? "#34c759" : "#8e8e93" }]}>
                  <AppIcon name={achievement.icon} size={32} tintColor="#fff" />
                </View>
                <Text style={[styles.achievementTitle, { color: theme.text }]}>{achievement.title}</Text>
                <Text style={[styles.achievementDesc, { color: "#8e8e93" }]}>{achievement.description}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: 16, paddingTop: 20 },

  achievementsGrid: { paddingBottom: 24 },
  achievementCard: {
    borderRadius: 12, padding: 16,
    alignItems: "center", marginBottom: 16,
  },
  achievementIcon: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  achievementTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6, textAlign: "center" },
  achievementDesc: { fontSize: 14, textAlign: "center" },
});
