import { Storage, STORAGE_KEYS } from "./storage";

export type WasteCategory =
  | "plastic"
  | "glass"
  | "paper"
  | "cardboard"
  | "metal"
  | "food"
  | "electronics"
  | "unknown";

export type ScanRecord = {
  id: string;
  timestamp: number;
  objectLabel: string;
  category: WasteCategory;
  recyclingAdvice: string;
  upcyclingIdeas: string[];
};

export type CategoryStats = Record<WasteCategory, number>;

export type UserProfile = {
  name: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanStreak: number;
  lastScanDate: string | null;
  lastScanLabel: string | null;
  categoryStats: CategoryStats;
  scanHistory: ScanRecord[];
};

export type Level = {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
};

export const LEVELS: Level[] = [
  { level: 1, title: "Eco Beginner", minPoints: 0, maxPoints: 99 },
  { level: 2, title: "Green Scout", minPoints: 100, maxPoints: 249 },
  { level: 3, title: "Eco Warrior", minPoints: 250, maxPoints: 499 },
  { level: 4, title: "Sustainability Pro", minPoints: 500, maxPoints: 999 },
  { level: 5, title: "Planet Guardian", minPoints: 1000, maxPoints: Infinity },
];

export function getLevelForPoints(points: number): Level {
  return [...LEVELS].reverse().find((level) => points >= level.minPoints) ?? LEVELS[0];
}

export function getProgressToNextLevel(points: number): number {
  const current = getLevelForPoints(points);
  if (current.maxPoints === Infinity) return 1;
  const range = current.maxPoints - current.minPoints + 1;
  const progress = points - current.minPoints;
  return Math.min(progress / range, 1);
}

const BASE_SCAN_POINTS = 10;
const NEW_CATEGORY_BONUS = 25;
const STREAK_BONUS = 15;
const STREAK_THRESHOLD = 3;

export type ScanPointsResult = {
  points: number;
  awarded: boolean;
  reason: "awarded" | "duplicate" | "unknown";
};

export function calcPointsForScan(
  category: WasteCategory,
  objectLabel: string,
  categoryStats: CategoryStats,
  scanStreak: number,
  lastScanLabel?: string | null,
): ScanPointsResult {
  if (category === "unknown") {
    return { points: 0, awarded: false, reason: "unknown" };
  }

  const normalizedLabel = objectLabel.trim().toLowerCase();
  const normalizedPrevious = lastScanLabel?.trim().toLowerCase();

  if (normalizedLabel && normalizedPrevious === normalizedLabel) {
    return { points: 0, awarded: false, reason: "duplicate" };
  }

  let points = BASE_SCAN_POINTS;
  if (categoryStats[category] === 0) points += NEW_CATEGORY_BONUS;
  if (scanStreak > 0 && scanStreak % STREAK_THRESHOLD === 0) {
    points += STREAK_BONUS;
  }

  return { points, awarded: true, reason: "awarded" };
}

export function emptyProfile(): UserProfile {
  return {
    name: "",
    characterIndex: 0,
    ecoPoints: 0,
    totalScans: 0,
    scanStreak: 0,
    lastScanDate: null,
    lastScanLabel: null,
    categoryStats: {
      plastic: 0,
      glass: 0,
      paper: 0,
      cardboard: 0,
      metal: 0,
      food: 0,
      electronics: 0,
      unknown: 0,
    },
    scanHistory: [],
  };
}

function normalizeProfile(profile: UserProfile): UserProfile {
  const fallback = emptyProfile();

  return {
    ...fallback,
    ...profile,
    lastScanLabel: profile.lastScanLabel ?? null,
    categoryStats: {
      ...fallback.categoryStats,
      ...profile.categoryStats,
    },
    scanHistory: profile.scanHistory ?? [],
  };
}

export const ProfileService = {
  async load(): Promise<UserProfile | null> {
    const profile = await Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
    return profile ? normalizeProfile(profile) : null;
  },

  async save(profile: UserProfile): Promise<boolean> {
    const toSave: UserProfile = {
      ...profile,
      scanHistory: profile.scanHistory.slice(0, 100),
    };
    return Storage.set(STORAGE_KEYS.PROFILE, toSave);
  },

  async clear(): Promise<boolean> {
    return Storage.remove(STORAGE_KEYS.PROFILE);
  },
};
