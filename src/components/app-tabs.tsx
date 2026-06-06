import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="map">
        <Label>Map</Label>
        <Icon src={require("@/assets/images/tabIcons/home.png")} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tab2">
        <Label>Blue</Label>
        <Icon src={require("@/assets/images/tabIcons/explore.png")} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="scanner">
        <Label>Scan</Label>
        <Icon src={require("@/assets/images/tabIcons/home.png")} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tab4">
        <Label>Yellow</Label>
        <Icon src={require("@/assets/images/tabIcons/explore.png")} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tab5">
        <Label>Purple</Label>
        <Icon src={require("@/assets/images/tabIcons/home.png")} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
