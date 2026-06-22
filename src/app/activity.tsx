import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import {
  PERFECT_SCORE_BONUS,
  POINTS_PER_CORRECT,
  QUESTIONS_PER_QUIZ,
} from "@/services/quiz";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ActivityScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { schoolRole } = useProfile();
  const isTeacher = schoolRole === "teacher";
  const isStudent = schoolRole === "student";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { marginLeft: 16, color: theme.text }]}>Activity</Text>
      </View>
      <ScrollView style={styles.scrollView}>

        {/* ── Quiz card ──────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.quizCard} onPress={() => router.push("/quiz")} activeOpacity={0.85}>
          {/* Decorative background circles */}
          <View style={styles.quizCardCircle1} />
          <View style={styles.quizCardCircle2} />

          <View style={styles.quizCardContent}>
            <View>
              <Text style={styles.quizCardTitle}>Eco Quiz</Text>
              <Text style={styles.quizCardSubtitle}>Test your recycling knowledge</Text>
              <View style={styles.quizCardBadge}>
                <Text style={styles.quizCardBadgeText}>+{QUESTIONS_PER_QUIZ * POINTS_PER_CORRECT + PERFECT_SCORE_BONUS} Eco Points</Text>
              </View>
            </View>
            <View style={styles.quizCardIconWrap}>
              <AppIcon name="leaf.fill" size={36} tintColor="rgba(255,255,255,0.9)" />
              <View style={styles.quizCardArrow}>
                <AppIcon name="arrow.right" size={14} tintColor="#16a34a" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Guide card ────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.guideCard} onPress={() => router.push("/guide")} activeOpacity={0.85}>
          <View style={styles.guideCardCircle1} />
          <View style={styles.guideCardCircle2} />
          <View style={styles.quizCardContent}>
            <View>
              <Text style={styles.guideCardTitle}>Recycling Guide</Text>
              <Text style={styles.quizCardSubtitle}>14 materials, dos & don&apos;ts</Text>
              <View style={styles.quizCardBadge}>
                <Text style={styles.quizCardBadgeText}>Free reference</Text>
              </View>
            </View>
            <View style={styles.quizCardIconWrap}>
              <AppIcon name="book.fill" size={36} tintColor="rgba(255,255,255,0.9)" />
              <View style={[styles.quizCardArrow, { backgroundColor: "#fff" }]}>
                <AppIcon name="arrow.right" size={14} tintColor="#0891b2" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Lessons (school only) ──────────────────────────────────────────── */}
        {(isTeacher || isStudent) && (
          <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => router.push(isTeacher ? "/lessons" : "/student-lessons")}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconContainer, { backgroundColor: "#28a745" }]}>
                  <AppIcon name="book.fill" size={20} tintColor="#fff" />
                </View>
                <View>
                  <Text style={[styles.rowText, { color: theme.text }]}>Lessons</Text>
                  <Text style={styles.rowSubtitle}>
                    {isTeacher ? "Create and assign tasks" : "Browse and complete tasks"}
                  </Text>
                </View>
              </View>
              <AppIcon name="chevron.right" size={20} tintColor="#8e8e93" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Leaderboard & Achievements ─────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/leaderboard")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#ff9500" }]}>
                <AppIcon name="trophy.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>Leaderboard</Text>
            </View>
            <AppIcon name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={() => router.push("/achievements")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#34c759" }]}>
                <AppIcon name="star.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>Achievements</Text>
            </View>
            <AppIcon name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { paddingHorizontal: 16, paddingTop: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  section: { borderRadius: 10, marginBottom: 24, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconContainer: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  rowText: { fontSize: 17 },
  rowSubtitle: { color: "#8e8e93", fontSize: 12, marginTop: 2 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: "#38383a", marginLeft: 16 },

  // ── Quiz card ──────────────────────────────────────────────────────────────
  quizCard: {
    backgroundColor: "#16a34a",
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    minHeight: 130,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  quizCardCircle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#0891b2",
    opacity: 0.3,
    top: -60,
    right: -40,
  },
  quizCardCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    opacity: 0.06,
    bottom: -30,
    left: 20,
  },
  quizCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  quizCardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  quizCardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  quizCardBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  quizCardBadgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  quizCardIconWrap: { alignItems: "center", gap: 10 },
  quizCardArrow: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Guide card ────────────────────────────────────────────────────────────
  guideCard: {
    backgroundColor: "#0891b2",
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    minHeight: 120,
    shadowColor: "#0891b2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  guideCardCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#16a34a",
    opacity: 0.25,
    top: -55,
    right: -35,
  },
  guideCardCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    opacity: 0.06,
    bottom: -20,
    left: 30,
  },
  guideCardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
});
