import { PlanetSvg } from "@/components/planet-svg";
import { useProfile } from "@/contexts/ProfileContext";
import { useEcoScore } from "@/hooks/use-eco-score";
import { useTheme } from "@/hooks/use-theme";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Impact calculations ──────────────────────────────────────────────────────
// CO₂ savings per scanned item (kg) — conservative estimates based on lifecycle data
const CO2_PER_ITEM: Record<string, number> = {
  plastic:     0.5,   // PET bottle recycled vs landfilled
  glass:       0.3,   // glass jar recycled
  paper:       0.2,   // newspaper / A4 paper
  cardboard:   0.2,   // cardboard box
  metal:       3.0,   // steel can
  textile:     2.0,   // clothing kept out of landfill
  batteries:   0.5,   // battery hazardous waste avoided
  composite:   0.3,   // Tetra Pak carton
  wood:        0.4,   // wood kept from landfill
  toys:        0.8,   // donated toy (production avoided)
  kitchenware: 0.6,   // donated kitchenware
  electronics: 8.0,   // e-waste — valuable metals recovered
};

const WATER_PER_ITEM: Record<string, number> = {
  plastic:     3,     // litres saved
  glass:       1,
  paper:       10,    // paper is very water-intensive to produce
  cardboard:   8,
  metal:       2,
  textile:     70,    // clothing production is extremely water-intensive
  batteries:   400,   // battery contamination prevented (water quality)
  composite:   2,
  wood:        5,
  toys:        15,
  kitchenware: 5,
  electronics: 20,
};

function getStatus(score: number) {
  if (score >= 0.8)
    return { label: "Thriving", color: "#16a34a", message: "Your planet is thriving. Keep recycling to keep it green." };
  if (score >= 0.4)
    return { label: "Recovering", color: "#0a84ff", message: "Your planet is recovering. A few more recyclables will help." };
  return { label: "Polluted", color: "#78350f", message: "Your planet needs help. Start recycling to clean it up." };
}

function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} tonnes`;
  return `${kg.toFixed(1)} kg`;
}

function formatWater(litres: number): string {
  if (litres >= 1000) return `${(litres / 1000).toFixed(1)}k L`;
  return `${Math.round(litres)} L`;
}

// ─── Impact stat card ─────────────────────────────────────────────────────────
function ImpactCard({
  value,
  label,
  emoji,
  color,
  sub,
  theme,
}: {
  value: string;
  label: string;
  emoji: string;
  color: string;
  sub: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[impactStyles.card, { backgroundColor: color + "14" }]}>
      <Text style={impactStyles.emoji}>{emoji}</Text>
      <Text style={[impactStyles.value, { color }]}>{value}</Text>
      <Text style={[impactStyles.label, { color: theme.text }]}>{label}</Text>
      <Text style={[impactStyles.sub, { color: theme.textSecondary }]}>{sub}</Text>
    </View>
  );
}

const impactStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 3,
  },
  emoji: { fontSize: 24, marginBottom: 2 },
  value: { fontSize: 20, fontWeight: "800" },
  label: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  sub: { fontSize: 10, textAlign: "center", lineHeight: 14 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function PlanetScreen() {
  const { score, recycledCount, wastedCount } = useEcoScore();
  const { categoryStats } = useProfile();
  const theme = useTheme();
  const status = getStatus(score);

  // Compute real-world impact from category stats
  const co2Saved = Object.entries(CO2_PER_ITEM).reduce(
    (sum, [cat, kg]) => sum + (categoryStats[cat as keyof typeof categoryStats] ?? 0) * kg,
    0,
  );
  const waterSaved = Object.entries(WATER_PER_ITEM).reduce(
    (sum, [cat, l]) => sum + (categoryStats[cat as keyof typeof categoryStats] ?? 0) * l,
    0,
  );
  // A tree absorbs ~21 kg CO₂/year — show how many tree-years we've offset
  const treesEquiv = co2Saved / 21;
  const treesDisplay = treesEquiv < 1
    ? `${Math.round(treesEquiv * 100)}%`
    : treesEquiv.toFixed(1);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Planet Health</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Planet */}
        <View style={styles.planetWrapper}>
          <PlanetSvg score={score} size={220} />
        </View>

        {/* Status badge */}
        <View style={[styles.badge, { backgroundColor: `${status.color}22`, borderColor: status.color }]}>
          <Text style={[styles.badgeScore, { color: status.color }]}>{Math.round(score * 100)}%</Text>
          <Text style={[styles.badgeLabel, { color: status.color }]}>{status.label}</Text>
        </View>

        {/* Recycled vs wasted */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
            <Text style={styles.statValue}>{recycledCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>items recycled</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{wastedCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>needs sorting</Text>
          </View>
        </View>

        <Text style={[styles.message, { color: theme.textSecondary }]}>{status.message}</Text>

        {/* ── Real-world impact ─────────────────────────────────────────────── */}
        {recycledCount > 0 && (
          <>
            <View style={styles.impactHeader}>
              <Text style={[styles.impactTitle, { color: theme.text }]}>🌍 Your Real-World Impact</Text>
              <Text style={[styles.impactSub, { color: theme.textSecondary }]}>
                Estimated from your scan history
              </Text>
            </View>

            <View style={styles.impactRow}>
              <ImpactCard
                value={formatCO2(co2Saved)}
                label="CO₂ saved"
                emoji="💨"
                color="#16a34a"
                sub="vs sending to landfill"
                theme={theme}
              />
              <ImpactCard
                value={treesDisplay}
                label={treesEquiv < 1 ? "of a tree/yr" : "tree years"}
                emoji="🌳"
                color="#0891b2"
                sub="CO₂ absorption equivalent"
                theme={theme}
              />
            </View>
            <View style={styles.impactRow}>
              <ImpactCard
                value={formatWater(waterSaved)}
                label="water protected"
                emoji="💧"
                color="#6366f1"
                sub="pollution & production"
                theme={theme}
              />
              <ImpactCard
                value={`${recycledCount}`}
                label="items diverted"
                emoji="♻️"
                color="#f97316"
                sub="kept out of landfill"
                theme={theme}
              />
            </View>

            <Text style={[styles.impactDisclaimer, { color: theme.textSecondary }]}>
              Estimates based on lifecycle analysis averages. Actual impact varies by region and recycling facility.
            </Text>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 20,
  },
  planetWrapper: { alignItems: "center", justifyContent: "center" },
  badge: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 2,
  },
  badgeScore: { fontSize: 32, fontWeight: "800" },
  badgeLabel: { fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12, width: "100%" },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: "center", gap: 4,
  },
  statValue: { color: "#28a745", fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 12, textAlign: "center" },
  message: { fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 8 },

  // Impact
  impactHeader: { alignItems: "center", gap: 4, width: "100%" },
  impactTitle: { fontSize: 17, fontWeight: "700" },
  impactSub: { fontSize: 12 },
  impactRow: { flexDirection: "row", gap: 12, width: "100%" },
  impactDisclaimer: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 8,
    opacity: 0.7,
  },
});
