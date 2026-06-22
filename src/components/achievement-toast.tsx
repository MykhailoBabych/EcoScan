import { Achievement } from "@/services/achievements";
import { AppIcon } from "@/components/icon";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, Keyframe } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AchievementToastProps = {
  achievement: Achievement | null;
  onDone: () => void;
};

const toastIn = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateY: -28 }, { scale: 0.94 }],
  },
  65: {
    opacity: 1,
    transform: [{ translateY: 6 }, { scale: 1.02 }],
    easing: Easing.out(Easing.cubic),
  },
  100: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    easing: Easing.out(Easing.cubic),
  },
});

const toastOut = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  100: {
    opacity: 0,
    transform: [{ translateY: -18 }, { scale: 0.98 }],
    easing: Easing.in(Easing.cubic),
  },
});

const iconPop = new Keyframe({
  0: {
    transform: [{ scale: 0.7 }, { rotateZ: "-8deg" }],
  },
  55: {
    transform: [{ scale: 1.16 }, { rotateZ: "5deg" }],
    easing: Easing.out(Easing.back(1.4)),
  },
  100: {
    transform: [{ scale: 1 }, { rotateZ: "0deg" }],
    easing: Easing.out(Easing.cubic),
  },
});

export function AchievementToast({
  achievement,
  onDone,
}: AchievementToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!achievement) return undefined;

    const timeout = setTimeout(onDone, 3400);
    return () => clearTimeout(timeout);
  }, [achievement, onDone]);

  if (!achievement) return null;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        key={achievement.id}
        entering={toastIn.duration(520)}
        exiting={toastOut.duration(180)}
        style={[styles.toast, { top: insets.top + 12 }]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onDone}
          style={styles.content}
        >
          <Animated.View entering={iconPop.duration(640)} style={styles.icon}>
            <AppIcon name={achievement.icon} size={24} tintColor="#fff" />
          </Animated.View>
          <View style={styles.copy}>
            <Text style={styles.eyebrow}>Achievement unlocked</Text>
            <Text numberOfLines={1} style={styles.title}>
              {achievement.title}
            </Text>
            <Text numberOfLines={2} style={styles.description}>
              {achievement.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 2000,
    elevation: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(40, 167, 69, 0.3)",
    backgroundColor: "rgba(18, 24, 20, 0.96)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: "#8ee8a7",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  description: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 13,
    marginTop: 2,
  },
});
