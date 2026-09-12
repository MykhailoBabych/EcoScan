import { CATEGORY_META } from "@/constants/waste-categories";
import { WasteCategory } from "@/services/profile";
import { StyleSheet, Text, View } from "react-native";

type CategoryChipProps = {
  category: WasteCategory;
  size?: "sm" | "md";
};

/**
 * Pill showing a waste category's emoji + label, tinted with the category's
 * accent color. Shared by the scan result card and (future) breakdowns.
 */
export function CategoryChip({ category, size = "md" }: CategoryChipProps) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.unknown;
  const small = size === "sm";

  return (
    <View
      style={[
        styles.chip,
        small && styles.chipSm,
        { backgroundColor: meta.color + "1f" },
      ]}
    >
      <Text style={small ? styles.emojiSm : styles.emoji}>{meta.emoji}</Text>
      <Text
        style={[styles.label, small && styles.labelSm, { color: meta.color }]}
      >
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  chipSm: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    gap: 4,
  },
  emoji: { fontSize: 16 },
  emojiSm: { fontSize: 13 },
  label: { fontSize: 14, fontWeight: "700" },
  labelSm: { fontSize: 12, fontWeight: "600" },
});
