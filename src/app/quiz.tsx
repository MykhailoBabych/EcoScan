import { ScreenHeader } from "@/components/screen-header";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import {
  PERFECT_SCORE_BONUS,
  POINTS_PER_CORRECT,
  QUESTIONS_PER_QUIZ,
  QuizQuestion,
  getRandomQuestions,
} from "@/services/quiz";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import { haptics } from "@/services/haptics";
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

export default function QuizScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { awardPoints } = useProfile();

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizPointsTotal, setQuizPointsTotal] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const startQuiz = () => {
    setQuizQuestions(getRandomQuestions(QUESTIONS_PER_QUIZ));
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
  };

  // Start a fresh quiz when the screen first mounts.
  useEffect(() => {
    startQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    const isCorrect = index === quizQuestions[quizIndex].correctIndex;
    if (isCorrect) {
      haptics.success();
      setQuizCorrect((c) => c + 1);
      setQuizPointsTotal((p) => p + POINTS_PER_CORRECT);
    } else {
      haptics.warning();
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
      // Celebrate the result: a richer pattern for a perfect run.
      if (isPerfect) haptics.levelUp();
      else haptics.success();
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

  // ── Results screen ────────────────────────────────────────────────────────
  if (quizFinished) {
    const isPerfect = quizCorrect === QUESTIONS_PER_QUIZ;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Eco Quiz" backLabel="Activity" onBack={() => router.back()} />
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

          <TouchableOpacity style={styles.doneButton} onPress={() => router.back()}>
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

  // First render before the start-quiz effect populates questions.
  if (!question) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScreenHeader title="Eco Quiz" backLabel="Activity" onBack={() => router.back()} />
      </SafeAreaView>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Eco Quiz" backLabel="Activity" onBack={() => router.back()} />

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
                  <AppIcon name="checkmark.circle.fill" size={20} tintColor="#16a34a" />
                )}
                {selectedAnswer !== null && i === selectedAnswer && i !== question.correctIndex && (
                  <AppIcon name="xmark.circle.fill" size={20} tintColor="#ef4444" />
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

const styles = StyleSheet.create({
  container: { flex: 1 },

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
});
