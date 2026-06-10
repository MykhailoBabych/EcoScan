import { Storage, STORAGE_KEYS } from './storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WasteCategory =
  | 'plastic'
  | 'glass'
  | 'paper'
  | 'cardboard'
  | 'metal'
  | 'food'
  | 'electronics'
  | 'unknown';

export type ScanRecord = {
  id: string;
  timestamp: number;
  objectLabel: string;
  category: WasteCategory;
  recyclingAdvice: string;
  upcyclingIdeas: string[];
};

export type CategoryStats = Record<WasteCategory, number>;

export type UseType = 'personal' | 'school';
export type SchoolRole = 'teacher' | 'student';

export type UserProfile = {
  name: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanStreak: number;         // consecutive scans for bonus tracking
  lastScanDate: string | null; // ISO date string YYYY-MM-DD
  categoryStats: CategoryStats;
  scanHistory: ScanRecord[];
  useType: UseType | null;
  schoolRole: SchoolRole | null;
};

// ─── Level System ─────────────────────────────────────────────────────────────

export type Level = {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
};

export const LEVELS: Level[] = [
  { level: 1, title: 'Eco Beginner',       minPoints: 0,    maxPoints: 99    },
  { level: 2, title: 'Green Scout',        minPoints: 100,  maxPoints: 249   },
  { level: 3, title: 'Eco Warrior',        minPoints: 250,  maxPoints: 499   },
  { level: 4, title: 'Sustainability Pro', minPoints: 500,  maxPoints: 999   },
  { level: 5, title: 'Planet Guardian',    minPoints: 1000, maxPoints: Infinity },
];

export function getLevelForPoints(points: number): Level {
  return (
    [...LEVELS].reverse().find((l) => points >= l.minPoints) ?? LEVELS[0]
  );
}

export function getProgressToNextLevel(points: number): number {
  const current = getLevelForPoints(points);
  if (current.maxPoints === Infinity) return 1;
  const range = current.maxPoints - current.minPoints + 1;
  const progress = points - current.minPoints;
  return Math.min(progress / range, 1);
}

// ─── Points Logic ─────────────────────────────────────────────────────────────

const BASE_SCAN_POINTS = 10;
const NEW_CATEGORY_BONUS = 25;
const STREAK_BONUS = 15;
const STREAK_THRESHOLD = 3;

export function calcPointsForScan(
  category: WasteCategory,
  categoryStats: CategoryStats,
  scanStreak: number,
): number {
  let points = BASE_SCAN_POINTS;
  if (categoryStats[category] === 0) points += NEW_CATEGORY_BONUS;
  if (scanStreak > 0 && scanStreak % STREAK_THRESHOLD === 0) points += STREAK_BONUS;
  return points;
}

// ─── Default values ───────────────────────────────────────────────────────────

export function emptyProfile(): UserProfile {
  return {
    name: '',
    characterIndex: 0,
    ecoPoints: 0,
    totalScans: 0,
    scanStreak: 0,
    lastScanDate: null,
    categoryStats: {
      plastic: 0, glass: 0, paper: 0,
      cardboard: 0, metal: 0, food: 0,
      electronics: 0, unknown: 0,
    },
    scanHistory: [],
    useType: null,
    schoolRole: null,
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────

export const ProfileService = {
  async load(): Promise<UserProfile | null> {
    return Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
  },

  async save(profile: UserProfile): Promise<boolean> {
    // Keep only the last 100 scans in storage
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
