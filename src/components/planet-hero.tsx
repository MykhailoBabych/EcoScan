import { PlanetSvg } from "@/components/planet-svg";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type PlanetHeroProps = {
  /** Planet health 0..1 — drives the planet's color/cleanliness. */
  health: number;
  /** Progress within the current planet level 0..1 — drives the ring. */
  levelProgress: number;
  level: number;
  /** Current stage accent color. */
  color: string;
  size?: number;
};

/**
 * The Planet screen's centerpiece. The inner planet color reflects health,
 * while the surrounding ring animates to fill with progress toward the next
 * planet level. Both signals come straight from user activity — nothing is
 * decorative-random.
 */
export function PlanetHero({
  health,
  levelProgress,
  level,
  color,
  size = 260,
}: PlanetHeroProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const planetSize = size - 64;

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.max(0, Math.min(levelProgress, 1)),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [levelProgress, progress]);

  // Full circumference dash; offset shrinks as progress grows (fills the ring).
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color + "26"}
          strokeWidth={stroke}
          fill="none"
        />
        {/* Progress (starts at top, fills clockwise) */}
        <G rotation={-90} origin={`${center}, ${center}`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>

      <PlanetSvg score={health} size={planetSize} />

      <View style={[styles.levelBadge, { backgroundColor: color }]}>
        <Text style={styles.levelBadgeText}>LVL {level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadge: {
    position: "absolute",
    bottom: 0,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  levelBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
