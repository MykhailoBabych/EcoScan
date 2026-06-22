import { ScreenHeader } from "@/components/screen-header";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { LeaderboardEntry, LeaderboardService } from "@/services/lessons";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { name } = useProfile();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    LeaderboardService.load().then((data) => {
      setLeaderboard(data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Leaderboard" backLabel="Activity" onBack={() => router.back()} />
      <ScrollView style={styles.scrollView}>
        {loading ? (
          <View style={styles.leaderboardLoading}>
            <AppIcon name="arrow.clockwise" size={24} tintColor="#28a745" />
            <Text style={[styles.leaderboardLoadingText, { color: theme.textSecondary }]}>
              Loading...
            </Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.leaderboardLoading}>
            <Text style={{ fontSize: 36 }}>🌱</Text>
            <Text style={[styles.leaderboardLoadingText, { color: theme.textSecondary }]}>
              No scores yet. Be the first!
            </Text>
          </View>
        ) : (
          <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
            {leaderboard.map((user, index) => {
              const isMe = name.trim() !== "" && user.name === name.trim();
              return (
                <View key={user.rank}>
                  <View style={[styles.row, isMe && styles.rowHighlight]}>
                    <View style={styles.rowLeft}>
                      <Text style={[styles.rankText, { color: isMe ? "#28a745" : theme.text }]}>
                        {MEDAL[user.rank] ?? `#${user.rank}`}
                      </Text>
                      <Text style={[styles.rowText, { color: isMe ? "#28a745" : theme.text, marginLeft: 12, fontWeight: isMe ? "700" : "400" }]}>
                        {user.name}{isMe ? " (you)" : ""}
                      </Text>
                    </View>
                    <Text style={[styles.scoreText, { color: isMe ? "#28a745" : "#0a84ff" }]}>
                      {user.score} pts
                    </Text>
                  </View>
                  {index < leaderboard.length - 1 && <View style={styles.separator} />}
                </View>
              );
            })}
          </View>
        )}
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
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowText: { fontSize: 17 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#38383a", marginLeft: 16 },
  rankText: { fontSize: 17, fontWeight: "600", width: 36 },
  scoreText: { fontSize: 17, fontWeight: "bold" },
  rowHighlight: { backgroundColor: "rgba(40,167,69,0.08)" },
  leaderboardLoading: { alignItems: "center", paddingVertical: 48, gap: 12 },
  leaderboardLoadingText: { fontSize: 15 },
});
