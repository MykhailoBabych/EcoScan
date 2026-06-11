import { useProfile } from "@/contexts/ProfileContext";
import { useTheme } from "@/hooks/use-theme";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
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
  const [view, setView] = useState("main");
  const { logOut } = useProfile();
  const theme = useTheme();

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

  const renderHeader = (title: string, backView: string, backLabel: string) => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setView(backView)}
      >
        <SymbolView name="chevron.left" size={24} tintColor="#0a84ff" />
        <Text style={styles.headerBackText}>{backLabel}</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (view === "creators") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {renderHeader("Creators", "about", "About Us")}
        <ScrollView style={styles.scrollView}>
          <View
            style={[
              styles.textContainer,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Text style={[styles.bodyText, { color: theme.text }]}>
              Creators: Mykhailo Babych, Anton Opria, Mark Shatalov, Nazar
              Kyrychenko.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "purpose") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {renderHeader("App Purpose", "about", "About Us")}
        <ScrollView style={styles.scrollView}>
          <View
            style={[
              styles.textContainer,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <Text style={[styles.bodyText, { color: theme.text }]}>
              EcoScan's goal — help people make the right environmental
              decisions in everyday life: scan an object → get advice to recycle
              or reuse it, with nearby collection points shown on the map.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === "about") {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        {renderHeader("About Us", "main", "Settings")}
        <ScrollView style={styles.scrollView}>
          <View
            style={[
              styles.section,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <TouchableOpacity
              style={styles.row}
              onPress={() => setView("creators")}
            >
              <Text style={[styles.rowText, { color: theme.text }]}>
                Creators
              </Text>
              <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.row}
              onPress={() => setView("purpose")}
            >
              <Text style={[styles.rowText, { color: theme.text }]}>
                App Purpose
              </Text>
              <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
            </TouchableOpacity>
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
          Settings
        </Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, { backgroundColor: theme.backgroundElement }]}>
          <TouchableOpacity style={styles.row} onPress={() => setView('about')}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#28a745' }]}>
                <SymbolView name="info.circle.fill" size={20} tintColor="#fff" />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>About Us</Text>
            </View>
            <SymbolView name="chevron.right" size={20} tintColor="#8e8e93" />
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
                <SymbolView
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
    backgroundColor: "#38383a",
    marginLeft: 16,
  },
  textContainer: {
    borderRadius: 10,
    padding: 16,
    marginTop: 10,
  },
  bodyText: {
    fontSize: 17,
    lineHeight: 24,
  },
});
