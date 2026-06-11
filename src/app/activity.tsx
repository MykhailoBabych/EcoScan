import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { ACHIEVEMENTS } from "@/services/achievements";
import { GUIDE, GuideEntry } from "@/services/guide";
import {
  POINTS_PER_CORRECT,
  PERFECT_SCORE_BONUS,
  QUESTIONS_PER_QUIZ,
  QuizQuestion,
  getRandomQuestions,
} from "@/services/quiz";
import { useNavigation, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Leaderboard mock data ────────────────────────────────────────────────────

const LEADERBOARD = [
  { rank: 1, name: "EcoWarrior99", score: 1250 },
  { rank: 2, name: "GreenEarth", score: 1100 },
  { rank: 3, name: "PlanetSaver", score: 980 },
  { rank: 4, name: "TreeHugger", score: 850 },
  { rank: 5, name: "RecycleKing", score: 720 },
  { rank: 6, name: "OceanProtector", score: 690 },
  { rank: 7, name: "NatureLover", score: 630 },
  { rank: 8, name: "EcoFriendly", score: 580 },
  { rank: 9, name: "ZeroWaste", score: 510 },
  { rank: 10, name: "GreenThumb", score: 450 },
];

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ActivityScreen() {
  const [view, setView] = useState<"main" | "leaderboard" | "achievements" | "quiz" | "guide" | "guide-detail">("main");
  const [selectedGuide, setSelectedGuide] = useState<GuideEntry | null>(null);
  const navigation = useNavigation();

  // Tap the Activity tab from anywhere → go back to main
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress" as any, () => {
      setView("main");
    });
    return unsubscribe;
  }, [navigation]);
  const theme = useTheme();
  const router = useRouter();
  const { schoolRole, totalScans, awardPoints } = useProfile();
  const isTeacher = schoolRole === "teacher";
  const isStudent = schoolRole === "student";

  // ── Quiz state ──────────────────────────────────────────────────────────────
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizPointsTotal, setQuizPointsTotal] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const startQuiz = () => {
    const questions = getRandomQuestions(QUESTIONS_PER_QUIZ);
    setQuizQuestions(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setQuizCorrect(0);
    setQuizPointsTotal(0);
    setQuizFinished(false);
    Animated.timing(progressAnim, {
      toValue: 1 / QUESTIONS_PER_QUIZ,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setView("quiz");
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    const isCorrect = index === quizQuestions[quizIndex].correctIndex;
    if (isCorrect) {
      setQuizCorrect((c) => c + 1);
      setQuizPointsTotal((p) => p + POINTS_PER_CORRECT);
    }
  };

  const handleNext = async () => {
    const nextIndex = quizIndex + 1;
    if (nextIndex >= QUESTIONS_PER_QUIZ) {
      const isPerfect = quizCorrect === QUESTIONS_PER_QUIZ;
      const finalPoints = quizPointsTotal + (isPerfect ? PERFECT_SCORE_BONUS : 0);
      if (finalPoints > 0) await awardPoints(finalPoints);
      setQuizPointsTotal(finalPoints);
      setQuizFinished(true);
    } else {
      setQuizIndex(nextIndex);
      setSelectedAnswer(null);
      setShowExplanation(false);
      Animated.timing(progressAnim, {
        toValue: (nextIndex + 1) / QUESTIONS_PER_QUIZ,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // ── Header helper ───────────────────────────────────────────────────────────
  const renderHeader = (title: string, backView: "main" | "guide", backLabel: string) => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => setView(backView)}>
        <SymbolView name="chevron.left" size={24} tintColor="#0a84ff" />
        <Text style={styles.headerBackText}>{backLabel}</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  // ── Quiz view ───────────────────────────────────────────────────────────────
  if (view === "quiz") {
    if (quizFinished) {
      const isPerfect = quizCorrect === QUESTIONS_PER_QUIZ;
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          {renderHeader("Eco Quiz", "main", "Activity")}
          <View style={styles.resultsContainer}>
            <Text style={styles.resultEmoji}>{isPerfect ? "🏆" : quizCorrect >= 3 ? "🌿" : "📚"}</Text>
            <Text style={[styles.resultTitle, { color: theme.text }]}>
              {isPerfect ? "Perfect Score!" : quizCorrect >= 3 ? "Great job!" : "Keep learning!"}
            </Text>
            <Text style={[styles.resultScore, { color: theme.text }]}>
              {quizCorrect} / {QUESTIONS_PER_QUIZ}
            </Text>
            <Text style={[styles.resultScoreLabel, { color: theme.textSecondary }]}>correct answers</Text>

            <View style={styles.resultPointsBadge}>
              <Text style={styles.resultPointsText}>+{quizPointsTotal} Eco Points 🌿</Text>
              {isPerfect && (
                <Text style={styles.resultBonusText}>Includes +{PERFECT_SCORE_BONUS} perfect score bonus!</Text>
              )}
            </View>

            <TouchableOpacity style={styles.doneButton} onPress={() => setView("main")}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryButton} onPress={startQuiz}>
              <Text style={[styles.retryButtonText, { color: theme.textSecondary }]}>Play Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    const question = quizQuestions[quizIndex];
    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "100%"],
    });

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader("Eco Quiz", "main", "Activity")}

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={[styles.questionCounter, { color: theme.textSecondary }]}>
          Question {quizIndex + 1} of {QUESTIONS_PER_QUIZ}
        </Text>

        <ScrollView style={styles.quizScroll} contentContainerStyle={styles.quizContent}>
          <Text style={[styles.questionText, { color: theme.text }]}>{question.question}</Text>

          {/* Options */}
          {question.options.map((option, i) => {
            let bg: string = theme.backgroundElement;
            let border = "transparent";
            if (selectedAnswer !== null) {
              if (i === question.correctIndex) { bg = "#16a34a22"; border = "#16a34a"; }
              else if (i === selectedAnswer) { bg = "#ef444422"; border = "#ef4444"; }
            }
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optionButton, { backgroundColor: bg, borderColor: border }]}
                onPress={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.7}
              >
                <View style={styles.optionRow}>
                  <View style={[styles.optionIndex, { backgroundColor: selectedAnswer === null ? theme.backgroundElement : "transparent" }]}>
                    <Text style={[styles.optionIndexText, { color: theme.textSecondary }]}>
                      {["A", "B", "C", "D"][i]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
                  {selectedAnswer !== null && i === question.correctIndex && (
                    <SymbolView name="checkmark.circle.fill" size={20} tintColor="#16a34a" />
                  )}
                  {selectedAnswer !== null && i === selectedAnswer && i !== question.correctIndex && (
                    <SymbolView name="xmark.circle.fill" size={20} tintColor="#ef4444" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Explanation */}
          {showExplanation && (
            <View style={[styles.explanationBox, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.explanationLabel}>
                {selectedAnswer === question.correctIndex ? "✅ Correct!" : "❌ Not quite"}
              </Text>
              <Text style={[styles.explanationText, { color: theme.textSecondary }]}>
                {question.explanation}
              </Text>
              {selectedAnswer === question.correctIndex && (
                <Text style={styles.pointsEarned}>+{POINTS_PER_CORRECT} Eco Points</Text>
              )}
            </View>
          )}

          {showExplanation && (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {quizIndex + 1 < QUESTIONS_PER_QUIZ ? "Next Question →" : "See Results"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Guide list view ─────────────────────────────────────────────────────────
  if (view === "guide") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader("Recycling Guide", "main", "Activity")}
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={[styles.guideIntro, { color: theme.textSecondary }]}>
            Learn how to handle 14 types of waste — what to do, what not to do, and why it matters.
          </Text>
          {GUIDE.map((entry) => (
            <TouchableOpacity
              key={entry.category}
              style={[styles.guideListCard, { backgroundColor: theme.backgroundElement }]}
              onPress={() => { setSelectedGuide(entry); setView("guide-detail"); }}
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
              <SymbolView name="chevron.right" size={16} tintColor="#8e8e93" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Guide detail view ────────────────────────────────────────────────────────
  if (view === "guide-detail" && selectedGuide) {
    const entry = selectedGuide;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader(
          entry.category.charAt(0).toUpperCase() + entry.category.slice(1),
          "guide" as "main",
          "Guide"
        )}
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

  // ── Leaderboard view ────────────────────────────────────────────────────────
  if (view === "leaderboard") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader("Leaderboard", "main", "Activity")}
        <ScrollView style={styles.scrollView}>
          <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
            {LEADERBOARD.map((user, index) => (
              <View key={user.rank}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={[styles.rankText, { color: theme.text }]}>#{user.rank}</Text>
                    <Text style={[styles.rowText, { color: theme.text, marginLeft: 16 }]}>{user.name}</Text>
                  </View>
                  <Text style={[styles.scoreText, { color: "#0a84ff" }]}>{user.score}</Text>
                </View>
                {index < LEADERBOARD.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Achievements view ───────────────────────────────────────────────────────
  if (view === "achievements") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader("Achievements", "main", "Activity")}
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
                    <SymbolView name={achievement.icon} size={32} tintColor="#fff" />
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

  // ── Main view ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { marginLeft: 16, color: theme.text }]}>Activity</Text>
      </View>
      <ScrollView style={styles.scrollView}>

        {/* ── Quiz card ──────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.quizCard} onPress={startQuiz} activeOpacity={0.85}>
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
              <SymbolView name="leaf.fill" size={36} tintColor="rgba(255,255,255,0.9)" />
              <View style={styles.quizCardArrow}>
                <SymbolView name="arrow.right" size={14} tintColor="#16a34a" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Guide card ────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.guideCard} onPress={() => setView("guide")} activeOpacity={0.85}>
          <View style={styles.guideCardCircle1} />
          <View style={styles.guideCardCircle2} />
          <View style={styles.quizCardContent}>
            <View>
              <Text style={styles.guizCardTitle}>Recycling Guide</Text>
              <Text style={styles.quizCardSubtitle}>14 materials, dos & don'ts</Text>
              <View style={styles.quizCardBadge}>
                <Text style={styles.quizCardBadgeText}>Free reference</Text>
              </View>
            </View>
            <View style={styles.quizCardIconWrap}>
              <SymbolView name="book.fill" size={36} tintColor="rgba(255,255,255,0.9)" />
              <View style={[styles.quizCardArrow, { backgroundColor: "#fff" }]}>
                <SymbolView name="arrow.right" size={14} tintColor="#0891b2" />
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
                  <SymbolView name="book.fill" size={20} tintColor="#fff" />
                </View>
                <View>
                  <Text style={[styles.rowText, { color: theme.text }]}>Lessons</Text>
                  <Text style={styles.rowSubtitle}>
                    {isTeacher ? "Create and assign tasks" : "Browse and complete tasks"}
                  </Text>
                </View>
              </View>
              <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Leaderboard & Achievements ─────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => setView("leaderboard")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#ff9500" }]}>
                <SymbolView name="trophy.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>Leaderboard</Text>
            </View>
            <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={() => setView("achievements")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: "#34c759" }]}>
                <SymbolView name="star.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>Achievements</Text>
            </View>
            <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
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
  backButton: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerBackText: { color: "#0a84ff", fontSize: 17, marginLeft: 4 },
  headerRight: { flex: 1 },

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
  rankText: { fontSize: 17, fontWeight: "600", width: 30 },
  scoreText: { fontSize: 17, fontWeight: "bold" },

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

  // ── Quiz screen ────────────────────────────────────────────────────────────
  progressTrack: {
    height: 4,
    backgroundColor: "#ffffff18",
    marginHorizontal: 16,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16a34a",
    borderRadius: 2,
  },
  questionCounter: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  quizScroll: { flex: 1 },
  quizContent: { padding: 16, gap: 12 },
  questionText: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 8,
  },
  optionButton: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionIndex: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  optionIndexText: { fontSize: 13, fontWeight: "700" },
  optionText: { flex: 1, fontSize: 16, lineHeight: 22 },

  explanationBox: {
    borderRadius: 14,
    padding: 16,
    gap: 6,
    marginTop: 4,
  },
  explanationLabel: { fontSize: 15, fontWeight: "700" },
  explanationText: { fontSize: 14, lineHeight: 20 },
  pointsEarned: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 4,
  },
  nextButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  nextButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },

  // ── Results screen ─────────────────────────────────────────────────────────
  resultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  resultEmoji: { fontSize: 64 },
  resultTitle: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  resultScore: { fontSize: 52, fontWeight: "800", lineHeight: 56 },
  resultScoreLabel: { fontSize: 15, marginTop: -4 },
  resultPointsBadge: {
    backgroundColor: "#16a34a22",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  resultPointsText: { color: "#16a34a", fontWeight: "700", fontSize: 18 },
  resultBonusText: { color: "#16a34a", fontSize: 13, opacity: 0.8 },
  doneButton: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  doneButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  retryButton: { padding: 12 },
  retryButtonText: { fontSize: 15 },

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
  guizCardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },

  // ── Guide list ─────────────────────────────────────────────────────────────
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

  // ── Guide detail ───────────────────────────────────────────────────────────
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

  // ── Achievements ───────────────────────────────────────────────────────────
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
