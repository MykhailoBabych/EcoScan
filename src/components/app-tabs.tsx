import { Colors } from "@/constants/theme";
import { Tabs } from "expo-router";
import { SymbolView, SymbolViewProps } from "expo-symbols";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabDef = {
  name: string;
  label: string;
  icon: SymbolViewProps["name"];
  center?: boolean;
};

const TABS: TabDef[] = [
  { name: "map", label: "Map", icon: "map.fill" },
  { name: "activity", label: "Activity", icon: "list.bullet" },
  { name: "scanner", label: "Scan", icon: "camera.fill", center: true },
  { name: "profile", label: "Profile", icon: "person.fill" },
  { name: "settings", label: "Settings", icon: "gearshape.fill" },
];

const ACCENT = "#28a745";

function CustomTabBar({ state, navigation }: any) {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
          paddingBottom: insets.bottom || 8,
          height: 60 + (insets.bottom || 8),
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find((item) => item.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (tab.center) {
          return (
            <View key={route.key} style={styles.centerWrapper}>
              <TouchableOpacity
                style={[
                  styles.centerButton,
                  { borderColor: colors.background },
                ]}
                onPress={onPress}
                activeOpacity={0.85}
              >
                <SymbolView name={tab.icon} size={28} tintColor="#ffffff" />
              </TouchableOpacity>
              <Text
                style={[
                  styles.centerLabel,
                  { color: isFocused ? ACCENT : colors.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <SymbolView
              name={tab.icon}
              size={24}
              tintColor={isFocused ? ACCENT : colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                { color: isFocused ? ACCENT : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="map" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="scanner" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="lessons" options={{ href: null }} />
      <Tabs.Screen name="student-lessons" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
  },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    borderWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
});
