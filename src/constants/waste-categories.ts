import { WasteCategory } from "@/services/profile";

export type CategoryMeta = {
  label: string;
  emoji: string;
  color: string;
};

/**
 * Display metadata (label, emoji, accent color) for every waste category.
 * Single source of truth so screens don't redefine the same table locally.
 */
export const CATEGORY_META: Record<WasteCategory, CategoryMeta> = {
  plastic:     { label: "Plastic",      emoji: "🧴", color: "#0ea5e9" },
  glass:       { label: "Glass",        emoji: "🫙", color: "#8b5cf6" },
  paper:       { label: "Paper",        emoji: "📄", color: "#f59e0b" },
  cardboard:   { label: "Cardboard",    emoji: "📦", color: "#d97706" },
  metal:       { label: "Metal",        emoji: "🥫", color: "#6b7280" },
  food:        { label: "Food/Organic", emoji: "🍌", color: "#22c55e" },
  electronics: { label: "Electronics",  emoji: "📱", color: "#ef4444" },
  textile:     { label: "Textile",      emoji: "👕", color: "#ec4899" },
  hazardous:   { label: "Hazardous",    emoji: "☢️", color: "#ef4444" },
  batteries:   { label: "Batteries",    emoji: "🔋", color: "#eab308" },
  composite:   { label: "Composite",    emoji: "🧃", color: "#f97316" },
  wood:        { label: "Wood",         emoji: "🪵", color: "#92400e" },
  toys:        { label: "Toys",         emoji: "🧸", color: "#8b5cf6" },
  kitchenware: { label: "Kitchenware",  emoji: "🍳", color: "#14b8a6" },
  unknown:     { label: "Other",        emoji: "❓", color: "#94a3b8" },
};
