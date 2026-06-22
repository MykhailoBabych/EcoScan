import { AppIcon, IconName } from "@/components/icon";
import { useTheme } from "@/hooks/use-theme";
import { StyleSheet, Text, View } from "react-native";

type StatTileProps = {
  icon: IconName;
  value: string;
  label: string;
  color: string;
};

/**
 * Generic metric card: a tinted icon badge, a large value and a caption.
 * Reused for the Planet stats grid (Health, Level, Recycled, Eco Points).
 */
export function StatTile({ icon, value, label, color }: StatTileProps) {
  const theme = useTheme();

  return (
    <View style={[styles.tile, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.iconBadge, { backgroundColor: color + "22" }]}>
        <AppIcon name={icon} size={20} tintColor={color} />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});
