import { Brand } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { AppIcon } from "@/components/icon";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  backLabel: string;
  onBack: () => void;
};

/**
 * Shared navigation header with a back button on the left and a centered
 * title. Used by the secondary screens that are pushed on top of a tab
 * (quiz, guide, leaderboard, settings sub-pages, ...).
 */
export function ScreenHeader({ title, backLabel, onBack }: ScreenHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <AppIcon name="chevron.left" size={24} tintColor={Brand.info} />
        <Text style={styles.backText}>{backLabel}</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <View style={styles.right} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: { flexDirection: "row", alignItems: "center", flex: 1 },
  backText: { color: Brand.info, fontSize: 17, marginLeft: 4 },
  title: { fontSize: 20, fontWeight: "bold" },
  right: { flex: 1 },
});
