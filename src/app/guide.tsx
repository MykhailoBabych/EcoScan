import { ScreenHeader } from "@/components/screen-header";
import { useTheme } from "@/hooks/use-theme";
import { GUIDE, GuideEntry } from "@/services/guide";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GuideScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<GuideEntry | null>(null);

  // ── Detail view (one material) ──────────────────────────────────────────────
  if (selected) {
    const entry = selected;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScreenHeader
          title={entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
          backLabel="Guide"
          onBack={() => setSelected(null)}
        />
        <ScrollView key={entry.category} style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero */}
          <View style={[styles.guideHero, { backgroundColor: entry.color + "18" }]}>
            <Text style={styles.guideHeroEmoji}>{entry.emoji}</Text>
            <View style={[
              styles.guideHeroBadge,
              { backgroundColor: entry.recyclable ? "#16a34a22" : "#ef444422", borderColor: entry.recyclable ? "#16a34a" : "#ef4444" }
            ]}>
              <Text style={[styles.guideHeroBadgeText, { color: entry.recyclable ? "#16a34a" : "#ef4444" }]}>
                {entry.recyclable ? "✅ Recyclable" : "⚠️ Special disposal"}
              </Text>
            </View>
          </View>

          {/* Overview */}
          <Text style={[styles.guideOverview, { color: theme.text }]}>{entry.overview}</Text>

          {/* Preparation */}
          <View style={[styles.guideSection, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.guideSectionTitle, { color: theme.text }]}>✅ How to prepare</Text>
            {entry.preparationSteps.map((step, i) => (
              <View key={i} style={styles.guideBulletRow}>
                <Text style={[styles.guideBulletNum, { color: entry.color }]}>{i + 1}</Text>
                <Text style={[styles.guideBulletText, { color: theme.text }]}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Common mistakes */}
          <View style={[styles.guideSection, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.guideSectionTitle, { color: theme.text }]}>❌ Common mistakes</Text>
            {entry.commonMistakes.map((mistake, i) => (
              <View key={i} style={styles.guideBulletRow}>
                <Text style={styles.guideMistakeDot}>•</Text>
                <Text style={[styles.guideBulletText, { color: theme.text }]}>{mistake}</Text>
              </View>
            ))}
          </View>

          {/* Where does it go */}
          <View style={[styles.guideSection, { backgroundColor: entry.color + "15" }]}>
            <Text style={[styles.guideSectionTitle, { color: theme.text }]}>📍 Where it goes</Text>
            <Text style={[styles.guideAccepted, { color: entry.color }]}>{entry.acceptedIn}</Text>
          </View>

          {/* Fun fact */}
          <View style={[styles.guideFactBox, { borderLeftColor: entry.color }]}>
            <Text style={[styles.guideFactLabel, { color: entry.color }]}>💡 Did you know?</Text>
            <Text style={[styles.guideFactText, { color: theme.textSecondary }]}>{entry.funFact}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Recycling Guide" backLabel="Activity" onBack={() => router.back()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={[styles.guideIntro, { color: theme.textSecondary }]}>
          Learn how to handle 14 types of waste — what to do, what not to do, and why it matters.
        </Text>
        {GUIDE.map((entry) => (
          <TouchableOpacity
            key={entry.category}
            style={[styles.guideListCard, { backgroundColor: theme.backgroundElement }]}
            onPress={() => setSelected(entry)}
            activeOpacity={0.75}
          >
            <View style={[styles.guideListEmoji, { backgroundColor: entry.color + "22" }]}>
              <Text style={styles.guideListEmojiText}>{entry.emoji}</Text>
            </View>
            <View style={styles.guideListInfo}>
              <Text style={[styles.guideListTitle, { color: theme.text }]}>
                {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
              </Text>
              <Text style={[styles.guideListSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {entry.overview.slice(0, 60)}…
              </Text>
            </View>
            <View style={[styles.guideRecycleBadge, { backgroundColor: entry.recyclable ? "#16a34a22" : "#ef444422" }]}>
              <Text style={[styles.guideRecycleText, { color: entry.recyclable ? "#16a34a" : "#ef4444" }]}>
                {entry.recyclable ? "♻️" : "⚠️"}
              </Text>
            </View>
            <AppIcon name="chevron.right" size={16} tintColor="#8e8e93" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: 16, paddingTop: 8 },

  // List
  guideIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  guideListCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  guideListEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  guideListEmojiText: { fontSize: 24 },
  guideListInfo: { flex: 1 },
  guideListTitle: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  guideListSub: { fontSize: 13 },
  guideRecycleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  guideRecycleText: { fontSize: 16 },

  // Detail
  guideHero: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  guideHeroEmoji: { fontSize: 64 },
  guideHeroBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  guideHeroBadgeText: { fontSize: 14, fontWeight: "700" },
  guideOverview: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 16,
  },
  guideSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  guideSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  guideBulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  guideBulletNum: {
    fontSize: 14,
    fontWeight: "800",
    width: 18,
    marginTop: 1,
  },
  guideMistakeDot: {
    fontSize: 16,
    color: "#ef4444",
    width: 18,
    marginTop: 1,
  },
  guideBulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  guideAccepted: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  guideFactBox: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 4,
    marginBottom: 12,
    gap: 6,
  },
  guideFactLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  guideFactText: {
    fontSize: 14,
    lineHeight: 21,
  },
});
