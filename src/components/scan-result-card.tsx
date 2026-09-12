import { CategoryChip } from "@/components/category-chip";
import { AppIcon } from "@/components/icon";
import { useTheme } from "@/hooks/use-theme";
import { haptics } from "@/services/haptics";
import { WasteCategory } from "@/services/profile";
import { UpcyclingIdea } from "@/services/upcycling-ai";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

export type ResultTab = "recycle" | "upcycle";

export type CompletedLesson = {
  topic: string;
  xpReward: number;
  pointsReward: number;
};

/** Full detection result rendered by the scanner after a scan completes. */
export type ScanResultData = {
  label: string;
  advice: string;
  category: WasteCategory;
  pointsEarned: number;
  awarded: boolean;
  reason: string;
  upcyclingIdeas: UpcyclingIdea[];
  upcyclingLoading: boolean;
  completedLessons: CompletedLesson[];
};

type ScanResultCardProps = {
  result: ScanResultData;
  tab: ResultTab;
  onTabChange: (tab: ResultTab) => void;
  completedLessonIndex: number;
  onLessonIndexChange: (updater: (index: number) => number) => void;
  onClose: () => void;
};

const ACCENT = "#28a745";
const UPCYCLE = "#8b5cf6";

export function ScanResultCard({
  result,
  tab,
  onTabChange,
  completedLessonIndex,
  onLessonIndexChange,
  onClose,
}: ScanResultCardProps) {
  const theme = useTheme();
  const lesson = result.completedLessons[completedLessonIndex];

  return (
    <Animated.View
      entering={FadeInDown.duration(380).springify().damping(18)}
      style={[styles.card, { backgroundColor: theme.backgroundElement }]}
    >
      {/* ── Header: detected object + close ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Detected object</Text>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {result.label}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={8}
        >
          <AppIcon name="xmark.circle.fill" size={26} tintColor={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Category + points earned ────────────────────────────────────── */}
      <View style={styles.metaRow}>
        <CategoryChip category={result.category} />
        {result.awarded ? (
          <Animated.View
            entering={ZoomIn.delay(160).duration(320).springify().damping(12)}
            style={styles.pointsBadge}
          >
            <AppIcon name="bolt.fill" size={14} tintColor="#1a7f3c" />
            <Text style={styles.pointsBadgeText}>+{result.pointsEarned} pts</Text>
          </Animated.View>
        ) : (
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>
              {result.reason === "duplicate"
                ? "Already scanned"
                : "No points"}
            </Text>
          </View>
        )}
      </View>

      {/* ── Recycle / Upcycle tabs ──────────────────────────────────────── */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "recycle" && styles.tabActiveRecycle]}
          onPress={() => {
            if (tab !== "recycle") haptics.selection();
            onTabChange("recycle");
          }}
        >
          <Text style={[styles.tabText, tab === "recycle" && styles.tabTextActive]}>
            Recycle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "upcycle" && styles.tabActiveUpcycle]}
          onPress={() => {
            if (tab !== "upcycle") haptics.selection();
            onTabChange("upcycle");
          }}
        >
          <Text style={[styles.tabText, tab === "upcycle" && styles.tabTextActive]}>
            Upcycle
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      <View style={styles.content}>
        {tab === "recycle" ? (
          <View style={styles.adviceRow}>
            <Text style={styles.adviceIcon}>🗑️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.adviceLabel, { color: theme.textSecondary }]}>
                How to dispose
              </Text>
              <Text style={[styles.adviceText, { color: theme.text }]}>
                {result.advice}
              </Text>
            </View>
          </View>
        ) : result.upcyclingLoading ? (
          <View style={styles.upcycleLoading}>
            <ActivityIndicator color={UPCYCLE} />
            <Text style={styles.upcycleLoadingText}>Generating ideas…</Text>
          </View>
        ) : result.upcyclingIdeas.length === 0 ? (
          <Text style={[styles.adviceText, { color: theme.textSecondary }]}>
            No upcycling ideas available yet.
          </Text>
        ) : (
          result.upcyclingIdeas.map((idea, index) => (
            <View key={`${idea.title}-${index}`} style={styles.ideaRow}>
              <Text style={[styles.ideaBullet, { color: UPCYCLE }]}>✦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ideaTitle, { color: theme.text }]}>
                  {idea.title}
                </Text>
                {!!idea.description && (
                  <Text style={[styles.ideaDesc, { color: theme.textSecondary }]}>
                    {idea.description}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* ── Completed lesson(s) ─────────────────────────────────────────── */}
      {lesson ? (
        <View style={styles.lessonBadge}>
          <Text style={styles.lessonBadgeTitle}>
            🎓 Lesson Complete
            {result.completedLessons.length > 1
              ? ` ${completedLessonIndex + 1}/${result.completedLessons.length}`
              : ""}
          </Text>
          <Text style={styles.lessonBadgeName}>{lesson.topic}</Text>
          <Text style={styles.lessonBadgeReward}>
            +{lesson.xpReward} XP / +{lesson.pointsReward} pts
          </Text>
          {result.completedLessons.length > 1 ? (
            <View style={styles.lessonPager}>
              <TouchableOpacity
                style={styles.lessonPagerButton}
                onPress={() =>
                  onLessonIndexChange((index) =>
                    index === 0 ? result.completedLessons.length - 1 : index - 1,
                  )
                }
              >
                <Text style={styles.lessonPagerText}>Prev</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.lessonPagerButton}
                onPress={() =>
                  onLessonIndexChange(
                    (index) => (index + 1) % result.completedLessons.length,
                  )
                }
              >
                <Text style={styles.lessonPagerText}>Next</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  headerText: { flex: 1, gap: 2 },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  closeButton: { marginTop: -2 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e8f8ef",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pointsBadgeText: { color: "#1a7f3c", fontWeight: "800", fontSize: 14 },
  infoBadge: {
    backgroundColor: "rgba(120,120,128,0.16)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  infoBadgeText: { color: "#8e8e93", fontWeight: "600", fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(120,120,128,0.12)",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActiveRecycle: { backgroundColor: ACCENT },
  tabActiveUpcycle: { backgroundColor: UPCYCLE },
  tabText: { fontSize: 15, fontWeight: "700", color: "#8e8e93" },
  tabTextActive: { color: "#fff" },
  content: { minHeight: 64 },
  adviceRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  adviceIcon: { fontSize: 22 },
  adviceLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  adviceText: { fontSize: 16, lineHeight: 23, fontWeight: "500" },
  upcycleLoading: { alignItems: "center", paddingVertical: 20, gap: 8 },
  upcycleLoadingText: { color: UPCYCLE, fontSize: 14, fontWeight: "600" },
  ideaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  ideaBullet: { fontSize: 15, fontWeight: "800", marginTop: 1 },
  ideaTitle: { fontSize: 15, fontWeight: "700" },
  ideaDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  lessonBadge: {
    backgroundColor: "#e8f8ef",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#28a74533",
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 3,
  },
  lessonBadgeTitle: { fontSize: 15, fontWeight: "800", color: "#28a745" },
  lessonBadgeName: { fontSize: 14, color: "#1a7f3c", textAlign: "center" },
  lessonBadgeReward: { fontSize: 13, fontWeight: "700", color: "#1a7f3c" },
  lessonPager: { flexDirection: "row", gap: 8, marginTop: 8 },
  lessonPagerButton: {
    backgroundColor: "#28a745",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  lessonPagerText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
