/**
 * Planet progression model.
 *
 * The Planet screen turns recycling activity into a living world that grows
 * through discrete stages. Two independent signals drive it:
 *
 *  - **Planet Health** (0..1): a quality+volume score. It rises as the user
 *    recycles more items AND keeps a good recycled-to-wasted ratio. This colors
 *    the planet from barren/grey to lush/blue.
 *  - **Planet Level**: a stage unlocked purely by the cumulative count of
 *    recycled items, so "the more items recycled, the further the planet
 *    progresses." Each stage exposes the next threshold for a progress bar.
 */

export type PlanetStage = {
  level: number;
  name: string;
  /** Minimum recycled items required to reach this stage. */
  minRecycled: number;
  color: string;
  message: string;
};

export const PLANET_STAGES: PlanetStage[] = [
  {
    level: 1,
    name: "Barren World",
    minRecycled: 0,
    color: "#a8a29e",
    message: "Your planet is lifeless. Recycle your first items to spark new life.",
  },
  {
    level: 2,
    name: "First Sprouts",
    minRecycled: 5,
    color: "#84cc16",
    message: "Tiny sprouts are breaking through. Keep recycling to grow your world.",
  },
  {
    level: 3,
    name: "Green Horizon",
    minRecycled: 15,
    color: "#22c55e",
    message: "Forests are spreading across the surface. Your planet is coming alive.",
  },
  {
    level: 4,
    name: "Thriving Earth",
    minRecycled: 30,
    color: "#10b981",
    message: "Ecosystems are flourishing. You're making a real difference.",
  },
  {
    level: 5,
    name: "Living Paradise",
    minRecycled: 60,
    color: "#14b8a6",
    message: "A vibrant paradise — a Guardian-level planet. Incredible work!",
  },
];

export type PlanetProgress = {
  stage: PlanetStage;
  nextStage: PlanetStage | null;
  /** Progress within the current stage toward the next, 0..1 (1 when maxed). */
  levelProgress: number;
  /** Recycled items still needed to reach the next stage (0 when maxed). */
  itemsToNext: number;
};

export function getPlanetStage(recycledCount: number): PlanetProgress {
  let stage = PLANET_STAGES[0];
  for (const candidate of PLANET_STAGES) {
    if (recycledCount >= candidate.minRecycled) stage = candidate;
  }

  const index = PLANET_STAGES.indexOf(stage);
  const nextStage = PLANET_STAGES[index + 1] ?? null;

  if (!nextStage) {
    return { stage, nextStage: null, levelProgress: 1, itemsToNext: 0 };
  }

  const span = nextStage.minRecycled - stage.minRecycled;
  const into = recycledCount - stage.minRecycled;

  return {
    stage,
    nextStage,
    levelProgress: span > 0 ? Math.min(into / span, 1) : 1,
    itemsToNext: Math.max(nextStage.minRecycled - recycledCount, 0),
  };
}

/**
 * Planet health in 0..1. Blends the recycled-to-wasted ratio (quality) with a
 * saturating volume bonus (rewards recycling more in absolute terms). A brand
 * new profile reads 0 — a barren planet waiting to be revived.
 */
export function getPlanetHealth(
  recycledCount: number,
  wastedCount: number,
  totalScans: number,
): number {
  if (totalScans <= 0) return 0;

  const sorted = recycledCount + wastedCount;
  const ratio = sorted > 0 ? recycledCount / sorted : 0;
  const volume = 1 - Math.exp(-recycledCount / 20);
  const health = ratio * 0.45 + volume * 0.55;

  return Math.max(0, Math.min(1, health));
}
