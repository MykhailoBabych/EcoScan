import { EcoPointsBadge } from "@/components/eco-points-badge";
import { AppIcon } from "@/components/icon";
import { ScanHistoryCard } from "@/components/scan-history-card";
import { ScanningLine } from "@/components/scanning-line";
import {
  ResultTab,
  ScanResultCard,
  ScanResultData,
} from "@/components/scan-result-card";
import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { haptics } from "@/services/haptics";
import { StudentLessonsService } from "@/services/lessons";
import { WasteCategory } from "@/services/profile";
import { getUpcyclingIdeas, UpcyclingIdea } from "@/services/upcycling-ai";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Google Cloud Vision API key — provided at build time via .env
// (EXPO_PUBLIC_VISION_API_KEY). See .env.example. Never hardcode credentials.
const VISION_API_KEY = process.env.EXPO_PUBLIC_VISION_API_KEY;

const RECENT_SCANS_LIMIT = 15;

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
      "wire",
      "cable",
      "device",
      "charger",
      "circuit",
      "keyboard",
      "monitor",
    ],
    advice: "Take to an e-waste recycling center.",
  },
  {
    category: "textile",
    keywords: [
      "bag",
      "backpack",
      "handbag",
      "fabric",
      "clothing",
      "shirt",
      "jacket",
      "shoe",
      "sneaker",
      "hat",
      "sock",
      "scarf",
      "jeans",
      "garment",
    ],
    advice: "Donate if wearable. Take to a textile recycling bin.",
  },
  {
    category: "batteries",
    keywords: ["battery", "batteries", "aa", "aaa", "lithium", "rechargeable"],
    advice: "Take to a battery recycling point. Never throw in general waste.",
  },
  {
    category: "hazardous",
    keywords: [
      "paint",
      "chemical",
      "solvent",
      "pesticide",
      "motor oil",
      "bleach",
      "acid",
      "spray can",
      "aerosol",
    ],
    advice: "Take to a hazardous waste facility. Do not pour down the drain.",
  },
  {
    category: "composite",
    keywords: ["carton", "tetra pak", "juice box", "milk carton", "coffee cup"],
    advice: "Check local composite recycling. Rinse before recycling.",
  },
  {
    category: "wood",
    keywords: ["wood", "wooden", "furniture", "plank", "lumber", "timber", "chair", "table"],
    advice: "Donate, sell, or take to a recycling center. Avoid burning treated wood.",
  },
  {
    category: "toys",
    keywords: ["toy", "lego", "doll", "action figure", "puzzle", "game", "stuffed animal"],
    advice: "Donate working toys. Check manufacturer recycling programs.",
  },
  {
    category: "kitchenware",
    keywords: ["pot", "pan", "plate", "bowl", "cup", "mug", "utensil", "fork", "spoon", "knife"],
    advice: "Donate if intact. Broken ceramics go to general waste — not glass recycling.",
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
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [tab, setTab] = useState<ResultTab>("recycle");
  const [completedLessonIndex, setCompletedLessonIndex] = useState(0);

  const theme = useTheme();
  const { recordScan, updateScanUpcyclingIdeas, schoolRole, awardPoints, ecoPoints, scanHistory } =
    useProfile();

  if (!permission) {
    return <View style={[styles.safe, { backgroundColor: theme.background }]} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={[styles.safe, styles.permission, { backgroundColor: theme.background }]}
      >
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={[styles.permissionTitle, { color: theme.text }]}>
          Camera access needed
        </Text>
        <Text style={[styles.permissionText, { color: theme.textSecondary }]}>
          We use the camera to identify objects and show you how to recycle them.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const takePhotoAndAnalyze = async () => {
    if (!cameraRef.current) return;

    try {
      haptics.medium();
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

      // Tactile confirmation: a celebratory tap when points land, a softer
      // signal for a recognized-but-not-rewarded item, a warning for unknowns.
      if (awarded) {
        haptics.success();
      } else if (reason === "duplicate") {
        haptics.light();
      } else {
        haptics.warning();
      }

      let completedLessons: ScanResultData["completedLessons"] = [];

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
    if (!VISION_API_KEY) {
      Alert.alert(
        "Scanner not configured",
        "Image recognition is unavailable because the Vision API key is missing. Add EXPO_PUBLIC_VISION_API_KEY to your .env file (see .env.example).",
      );
      return null;
    }

    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      {/* ── Header: title + Eco Points balance ──────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Scan</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Point, scan, recycle smarter
          </Text>
        </View>
        <EcoPointsBadge points={ecoPoints} tone="solid" />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Large camera scanning area ────────────────────────────────── */}
        <View style={styles.viewfinder}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            selectedLens={selectedLens}
            zoom={0}
            onAvailableLensesChanged={handleAvailableLensesChanged}
            onCameraReady={handleCameraReady}
            ref={cameraRef}
          />

          {/* Corner frame brackets */}
          <View style={styles.frame} pointerEvents="none">
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {/* Sweeping scan line (only while analyzing) */}
          <View style={styles.scanLineArea} pointerEvents="none">
            <ScanningLine active={analyzing} />
          </View>

          {/* AI scanner pill */}
          <View style={styles.scannerPill} pointerEvents="none">
            <AppIcon name="sparkles" size={13} tintColor="#fff" />
            <Text style={styles.scannerPillText}>AI Scanner</Text>
          </View>

          {/* Analyzing overlay */}
          {analyzing && (
            <View style={styles.analyzingOverlay} pointerEvents="none">
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.analyzingText}>Analyzing…</Text>
            </View>
          )}

          {/* Capture button */}
          <TouchableOpacity
            style={[styles.captureButton, analyzing && styles.captureDisabled]}
            onPress={takePhotoAndAnalyze}
            disabled={analyzing}
            activeOpacity={0.85}
          >
            <AppIcon name="scan" size={22} tintColor="#fff" />
            <Text style={styles.captureText}>
              {analyzing ? "Scanning…" : "Scan Object"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Detection result ──────────────────────────────────────────── */}
        {result && (
          <ScanResultCard
            result={result}
            tab={tab}
            onTabChange={setTab}
            completedLessonIndex={completedLessonIndex}
            onLessonIndexChange={setCompletedLessonIndex}
            onClose={() => setResult(null)}
          />
        )}

        {/* ── Recent scans ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <AppIcon name="clock.fill" size={17} tintColor={theme.textSecondary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Scans
              </Text>
            </View>
            {scanHistory.length > 0 && (
              <Text style={[styles.sectionCount, { color: theme.textSecondary }]}>
                {scanHistory.length}
              </Text>
            )}
          </View>

          {scanHistory.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.emptyEmoji}>📷</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No scans yet. Scan your first object to start earning Eco Points!
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {scanHistory.slice(0, RECENT_SCANS_LIMIT).map((scan) => (
                <ScanHistoryCard key={scan.id} scan={scan} />
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 30, fontWeight: "800", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: "500", marginTop: 2 },

  scroll: { paddingHorizontal: 20, paddingBottom: 16, gap: 18 },

  // Viewfinder
  viewfinder: {
    height: 440,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 28,
  },
  scanLineArea: {
    position: "absolute",
    top: 30,
    left: 30,
    right: 30,
    bottom: 96,
    overflow: "hidden",
    borderRadius: 12,
  },
  corner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderColor: "rgba(255,255,255,0.9)",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 14,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 14,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 14,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 14,
  },
  scannerPill: {
    position: "absolute",
    top: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  scannerPillText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  analyzingText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  captureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#28a745",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 24,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  captureDisabled: { backgroundColor: "#1E7E34", opacity: 0.8 },
  captureText: { color: "#fff", fontSize: 17, fontWeight: "800" },

  // Recent scans section
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: "800" },
  sectionCount: { fontSize: 14, fontWeight: "700" },
  historyList: { gap: 10 },
  empty: {
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },

  // Permission
  permission: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  permissionEmoji: { fontSize: 56, marginBottom: 4 },
  permissionTitle: { fontSize: 22, fontWeight: "800" },
  permissionText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  permissionButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  permissionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
