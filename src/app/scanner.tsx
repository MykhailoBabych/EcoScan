import { View, Text, StyleSheet, Button, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';

const GOOGLE_VISION_API_KEY = 'YOUR_API_KEY'; // Replace logic below

const RECYCLING_CATEGORIES = [
  {
    keywords: ["bottle", "plastic", "pet", "water bottle", "soda"],
    advice: "Recycle in plastic bin. Remove cap if required."
  },
  {
    keywords: ["can", "aluminum", "tin", "beverage can", "coca-cola", "coke", "soda can"],
    advice: "Recycle in metal/cans bin."
  },
  {
    keywords: ["glass", "jar", "wine", "beer bottle"],
    advice: "Recycle in glass container."
  },
  {
    keywords: ["paper", "newspaper", "magazine", "book", "receipt"],
    advice: "Recycle in paper bin."
  },
  {
    keywords: ["cardboard", "box", "carton", "packaging"],
    advice: "Flatten and recycle in paper/cardboard bin."
  },
  {
    keywords: ["food", "fruit", "vegetable", "bread", "meat", "meal", "snack"],
    advice: "Compost if possible."
  },
  {
    keywords: ["electronic", "phone", "computer", "laptop", "battery", "wire", "cable"],
    advice: "Take to an e-waste recycling center."
  }
];

const ignoredWords = ["color", "red", "blue", "green", "pink", "yellow", "white", "black", "liquid", "material", "cylinder", "circle", "rectangle", "shape"];

const getEcoAdvice = (labels: any[]) => {
  // 1. Try to find a match in our categories
  for (let label of labels) {
    const desc = label.description.toLowerCase();
    
    for (let category of RECYCLING_CATEGORIES) {
      if (category.keywords.some((kw) => desc.includes(kw))) {
        return { label: label.description, advice: category.advice };
      }
    }
  }

  // 2. If no known category matches, try to find the very first label that is not a useless word like a color
  for (let label of labels) {
    const desc = label.description.toLowerCase();
    if (!ignoredWords.some((iw) => desc.includes(iw)) && !ignoredWords.includes(desc)) {
       return { 
         label: label.description, 
         advice: "We couldn't classify this clearly. Please check your local recycling guidelines." 
       };
    }
  }

  // 3. Fallback
  return { 
    label: labels[0]?.description || "Unknown Object", 
    advice: "Item not recognized as a standard recyclable. When in doubt, throw it out!" 
  };
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{label: string, advice: string} | null>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button onPress={requestPermission} title="Allow Access" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

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
      
      // If labels is null, an API error occurred (already alerted). 
      // If it's an empty array, it means no objects were detected.
      if (labels) {
        if (labels.length > 0) {
          const advice = getEcoAdvice(labels);
          setResult(advice);
        } else {
          Alert.alert("No object detected", "Please try again.");
        }
      }
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
        `https://vision.googleapis.com/v1/images:annotate?key=AIzaSyArhmioiHCIqN9WsEx_3wyCpyc-ykDto6Q`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64,
                },
                features: [
                  {
                    type: "LABEL_DETECTION",
                    maxResults: 5,
                  },
                ],
              },
            ],
          }),
        }
      );
    
      const data = await response.json();
      
      if (data.error) {
        console.error("Google Vision API Error:", data.error);
        Alert.alert("API Error", data.error.message || "Something went wrong with the Vision API.");
        return null;
      }

      if (!data.responses || !data.responses[0]) {
        console.error("Unexpected API response:", data);
        return null;
      }

      return data.responses[0].labelAnnotations || [];
    } catch (e) {
      console.error("Fetch error:", e);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} zoom={zoom} ref={cameraRef}>
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <Text style={styles.textSmall}>Flip</Text>
          </TouchableOpacity>
        </View>
        
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

        {/* Zoom Controls */}
        <View style={[styles.sideControls, { zIndex: 100 }]} pointerEvents="box-none">
          <Text style={styles.textSmall}>{(zoom * 100).toFixed(0)}%</Text>
          <TouchableOpacity style={[styles.iconButton, {marginTop: 5}]} onPress={() => {
            setZoom(z => Math.min(z + 0.05, 1));
          }}>
            <Text style={styles.textSmall}>Zoom +</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, {marginTop: 10}]} onPress={() => {
            setZoom(z => Math.max(z - 0.05, 0));
          }}>
            <Text style={styles.textSmall}>Zoom -</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detected: {result.label}</Text>
          <Text style={styles.resultAdvice}>{result.advice}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => setResult(null)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 15,
    color: '#fff',
    fontSize: 18,
  },
  camera: {
    flex: 1,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 50,
  },
  sideControls: {
    position: 'absolute',
    right: 20,
    top: 120,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    marginBottom: 100,
    alignItems: 'flex-end',
  },
  captureButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1E7E34',
    opacity: 0.7,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  textSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultAdvice: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
