import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "expo-router";
import { AppIcon } from "@/components/icon";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { logOut } = useProfile();
  const theme = useTheme();
  const router = useRouter();

  const handleLogOut = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          onPress: async () => {
            await logOut();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { marginLeft: 16, color: theme.text }]}
        >
          Settings
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => router.push("/about")}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#28a745' }]}>
                <AppIcon name="info.circle.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>About Us</Text>
            </View>
            <AppIcon name="chevron.right" size={20} tintColor="#8e8e93" />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.section, { backgroundColor: theme.backgroundElement }]}
        >
          <TouchableOpacity style={styles.row} onPress={handleLogOut}>
            <View style={styles.rowLeft}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#ff9500" }]}
              >
                <AppIcon
                  name="rectangle.portrait.and.arrow.right"
                  size={20}
                  tintColor="#fff"
                />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>
                Log Out
              </Text>
            </View>
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
});
