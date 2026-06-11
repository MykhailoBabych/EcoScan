import { useProfile } from "@/contexts/ProfileContext";
import { StudentLessonsService } from "@/services/lessons";
import { WasteCategory } from "@/services/profile";
import { getUpcyclingIdeas, UpcyclingIdea } from "@/services/upcycling-ai";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type CategoryDef = {
  category: WasteCategory;
  keywords: string[];
  advice: string;
};

const RECYCLING_CATEGORIES: CategoryDef[] = [
  {
    category: "plastic",
    keywords: [
      "bottle",
      "plastic",
      "pet",
      "water bottle",
      "soda",
      "polymer",
      "polypropylene",
      "polyethylene",
    ],
    advice: "Recycle in plastic bin. Remove cap if required.",
  },
  {
    category: "metal",
    keywords: [
      "can",
      "aluminum",
      "tin",
      "beverage can",
      "coca-cola",
      "coke",
      "soda can",
      "metal",
      "steel",
    ],
    advice: "Recycle in metal/cans bin.",
  },
  {
    category: "glass",
    keywords: ["glass", "jar", "wine", "beer bottle", "glassware"],
    advice: "Recycle in glass container.",
  },
  {
    category: "paper",
    keywords: ["paper", "newspaper", "magazine", "book", "receipt", "document"],
    advice: "Recycle in paper bin.",
  },
  {
    category: "cardboard",
    keywords: ["cardboard", "box", "carton", "packaging", "corrugated"],
    advice: "Flatten and recycle in paper/cardboard bin.",
  },
  {
    category: "food",
    keywords: [
      "food",
      "fruit",
      "vegetable",
      "bread",
      "meat",
      "meal",
      "snack",
      "banana",
      "apple",
      "organic",
    ],
    advice: "Compost if possible. Check for local organic waste bins.",
  },
  {
    category: "electronics",
    keywords: [
      "electronic",
      "phone",
      "computer",
      "laptop",
      "battery",
      "wire",
      "cable",
      "device",
      "charger",
    ],
    advice: "Take to an e-waste recycling center.",
  },
];

const IGNORED_WORDS = [
  "color",
  "red",
  "blue",
  "green",
  "pink",
  "yellow",
  "white",
  "black",
  "liquid",
  "material",
  "cylinder",
  "circle",
  "rectangle",
  "shape",
  "object",
];

type EcoAdvice = {
  label: string;
  advice: string;
  category: WasteCategory;
};

const getEcoAdvice = (labels: any[]): EcoAdvice => {
  for (const label of labels) {
    const desc = label.description.toLowerCase();
    for (const cat of RECYCLING_CATEGORIES) {
      if (cat.keywords.some((keyword) => desc.includes(keyword))) {
        return {
          label: label.description,
          advice: cat.advice,
          category: cat.category,
        };
      }
    }
  }

  for (const label of labels) {
    const desc = label.description.toLowerCase();
    if (!IGNORED_WORDS.some((word) => desc.includes(word))) {
      return {
        label: label.description,
        advice:
          "Couldn't classify clearly. Check your local recycling guidelines.",
        category: "unknown",
      };
    }
  }

  return {
    label: labels[0]?.description || "Unknown Object",
    advice: "Item not recognized. When in doubt, throw it out!",
    category: "unknown",
  };
};

type ScanResult = EcoAdvice & {
  pointsEarned: number;
  awarded: boolean;
  reason: string;
  upcyclingIdeas: UpcyclingIdea[];
  upcyclingLoading: boolean;
  completedLessons: {
    topic: string;
    xpReward: number;
    pointsReward: number;
  }[];
};

type ResultTab = "recycle" | "upcycle";

const DEFAULT_BACK_LENS = "Back Camera";

function getPreferredBackLens(lenses: string[]) {
  const normalLens = lenses.find((lens) => lens === DEFAULT_BACK_LENS);
  if (normalLens) return normalLens;

  const wideLens = lenses.find((lens) => {
    const normalized = lens.toLowerCase();
    return (
      normalized.includes("wide") &&
      !normalized.includes("ultra") &&
      !normalized.includes("dual") &&
      !normalized.includes("triple") &&
      !normalized.includes("telephoto")
    );
  });
  if (wideLens) return wideLens;

  return (
    lenses.find((lens) => {
      const normalized = lens.toLowerCase();
      return (
        normalized.includes("back") &&
        !normalized.includes("ultra") &&
        !normalized.includes("telephoto")
      );
    }) ?? lenses[0]
  );
}

function getLensesFromEvent(event: any): string[] {
  return event?.lenses ?? event?.nativeEvent?.lenses ?? [];
}

const ideaToProfileText = (idea: UpcyclingIdea) =>
  idea.description ? `${idea.title}: ${idea.description}` : idea.title;

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedLens, setSelectedLens] = useState<string | undefined>();
  const cameraRef = useRef<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [tab, setTab] = useState<ResultTab>("recycle");
  const [completedLessonIndex, setCompletedLessonIndex] = useState(0);

  const { recordScan, updateScanUpcyclingIdeas, schoolRole, awardPoints } = useProfile();

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.message}>
          We need your permission to access the camera
        </Text>
        <Button onPress={requestPermission} title="Allow Access" />
      </View>
    );
  }

  const takePhotoAndAnalyze = async () => {
    if (!cameraRef.current) return;

    try {
      setAnalyzing(true);
      setResult(null);
      setTab("recycle");
      setCompletedLessonIndex(0);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.5,
      });
      const labels = await analyzeImage(photo.base64);

      if (!labels) return;
      if (labels.length === 0) {
        Alert.alert("No object detected", "Please try again.");
        return;
      }

      const advice = getEcoAdvice(labels);
      const { pointsEarned, scanId, awarded, reason } = await recordScan({
        objectLabel: advice.label,
        category: advice.category,
        recyclingAdvice: advice.advice,
        upcyclingIdeas: [],
      });
      let completedLessons: ScanResult["completedLessons"] = [];

      if (schoolRole === "student") {
        const completed = await StudentLessonsService.tryCompleteAll(
          labels.map((label: any) => label.description),
        );
        if (completed.length > 0) {
          completedLessons = completed.map((lesson) => ({
            topic: lesson.topic,
            xpReward: lesson.xpReward,
            pointsReward: lesson.pointsReward,
          }));
          const reward = completed.reduce(
            (sum, lesson) => sum + lesson.xpReward + lesson.pointsReward,
            0,
          );
          await awardPoints(reward);
        }
      }

      setResult({
        ...advice,
        pointsEarned,
        awarded,
        reason,
        completedLessons,
        upcyclingIdeas: [],
        upcyclingLoading: true,
      });

      getUpcyclingIdeas(advice.label, advice.category)
        .then(async (ideas) => {
          await updateScanUpcyclingIdeas(scanId, ideas.map(ideaToProfileText));
          setResult((prev) =>
            prev
              ? { ...prev, upcyclingIdeas: ideas, upcyclingLoading: false }
              : prev,
          );
        })
        .catch((error) => {
          console.warn("Upcycling ideas failed:", error);
          setResult((prev) =>
            prev ? { ...prev, upcyclingLoading: false } : prev,
          );
        });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAvailableLensesChanged = (event: any) => {
    const lenses = getLensesFromEvent(event);
    if (lenses.length === 0) return;

    const preferredLens = getPreferredBackLens(lenses);
    setSelectedLens((current) =>
      current === preferredLens ? current : preferredLens,
    );
  };

  const handleCameraReady = async () => {
    const lenses = await cameraRef.current?.getAvailableLensesAsync?.();
    if (!Array.isArray(lenses) || lenses.length === 0) return;

    const preferredLens = getPreferredBackLens(lenses);
    setSelectedLens((current) =>
      current === preferredLens ? current : preferredLens,
    );
  };

  const analyzeImage = async (base64: string) => {
    try {
      const response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyArhmioiHCIqN9WsEx_3wyCpyc-ykDto6Q",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: "LABEL_DETECTION", maxResults: 8 }],
              },
            ],
          }),
        },
      );
      const data = await response.json();

      if (data.error) {
        Alert.alert("API Error", data.error.message || "Vision API error.");
        return null;
      }

      return data.responses?.[0]?.labelAnnotations ?? [];
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        selectedLens={selectedLens}
        zoom={0}
        onAvailableLensesChanged={handleAvailableLensesChanged}
        onCameraReady={handleCameraReady}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer} pointerEvents="box-none">
          <TouchableOpacity
            style={[styles.captureButton, analyzing && styles.buttonDisabled]}
            onPress={takePhotoAndAnalyze}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.text}>Scan Object</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>{result.label}</Text>

          {result.awarded ? (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                +{result.pointsEarned} Eco Points
              </Text>
            </View>
          ) : result.reason === "duplicate" ? (
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>
                Already scanned - no points
              </Text>
            </View>
          ) : (
            <View style={styles.infoBadge}>
              <Text style={styles.infoBadgeText}>
                Not recognized - no points
              </Text>
            </View>
          )}

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, tab === "recycle" && styles.tabActive]}
              onPress={() => setTab("recycle")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "recycle" && styles.tabTextActive,
                ]}
              >
                Recycle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                tab === "upcycle" && styles.tabActiveUpcycle,
              ]}
              onPress={() => setTab("upcycle")}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === "upcycle" && styles.tabTextActive,
                ]}
              >
                Upcycle
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {tab === "recycle" ? (
              <Text style={styles.resultAdvice}>{result.advice}</Text>
            ) : result.upcyclingLoading ? (
              <View style={styles.upcycleLoading}>
                <ActivityIndicator color="#8b5cf6" />
                <Text style={styles.upcycleLoadingText}>Generating ideas...</Text>
              </View>
            ) : result.upcyclingIdeas.length === 0 ? (
              <Text style={styles.resultAdvice}>
                No upcycling ideas available yet.
              </Text>
            ) : (
              result.upcyclingIdeas.map((idea, index) => (
                <View key={`${idea.title}-${index}`} style={styles.ideaRow}>
                  <Text style={styles.ideaBullet}>+</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ideaTitle}>{idea.title}</Text>
                    {!!idea.description && (
                      <Text style={styles.ideaDesc}>{idea.description}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {result.completedLessons.length > 0 ? (
            <View style={styles.lessonBadge}>
              <Text style={styles.lessonBadgeTitle}>
                Lesson Complete
                {result.completedLessons.length > 1
                  ? ` ${completedLessonIndex + 1}/${result.completedLessons.length}`
                  : ""}
              </Text>
              <Text style={styles.lessonBadgeName}>
                {result.completedLessons[completedLessonIndex].topic}
              </Text>
              <Text style={styles.lessonBadgeReward}>
                +{result.completedLessons[completedLessonIndex].xpReward} XP / +
                {result.completedLessons[completedLessonIndex].pointsReward} pts
              </Text>
              {result.completedLessons.length > 1 ? (
                <View style={styles.lessonPager}>
                  <TouchableOpacity
                    style={styles.lessonPagerButton}
                    onPress={() =>
                      setCompletedLessonIndex((index) =>
                        index === 0
                          ? result.completedLessons.length - 1
                          : index - 1,
                      )
                    }
                  >
                    <Text style={styles.lessonPagerText}>Prev</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.lessonPagerButton}
                    onPress={() =>
                      setCompletedLessonIndex(
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

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setResult(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  message: {
    textAlign: "center",
    paddingBottom: 15,
    color: "#fff",
    fontSize: 18,
  },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "center",
    marginBottom: 72,
    alignItems: "flex-end",
  },
  captureButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 150,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#1E7E34", opacity: 0.7 },
  text: { fontSize: 18, fontWeight: "bold", color: "white" },
  resultContainer: {
    position: "absolute",
    bottom: 72,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    alignItems: "center",
    maxHeight: 430,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  pointsBadge: {
    backgroundColor: "#e8f8ef",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pointsBadgeText: { color: "#1a7f3c", fontWeight: "700", fontSize: 15 },
  infoBadge: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoBadgeText: { color: "#666", fontWeight: "600", fontSize: 14 },
  lessonBadge: {
    backgroundColor: "#e8f8ef",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#28a74544",
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    width: "100%",
    gap: 3,
    marginBottom: 12,
  },
  lessonBadgeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#28a745",
  },
  lessonBadgeName: { fontSize: 14, color: "#333", textAlign: "center" },
  lessonBadgeReward: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a7f3c",
    marginTop: 2,
  },
  lessonPager: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  lessonPagerButton: {
    backgroundColor: "#28a745",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  lessonPagerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#28a745" },
  tabActiveUpcycle: { backgroundColor: "#8b5cf6" },
  tabText: { fontSize: 15, fontWeight: "600", color: "#666" },
  tabTextActive: { color: "#fff" },
  tabContent: {
    width: "100%",
    minHeight: 78,
    maxHeight: 150,
    marginBottom: 12,
  },
  resultAdvice: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    paddingVertical: 8,
  },
  upcycleLoading: { alignItems: "center", paddingVertical: 24, gap: 8 },
  upcycleLoadingText: { color: "#8b5cf6", fontSize: 14 },
  ideaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  ideaBullet: { fontSize: 16 },
  ideaTitle: { fontSize: 15, fontWeight: "700", color: "#222" },
  ideaDesc: { fontSize: 13, color: "#666", marginTop: 2, lineHeight: 18 },
  closeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
