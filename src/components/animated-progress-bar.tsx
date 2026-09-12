import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type AnimatedProgressBarProps = {
  /** Target fill, 0..1. */
  progress: number;
  color: string;
  trackColor?: string;
  height?: number;
};

/**
 * Progress bar that springs smoothly to its target width whenever `progress`
 * changes — used for planet level progression. Animates layout width, so it
 * runs off the native driver.
 */
export function AnimatedProgressBar({
  progress,
  color,
  trackColor = "rgba(120,120,128,0.2)",
  height = 12,
}: AnimatedProgressBarProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(progress, 1)),
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          { width, borderRadius: height / 2, backgroundColor: color },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: "hidden", width: "100%" },
  fill: { height: "100%" },
});
