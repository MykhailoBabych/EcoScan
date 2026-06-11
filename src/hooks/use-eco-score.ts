import { useProfile } from "@/contexts/ProfileContext";
import { WasteCategory } from "@/services/profile";

const RECYCLABLE: WasteCategory[] = [
  "plastic",
  "glass",
  "paper",
  "cardboard",
  "metal",
  "textile",
  "batteries",
  "composite",
  "wood",
  "toys",
  "kitchenware",
];

const POLLUTING: WasteCategory[] = ["electronics", "food", "hazardous", "unknown"];

export function useEcoScore() {
  const { categoryStats, totalScans } = useProfile();

  const recycledCount = RECYCLABLE.reduce(
    (sum, category) => sum + (categoryStats[category] ?? 0),
    0,
  );
  const wastedCount = POLLUTING.reduce(
    (sum, category) => sum + (categoryStats[category] ?? 0),
    0,
  );

  const score = totalScans > 0 ? recycledCount / totalScans : 0.5;

  return { score, recycledCount, wastedCount, totalScans };
}
