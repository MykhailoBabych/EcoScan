import { AppIcon } from "@/components/icon";
import { Brand } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

type EcoPointsBadgeProps = {
  points: number;
  tone?: "solid" | "soft";
};

/**
 * Compact Eco Points balance pill. `solid` renders a filled green chip for use
 * on light surfaces (e.g. the scanner header); `soft` renders a tinted chip.
 */
export function EcoPointsBadge({ points, tone = "solid" }: EcoPointsBadgeProps) {
  const solid = tone === "solid";
  const accent = solid ? "#fff" : Brand.primary;

  return (
    <View style={[styles.badge, solid ? styles.solid : styles.soft]}>
      <AppIcon name="leaf.fill" size={15} tintColor={accent} />
      <Text style={[styles.value, { color: accent }]}>
        {points.toLocaleString()}
      </Text>
      <Text
        style={[
          styles.label,
          { color: solid ? "rgba(255,255,255,0.85)" : Brand.primary },
        ]}
      >
        pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
  },
  solid: {
    backgroundColor: Brand.primary,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  soft: {
    backgroundColor: "rgba(40,167,69,0.12)",
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
