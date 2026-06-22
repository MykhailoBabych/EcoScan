import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export type IconName =
  | "qrcode.viewfinder"
  | "leaf.fill"
  | "book.fill"
  | "checkmark.circle.fill"
  | "checkmark.seal.fill"
  | "trash"
  | "chevron.left"
  | "chevron.right"
  | "chevron.up"
  | "chevron.down"
  | "chevron.left.circle.fill"
  | "chevron.right.circle.fill"
  | "plus.circle.fill"
  | "location.fill"
  | "line.3.horizontal.decrease.circle.fill"
  | "exclamationmark.triangle.fill"
  | "mappin.slash"
  | "arrow.clockwise"
  | "arrow.right"
  | "map.fill"
  | "list.bullet"
  | "camera.fill"
  | "globe.europe.africa.fill"
  | "person.fill"
  | "gearshape.fill"
  | "info.circle.fill"
  | "rectangle.portrait.and.arrow.right"
  | "trophy.fill"
  | "star.fill"
  | "xmark.circle.fill";

type IconSpec =
  | { family: "ionicons"; glyph: keyof typeof Ionicons.glyphMap }
  | { family: "material"; glyph: keyof typeof MaterialIcons.glyphMap };

const ICON_MAP: Record<IconName, IconSpec> = {
  "qrcode.viewfinder": { family: "ionicons", glyph: "qr-code-outline" },
  "leaf.fill": { family: "ionicons", glyph: "leaf" },
  "book.fill": { family: "ionicons", glyph: "book" },
  "checkmark.circle.fill": { family: "ionicons", glyph: "checkmark-circle" },
  "checkmark.seal.fill": { family: "ionicons", glyph: "checkmark-circle" },
  trash: { family: "ionicons", glyph: "trash" },
  "chevron.left": { family: "ionicons", glyph: "chevron-back" },
  "chevron.right": { family: "ionicons", glyph: "chevron-forward" },
  "chevron.up": { family: "ionicons", glyph: "chevron-up" },
  "chevron.down": { family: "ionicons", glyph: "chevron-down" },
  "chevron.left.circle.fill": { family: "ionicons", glyph: "chevron-back-circle" },
  "chevron.right.circle.fill": { family: "ionicons", glyph: "chevron-forward-circle" },
  "plus.circle.fill": { family: "ionicons", glyph: "add-circle" },
  "location.fill": { family: "ionicons", glyph: "location" },
  "line.3.horizontal.decrease.circle.fill": { family: "ionicons", glyph: "filter-circle" },
  "exclamationmark.triangle.fill": { family: "ionicons", glyph: "warning" },
  "mappin.slash": { family: "material", glyph: "location-off" },
  "arrow.clockwise": { family: "ionicons", glyph: "refresh" },
  "arrow.right": { family: "ionicons", glyph: "arrow-forward" },
  "map.fill": { family: "ionicons", glyph: "map" },
  "list.bullet": { family: "ionicons", glyph: "list" },
  "camera.fill": { family: "ionicons", glyph: "camera" },
  "globe.europe.africa.fill": { family: "ionicons", glyph: "globe" },
  "person.fill": { family: "ionicons", glyph: "person" },
  "gearshape.fill": { family: "ionicons", glyph: "settings" },
  "info.circle.fill": { family: "ionicons", glyph: "information-circle" },
  "rectangle.portrait.and.arrow.right": { family: "ionicons", glyph: "log-out" },
  "trophy.fill": { family: "ionicons", glyph: "trophy" },
  "star.fill": { family: "ionicons", glyph: "star" },
  "xmark.circle.fill": { family: "ionicons", glyph: "close-circle" },
};

type AppIconProps = {
  name: IconName;
  size?: number;
  tintColor?: string;
};

export function AppIcon({ name, size = 20, tintColor }: AppIconProps) {
  const spec = ICON_MAP[name];

  if (spec.family === "material") {
    return <MaterialIcons name={spec.glyph} size={size} color={tintColor} />;
  }

  return <Ionicons name={spec.glyph} size={size} color={tintColor} />;
}
