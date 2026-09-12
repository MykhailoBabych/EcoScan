import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type ScanningLineProps = {
  active: boolean;
  color?: string;
};

/**
 * A thin light bar that sweeps up and down across the viewfinder while the
 * AI is analyzing, evoking a scanner pass. Self-measures its travel height via
 * onLayout and animates on the native driver, so it stays smooth and cheap.
 */
export function ScanningLine({ active, color = "#30d158" }: ScanningLineProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const [height, setHeight] = useState(0);
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!active || height <= 0) {
      loop.current?.stop();
      return;
    }

    translateY.setValue(0);
    loop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: height,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.current.start();

    return () => loop.current?.stop();
  }, [active, height, translateY]);

  if (!active) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
    >
      <Animated.View style={[styles.lineWrap, { transform: [{ translateY }] }]}>
        <View style={[styles.glow, { backgroundColor: color }]} />
        <View style={[styles.line, { backgroundColor: color }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  lineWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    opacity: 0.14,
    borderRadius: 28,
  },
  line: {
    height: 2.5,
    width: "100%",
    borderRadius: 2,
    opacity: 0.95,
  },
});
