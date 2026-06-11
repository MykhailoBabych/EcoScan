import { PlanetSvg } from "@/components/planet-svg";
import { useEcoScore } from "@/hooks/use-eco-score";
import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getStatus(score: number) {
  if (score >= 0.8) {
    return {
      label: "Thriving",
      color: "#16a34a",
      message: "Your planet is thriving. Keep recycling to keep it green.",
    };
  }

  if (score >= 0.4) {
    return {
      label: "Recovering",
      color: "#0a84ff",
      message: "Your planet is recovering. A few more recyclables will help.",
    };
  }

  return {
    label: "Polluted",
    color: "#78350f",
    message: "Your planet needs help. Start recycling to clean it up.",
  };
}

export default function PlanetScreen() {
  const { score, recycledCount, wastedCount } = useEcoScore();
  const theme = useTheme();
  const status = getStatus(score);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Planet Health
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.planetWrapper}>
          <PlanetSvg score={score} size={220} />
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: `${status.color}22`,
              borderColor: status.color,
            },
          ]}
        >
          <Text style={[styles.badgeScore, { color: status.color }]}>
            {Math.round(score * 100)}%
          </Text>
          <Text style={[styles.badgeLabel, { color: status.color }]}>
            {status.label}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Text style={styles.statValue}>{recycledCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              items recycled
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Text style={[styles.statValue, { color: theme.text }]}>
              {wastedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              needs sorting
            </Text>
          </View>
        </View>

        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {status.message}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },
  planetWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 2,
  },
  badgeScore: {
    fontSize: 32,
    fontWeight: "800",
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: "#28a745",
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 15,
    paddingHorizontal: 8,
  },
});
