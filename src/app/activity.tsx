import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView, SymbolViewProps } from "expo-symbols";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// achievment object
export type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: SymbolViewProps["name"];
};

// for testing purpose
const LEADERBOARD = [
  { rank: 1, name: "EcoWarrior99", score: 1250 },
  { rank: 2, name: "GreenEarth", score: 1100 },
  { rank: 3, name: "PlanetSaver", score: 980 },
  { rank: 4, name: "TreeHugger", score: 850 },
  { rank: 5, name: "RecycleKing", score: 720 },
  { rank: 6, name: "OceanProtector", score: 690 },
  { rank: 7, name: "NatureLover", score: 630 },
  { rank: 8, name: "EcoFriendly", score: 580 },
  { rank: 9, name: "ZeroWaste", score: 510 },
  { rank: 10, name: "GreenThumb", score: 450 },
];

export default function ActivityScreen() {
  const [view, setView] = useState<"main" | "leaderboard" | "achievements">(
    "main",
  );
  const theme = useTheme();
  const { totalScans } = useProfile();

  const ACHIEVEMENTS: Achievement[] = [
    {
      id: "1",
      title: "My first scan!",
      description: "Scan an object for the first time",
      completed: totalScans >= 1,
      icon: "qrcode.viewfinder",
    },
    {
      id: "2",
      title: "Experienced Environmentalist",
      description: "Scan 10 objects",
      completed: totalScans >= 10,
      icon: "leaf.fill",
    },
  ];

  const renderHeader = (title: string, backView: "main", backLabel: string) => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setView(backView)}
      >
        <SymbolView name="chevron.left" size={24} tintColor="#0a84ff" />
        <Text style={styles.headerBackText}>{backLabel}</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (view === "leaderboard") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {renderHeader("Leaderboard", "main", "Activity")}
        <ScrollView style={styles.scrollView}>
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            {LEADERBOARD.map((user, index) => (
              <View key={user.rank}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Text style={[styles.rankText, { color: theme.text }]}>
                      #{user.rank}
                    </Text>
                    <Text
                      style={[
                        styles.rowText,
                        { color: theme.text, marginLeft: 16 },
                      ]}
                    >
                      {user.name}
                    </Text>
                  </View>
                  <Text style={[styles.scoreText, { color: "#0a84ff" }]}>
                    {user.score}
                  </Text>
                </View>
                {index < LEADERBOARD.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "achievements") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {renderHeader("Achievements", "main", "Activity")}
        <ScrollView style={styles.scrollView}>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: theme.backgroundElement },
                  !item.completed && { opacity: 0.4 }, // Если не выполнено — тусклое
                ]}
              >
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: item.completed ? "#34c759" : "#8e8e93" },
                  ]}
                >
                  <SymbolView name={item.icon} size={32} tintColor="#fff" />
                </View>
                <Text style={[styles.achievementTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.achievementDesc, { color: "#8e8e93" }]}>
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { marginLeft: 16, color: theme.text }]}
        >
          Activity
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View
          style={[styles.section, { backgroundColor: theme.backgroundElement }]}
        >
          <TouchableOpacity
            style={styles.row}
            onPress={() => setView("leaderboard")}
          >
            <View style={styles.rowLeft}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#ff9500" }]}
              >
                <SymbolView name="trophy.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>
                Leaderboard
              </Text>
            </View>
            <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.row}
            onPress={() => setView("achievements")}
          >
            <View style={styles.rowLeft}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#34c759" }]}
              >
                <SymbolView name="star.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>
                Achievements
              </Text>
            </View>
            <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerBackText: {
    color: "#0a84ff",
    fontSize: 17,
    marginLeft: 4,
  },
  headerRight: {
    flex: 1,
  },
  section: {
    borderRadius: 10,
    marginBottom: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowText: {
    fontSize: 17,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#38383a", // Будет работать для темной темы (может потребоваться корректировка)
    marginLeft: 16,
  },
  rankText: {
    fontSize: 17,
    fontWeight: "600",
    width: 30,
  },
  scoreText: {
    fontSize: 17,
    fontWeight: "bold",
  },
  achievementsGrid: {
    paddingBottom: 24,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 14,
    textAlign: "center",
  },
});
