import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const SUPPORTED = Platform.OS === "ios" || Platform.OS === "android";

/**
 * Fire-and-forget a haptic. Haptics are a non-essential polish layer, so any
 * failure (unsupported device, web, missing hardware) is swallowed silently and
 * must never surface as an error in the UI.
 */
function fire(action: () => Promise<unknown>) {
  if (!SUPPORTED) return;
  action().catch(() => {});
}

/**
 * Semantic haptic vocabulary used across the app. Components call these by
 * intent (`success`, `levelUp`, …) rather than reaching for raw impact styles,
 * so the feel stays consistent everywhere.
 */
export const haptics = {
  /** Light tap — tab switches, segmented controls, selection changes. */
  light() {
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  /** Medium tap — primary actions such as the scan button. */
  medium() {
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },
  /** Selection tick — moving between options. */
  selection() {
    fire(() => Haptics.selectionAsync());
  },
  /** Success — recognized object / Eco Points awarded. */
  success() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
  /** Warning — unrecognized object / no points. */
  warning() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  },
  /** Celebratory two-step pattern — planet level-up / milestone reached. */
  levelUp() {
    if (!SUPPORTED) return;
    fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
    setTimeout(
      () =>
        fire(() =>
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
        ),
      140,
    );
  },
};
