import { useTheme } from "@/hooks/use-theme";
import {
  Lesson,
  StudentLesson,
  StudentLessonsService,
} from "@/services/lessons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Available lesson card (browse) ──────────────────────────────────────────

function AvailableCard({
  lesson,
  isAccepted,
  isCompleted,
  onAccept,
  theme,
}: {
  lesson: Lesson;
  isAccepted: boolean;
  isCompleted: boolean;
  onAccept: (id: string) => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={styles.cardHeader}>
        <View style={styles.lessonIcon}>
          <SymbolView name="book.fill" size={16} tintColor="#fff" />
        </View>
        <Text
          style={[styles.cardTopic, { color: theme.text }]}
          numberOfLines={1}
        >
          {lesson.topic}
        </Text>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ Done</Text>
          </View>
        ) : isAccepted ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        ) : null}
      </View>

      <Text
        style={[styles.cardAssignment, { color: theme.textSecondary }]}
        numberOfLines={3}
      >
        {lesson.assignment}
      </Text>

      <View style={styles.scanTargetBadge}>
        <Text style={styles.scanTargetText}>🔍 Scan: {lesson.scanTarget}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardBadgeText}>⚡ {lesson.xpReward} XP</Text>
        </View>
        <View style={[styles.rewardBadge, styles.pointsBadge]}>
          <Text style={[styles.rewardBadgeText, styles.pointsBadgeText]}>
            🌿 {lesson.pointsReward} pts
          </Text>
        </View>

        {!isAccepted && !isCompleted && (
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => onAccept(lesson.id)}
          >
            <Text style={styles.acceptBtnText}>Accept</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── My lesson card (active/completed) ───────────────────────────────────────

function MyLessonCard({
  lesson,
  theme,
}: {
  lesson: StudentLesson;
  theme: ReturnType<typeof useTheme>;
}) {
  const isCompleted = lesson.status === "completed";
  const completedDate = lesson.completedAt
    ? new Date(lesson.completedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.backgroundElement },
        isCompleted && styles.cardCompleted,
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.lessonIcon,
            isCompleted && { backgroundColor: "#30d158" },
          ]}
        >
          <SymbolView
            name={isCompleted ? "checkmark.seal.fill" : "book.fill"}
            size={16}
            tintColor="#fff"
          />
        </View>
        <Text
          style={[styles.cardTopic, { color: theme.text }]}
          numberOfLines={1}
        >
          {lesson.topic}
        </Text>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ Done</Text>
          </View>
        ) : (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>In Progress</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.cardAssignment, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {lesson.assignment}
      </Text>

      {!isCompleted && (
        <View style={styles.scanTargetBadge}>
          <Text style={styles.scanTargetText}>
            🔍 Scan: {lesson.scanTarget}
          </Text>
        </View>
      )}

      <View style={styles.cardFooter}>
        {isCompleted ? (
          <>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeText}>
                ⚡ +{lesson.xpReward} XP earned
              </Text>
            </View>
            <View style={[styles.rewardBadge, styles.pointsBadge]}>
              <Text style={[styles.rewardBadgeText, styles.pointsBadgeText]}>
                🌿 +{lesson.pointsReward} pts earned
              </Text>
            </View>
            {completedDate && (
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                {completedDate}
              </Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeText}>
                ⚡ {lesson.xpReward} XP
              </Text>
            </View>
            <View style={[styles.rewardBadge, styles.pointsBadge]}>
              <Text style={[styles.rewardBadgeText, styles.pointsBadgeText]}>
                🌿 {lesson.pointsReward} pts
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function StudentLessonsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [tab, setTab] = useState<"available" | "mine">("mine");
  const [available, setAvailable] = useState<Lesson[]>([]);
  const [mine, setMine] = useState<StudentLesson[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [avail, my] = await Promise.all([
      StudentLessonsService.loadAvailable(),
      StudentLessonsService.loadMine(),
    ]);
    setAvailable(avail);
    setMine(my);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const acceptedIds = new Set(mine.map((l) => l.lessonId));
  const completedIds = new Set(
    mine.filter((l) => l.status === "completed").map((l) => l.lessonId),
  );

  const handleAccept = async (lessonId: string) => {
    await StudentLessonsService.accept(lessonId);
    Alert.alert(
      "Lesson Accepted! 📚",
      "Go to the Scanner tab and scan the required object to complete it.",
    );
    await load();
    setTab("mine");
  };

  const active = mine.filter((l) => l.status === "active");
  const completed = mine.filter((l) => l.status === "completed");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={24} tintColor="#0a84ff" />
          <Text style={styles.backText}>Activity</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Lessons</Text>
        <View style={{ flex: 1 }} />
      </View>

      {/* Tab bar */}
      <View
        style={[styles.tabBar, { backgroundColor: theme.backgroundElement }]}
      >
        <TouchableOpacity
          style={[styles.tab, tab === "mine" && styles.tabActive]}
          onPress={() => setTab("mine")}
        >
          <Text
            style={[styles.tabText, tab === "mine" && styles.tabTextActive]}
          >
            My Lessons {mine.length > 0 ? `(${mine.length})` : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === "available" && styles.tabActive]}
          onPress={() => setTab("available")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "available" && styles.tabTextActive,
            ]}
          >
            Browse
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#0a84ff" />
        </View>
      ) : tab === "mine" ? (
        // ── My Lessons ─────────────────────────────────────────────────────────
        mine.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No lessons yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              Browse available lessons and accept one to get started
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => setTab("available")}
            >
              <Text style={styles.browseBtnText}>Browse Lessons</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {active.length > 0 && (
              <>
                <Text
                  style={[styles.sectionHeader, { color: theme.textSecondary }]}
                >
                  IN PROGRESS
                </Text>
                {active.map((l) => (
                  <MyLessonCard key={l.id} lesson={l} theme={theme} />
                ))}
              </>
            )}
            {completed.length > 0 && (
              <>
                <Text
                  style={[styles.sectionHeader, { color: theme.textSecondary }]}
                >
                  COMPLETED ✓
                </Text>
                {completed.map((l) => (
                  <MyLessonCard key={l.id} lesson={l} theme={theme} />
                ))}
              </>
            )}
            <View style={{ height: 24 }} />
          </ScrollView>
        )
      ) : // ── Browse ─────────────────────────────────────────────────────────────
      available.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏫</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No lessons published
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Teachers haven't published any lessons yet
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {available.map((lesson) => (
            <AvailableCard
              key={lesson.id}
              lesson={lesson}
              isAccepted={acceptedIds.has(lesson.id)}
              isCompleted={completedIds.has(lesson.id)}
              onAccept={handleAccept}
              theme={theme}
            />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: { flexDirection: "row", alignItems: "center", flex: 1 },
  backText: { color: "#0a84ff", fontSize: 17, marginLeft: 4 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#28a745" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#8e8e93" },
  tabTextActive: { color: "#fff" },

  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 15, textAlign: "center" },
  browseBtn: {
    marginTop: 8,
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  browseBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  card: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardCompleted: { opacity: 0.8 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  lessonIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#28a745",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTopic: { fontSize: 16, fontWeight: "700", flex: 1 },
  completedBadge: {
    backgroundColor: "#30d15822",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedBadgeText: { fontSize: 12, fontWeight: "700", color: "#30d158" },
  activeBadge: {
    backgroundColor: "#ff9f0a22",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 12, fontWeight: "700", color: "#ff9f0a" },
  cardAssignment: { fontSize: 14, lineHeight: 20 },
  scanTargetBadge: {
    backgroundColor: "#0a84ff18",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  scanTargetText: { fontSize: 13, color: "#0a84ff", fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  rewardBadge: {
    backgroundColor: "#ff9f0a22",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  rewardBadgeText: { fontSize: 13, fontWeight: "600", color: "#ff9f0a" },
  pointsBadge: { backgroundColor: "#30d15822" },
  pointsBadgeText: { color: "#30d158" },
  acceptBtn: {
    marginLeft: "auto",
    backgroundColor: "#28a745",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  acceptBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  dateText: { fontSize: 12, marginLeft: "auto" },
});
