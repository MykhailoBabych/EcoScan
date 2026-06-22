import { useProfile } from "@/contexts/ProfileContext";
import { useEcoScore } from "@/hooks/use-eco-score";
import { getPlanetHealth, getPlanetStage, PlanetProgress } from "@/services/planet";

export type PlanetState = PlanetProgress & {
  /** Planet health, 0..1. */
  health: number;
  /** Planet health as a whole percentage, 0..100. */
  healthPct: number;
  recycledCount: number;
  wastedCount: number;
  totalScans: number;
  totalPoints: number;
};

/**
 * Single source of truth for the Planet screen. Combines profile points with
 * the eco-score counts and the planet progression model so the view stays
 * purely presentational.
 */
export function usePlanet(): PlanetState {
  const { ecoPoints } = useProfile();
  const { recycledCount, wastedCount, totalScans } = useEcoScore();

  const health = getPlanetHealth(recycledCount, wastedCount, totalScans);
  const progress = getPlanetStage(recycledCount);

  return {
    ...progress,
    health,
    healthPct: Math.round(health * 100),
    recycledCount,
    wastedCount,
    totalScans,
    totalPoints: ecoPoints,
  };
}
