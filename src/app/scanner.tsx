import { useProfile } from "@/contexts/ProfileContext";
import { WasteCategory } from "@/services/profile";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Category mapping ─────────────────────────────────────────────────────────

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
      if (cat.keywords.some((kw) => desc.includes(kw))) {
        return {
          label: label.description,
          advice: cat.advice,
          category: cat.category,
        };
      }
    }
  }

  // First non-ignored label
  for (const label of labels) {
    const desc = label.description.toLowerCase();
    if (!IGNORED_WORDS.some((iw) => desc.includes(iw))) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<
    (EcoAdvice & { pointsEarned?: number }) | null
  >(null);

  const { recordScan } = useProfile();

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

  const toggleCameraFacing = () =>
    setFacing((cur) => (cur === "back" ? "front" : "back"));

  const takePhotoAndAnalyze = async () => {
    if (!cameraRef.current) return;
    try {
      setAnalyzing(true);
      setResult(null);

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

      if (advice.category === "unknown") {
        setResult(advice);
        return;
      }

      // ── Record scan in profile ──────────────────────────────────────────
      const { pointsEarned } = await recordScan({
        objectLabel: advice.label,
        category: advice.category,
        recyclingAdvice: advice.advice,
        upcyclingIdeas: [], // will be filled in Stage 5 (Upcycling AI)
      });

      setResult({ ...advice, pointsEarned });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to analyze image.");
    } finally {
      setAnalyzing(false);
    }
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
    } catch (e) {
      console.error("Fetch error:", e);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        zoom={zoom}
        ref={cameraRef}
      >
        {/* Flip button */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.textSmall}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Scan button */}
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

        {/* Zoom controls */}
        <View
          style={[styles.sideControls, { zIndex: 100 }]}
          pointerEvents="box-none"
        >
          <Text style={styles.textSmall}>{(zoom * 100).toFixed(0)}%</Text>
          <TouchableOpacity
            style={[styles.iconButton, { marginTop: 5 }]}
            onPress={() => setZoom((z) => Math.min(z + 0.05, 1))}
          >
            <Text style={styles.textSmall}>Zoom +</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { marginTop: 10 }]}
            onPress={() => setZoom((z) => Math.max(z - 0.05, 0))}
          >
            <Text style={styles.textSmall}>Zoom -</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Result card */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detected: {result.label}</Text>
          <Text style={styles.resultAdvice}>{result.advice}</Text>

          {/* Points toast */}
          {result.pointsEarned !== undefined && (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>
                +{result.pointsEarned} Eco Points 🌿
              </Text>
            </View>
          )}

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

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  topControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    paddingTop: 50,
  },
  sideControls: {
    position: "absolute",
    right: 20,
    top: 120,
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    justifyContent: "center",
    marginBottom: 100,
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
  textSmall: { fontSize: 14, fontWeight: "bold", color: "white" },

  resultContainer: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  resultTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  resultAdvice: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    color: "#333",
  },

  pointsBadge: {
    backgroundColor: "#e8f8ef",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  pointsBadgeText: { color: "#1a7f3c", fontWeight: "700", fontSize: 15 },

  closeButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
