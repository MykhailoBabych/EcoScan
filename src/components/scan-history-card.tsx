import { CATEGORY_META } from "@/constants/waste-categories";
import { useTheme } from "@/hooks/use-theme";
import { ScanRecord } from "@/services/profile";
import { StyleSheet, Text, View } from "react-native";

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Compact recent-scan row: a category-colored emoji tile, the detected object
 * name, and a "Category · time ago" caption.
 */
export function ScanHistoryCard({ scan }: { scan: ScanRecord }) {
  const theme = useTheme();
  const meta = CATEGORY_META[scan.category] ?? CATEGORY_META.unknown;

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
      <View style={[styles.tile, { backgroundColor: meta.color + "22" }]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.text }]}>
          {scan.objectLabel}
        </Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {meta.label} · {timeAgo(scan.timestamp)}
        </Text>
      </View>
      <View style={[styles.accent, { backgroundColor: meta.color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    padding: 12,
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  info: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12, fontWeight: "500" },
  accent: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
