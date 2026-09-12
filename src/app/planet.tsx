import { AnimatedProgressBar } from "@/components/animated-progress-bar";
import { PlanetHero } from "@/components/planet-hero";
import { StatTile } from "@/components/stat-tile";
import { useTheme } from "@/hooks/use-theme";
import { usePlanet } from "@/hooks/use-planet";
import { haptics } from "@/services/haptics";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlanetScreen() {
  const theme = useTheme();
  const {
    health,
    healthPct,
    stage,
    nextStage,
    levelProgress,
    itemsToNext,
    recycledCount,
    totalPoints,
    totalScans,
  } = usePlanet();

  // Celebrate when the planet advances to a new level (skips the first render).
  const prevLevel = useRef(stage.level);
  useEffect(() => {
    if (stage.level > prevLevel.current) {
      haptics.levelUp();
    }
    prevLevel.current = stage.level;
  }, [stage.level]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Your Planet
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero: planet (health) + level ring ────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <PlanetHero
            health={health}
            levelProgress={levelProgress}
            level={stage.level}
            color={stage.color}
          />
        </Animated.View>

        {/* ── Stage name + motivational status ──────────────────────────── */}
        <View style={styles.stageBlock}>
          <Text style={[styles.stageName, { color: stage.color }]}>
            {stage.name}
          </Text>
          <Text style={[styles.stageMessage, { color: theme.textSecondary }]}>
            {stage.message}
          </Text>
        </View>

        {/* ── Level progress bar ────────────────────────────────────────── */}
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundElement }]}>
          {nextStage ? (
            <>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressLabel, { color: theme.text }]}>
                  Level {stage.level}
                </Text>
                <Text style={[styles.progressNext, { color: theme.textSecondary }]}>
                  Next: {nextStage.name}
                </Text>
              </View>
              <AnimatedProgressBar progress={levelProgress} color={stage.color} />
              <Text style={[styles.progressHint, { color: theme.textSecondary }]}>
                {itemsToNext} more {itemsToNext === 1 ? "item" : "items"} recycled
                to reach {nextStage.name}
              </Text>
            </>
          ) : (
            <View style={styles.maxedRow}>
              <Text style={styles.maxedEmoji}>🏆</Text>
              <Text style={[styles.maxedText, { color: theme.text }]}>
                Max level reached — your planet is a Living Paradise!
              </Text>
            </View>
          )}
        </View>

        {/* ── Core stats ────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(140)}
          style={styles.statsGrid}
        >
          <View style={styles.statsRow}>
            <StatTile
              icon="leaf.fill"
              value={`${healthPct}%`}
              label="Planet Health"
              color="#16a34a"
            />
            <StatTile
              icon="globe.europe.africa.fill"
              value={`Lvl ${stage.level}`}
              label="Planet Level"
              color={stage.color}
            />
          </View>
          <View style={styles.statsRow}>
            <StatTile
              icon="arrow.triangle.2.circlepath"
              value={`${recycledCount}`}
              label="Items Recycled"
              color="#0891b2"
            />
            <StatTile
              icon="star.fill"
              value={totalPoints.toLocaleString()}
              label="Total Eco Points"
              color="#f59e0b"
            />
          </View>
        </Animated.View>

        {/* ── First-scan nudge ──────────────────────────────────────────── */}
        {totalScans === 0 && (
          <View style={[styles.nudge, { borderColor: stage.color + "55" }]}>
            <Text style={styles.nudgeEmoji}>🌍</Text>
            <Text style={[styles.nudgeText, { color: theme.textSecondary }]}>
              Head to the Scan tab and recycle your first item to bring your
              planet to life.
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
  },

  // Stage
  stageBlock: { alignItems: "center", gap: 6, paddingHorizontal: 8 },
  stageName: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  stageMessage: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  // Progress
  progressCard: {
    width: "100%",
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: 16, fontWeight: "800" },
  progressNext: { fontSize: 13, fontWeight: "600" },
  progressHint: { fontSize: 13, fontWeight: "500" },
  maxedRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  maxedEmoji: { fontSize: 28 },
  maxedText: { flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 21 },

  // Stats
  statsGrid: { width: "100%", gap: 12 },
  statsRow: { flexDirection: "row", gap: 12 },

  // Nudge
  nudge: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  nudgeEmoji: { fontSize: 28 },
  nudgeText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: "500" },
});
