import { WasteCategory } from "./profile";

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD === 1) return "yesterday";
  if (diffD < 7) return `${diffD}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

type CategoryMeta = { label: string; emoji: string; color: string };

export const CATEGORY_META: Record<WasteCategory, CategoryMeta> = {
  plastic: { label: "Plastic", emoji: "🧴", color: "#0ea5e9" },
  glass: { label: "Glass", emoji: "🫙", color: "#a78bfa" },
  paper: { label: "Paper", emoji: "📄", color: "#f59e0b" },
  cardboard: { label: "Cardboard", emoji: "📦", color: "#d97706" },
  metal: { label: "Metal", emoji: "🥫", color: "#6b7280" },
  food: { label: "Food", emoji: "🥕", color: "#22c55e" },
  electronics: { label: "Electronics", emoji: "📱", color: "#f43f5e" },
  unknown: { label: "Other", emoji: "?", color: "#8e8e93" },
};
